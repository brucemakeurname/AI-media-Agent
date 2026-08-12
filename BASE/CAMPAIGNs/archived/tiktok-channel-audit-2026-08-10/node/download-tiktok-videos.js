const fs = require('fs');
const https = require('https');
const path = require('path');

const campaignDirectory = path.resolve(__dirname, '..');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const fallbackOnly = process.argv.includes('--fallback-only');

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : require('http');
    const requestObject = client.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers,
      },
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        resolve(request(new URL(response.headers.location, url).toString(), headers));
        return;
      }
      resolve(response);
    }).on('error', reject);
    requestObject.setTimeout(90000, () => requestObject.destroy(new Error('Request timed out')));
  });
}

async function readResponse(response) {
  const chunks = [];
  for await (const chunk of response) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

async function getMediaStream(job) {
  if (!fallbackOnly) {
    try {
      const page = await request(job.webVideoUrl, { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' });
      if (page.statusCode === 200) {
        const html = await readResponse(page);
        const script = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s);
        if (script) {
          const detail = JSON.parse(script[1])['__DEFAULT_SCOPE__']?.['webapp.video-detail'];
          const playAddress = detail?.itemInfo?.itemStruct?.video?.playAddr;
          if (playAddress) {
            const cookie = (page.headers['set-cookie'] || []).map((v) => v.split(';')[0]).join('; ');
            const video = await request(playAddress, { Accept: '*/*', Cookie: cookie, Referer: job.webVideoUrl });
            if (video.statusCode >= 200 && video.statusCode < 300) {
              return video;
            }
          }
        }
      }
    } catch (e) {}
  }

  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(job.webVideoUrl)}`;
  const response = await request(apiUrl, { Accept: 'application/json' });
  const text = await readResponse(response);
  const json = JSON.parse(text);
  const mediaUrl = json?.data?.play;
  if (!mediaUrl) throw new Error(`TikWM API failed: ${json?.msg || 'no play URL'}`);
  const video = await request(mediaUrl, { Accept: '*/*', Referer: 'https://www.tikwm.com/' });
  if (video.statusCode < 200 || video.statusCode >= 300) throw new Error(`Fallback media returned HTTP ${video.statusCode}`);
  return video;
}

async function download(job) {
  const video = await getMediaStream(job);
  const temporaryPath = `${job.outputPath}.partial`;
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(temporaryPath);
    video.pipe(output);
    video.on('error', reject);
    output.on('error', reject);
    output.on('finish', resolve);
  });
  const size = fs.statSync(temporaryPath).size;
  if (size < 1024) throw new Error(`Downloaded file is too small (${size} bytes)`);
  fs.renameSync(temporaryPath, job.outputPath);
  return size;
}

function jobsFor(fileName, folder) {
  const selection = JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf8'));
  const outputDirectory = path.join(campaignDirectory, 'videos', folder);
  fs.mkdirSync(outputDirectory, { recursive: true });
  return selection.map((video) => ({
    ...video,
    group: folder,
    outputPath: path.join(outputDirectory, `${String(video.rank).padStart(2, '0')}-${video.id}.mp4`),
  }));
}

async function main() {
  const jobs = [
    ...jobsFor('top-20-selection.json', 'top-20'),
    ...jobsFor('recent-30-selection.json', 'recent-30'),
  ];
  const report = [];

  for (const job of jobs) {
    try {
      const bytes = fs.existsSync(job.outputPath) && fs.statSync(job.outputPath).size >= 1024
        ? fs.statSync(job.outputPath).size
        : await download(job);
      report.push({ ...job, status: 'downloaded', bytes });
      console.log(`OK ${job.group} #${job.rank}: ${job.id}`);
    } catch (error) {
      report.push({ ...job, status: 'failed', error: error.message });
      console.error(`FAIL ${job.group} #${job.rank}: ${job.id}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  report.sort((left, right) => left.group.localeCompare(right.group) || left.rank - right.rank);
  fs.writeFileSync(path.join(__dirname, 'download-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.filter((item) => item.status === 'failed');
  console.log(`Completed ${report.length - failed.length}/${report.length} downloads.`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
