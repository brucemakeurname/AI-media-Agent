import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readJson = async (file) => JSON.parse(await readFile(join(root, file), 'utf8'));
const sceneMap = await readJson('scene-map.json');
const moduleMap = await readJson('modules/module-map.json');
const motionTokens = await readJson('motion/motion-tokens.json');
const blueprintMap = await readJson('animations/blueprint-map.json');
const bgmPolicy = await readJson('audio/bgm-policy.json');
const css = await readFile(join(root, 'style.css'), 'utf8');
const animation = await readFile(join(root, 'animation.js'), 'utf8');

assert.equal(sceneMap.preset, 'ultimatesup');
assert.equal(sceneMap.base_preset, 'blockframe');
assert.equal(sceneMap.stage.width, 1080);
assert.equal(sceneMap.stage.height, 1920);
assert.equal(sceneMap.stage.coverage, 'full');
assert.equal(sceneMap.stage.background, 'transparent');
assert.doesNotMatch(css, /height:\s*640px/);
assert.doesNotMatch(animation, /usLowerThirdEntry|broadcast-interview-lower-third/);
assert.deepEqual(Object.keys(sceneMap.scenes).sort(), Object.keys(moduleMap.modules).sort());
assert.match(css, /data-preset="ultimatesup"/);
assert.match(css, /Archivo/);
assert.doesNotMatch(css, /Instrument Serif|JetBrains Mono/);
assert.match(css, /us-brand-strip/);
assert.match(css, /us-info-box/);
assert.match(css, /us-info-box\.is-centered/);
assert.match(css, /rgba\(255, 255, 255, 0\.9\)/);
assert.match(css, /height:\s*320px/);
assert.ok(motionTokens.timing.exit_lead > 0);
assert.equal(blueprintMap.preset, 'ultimatesup');
assert.deepEqual(Object.keys(blueprintMap.modules).sort(), Object.keys(moduleMap.modules).sort());
assert.equal(bgmPolicy.library, 'BASE/BRAND KITs/UltimateSup/BGM');
assert.equal(bgmPolicy.default_track, 'bgm_ugc_funky_hiphop_lifestyle.mp3');
assert.equal(bgmPolicy.default_enabled, true);
assert.equal(bgmPolicy.default_gain_db, -17);

for (const [name, module] of Object.entries(moduleMap.modules)) {
  const template = await readFile(join(root, 'modules', module.template), 'utf8');
  assert.match(template, new RegExp(`data-module="${name}"`));
  if (template.includes('us-info-box')) assert.match(template, /centered/);
  assert.match(animation, new RegExp(`['"]${module.animator}['"]`));
  assert.ok(module.blueprints?.length >= 2);
  assert.equal(blueprintMap.modules[name].primary, module.blueprints[0]);
}

console.log(`ultimatesup preset ok: ${Object.keys(moduleMap.modules).length} modules`);
