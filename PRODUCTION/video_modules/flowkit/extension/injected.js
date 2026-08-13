/**
 * Injected into MAIN world on labs.google — has access to window.grecaptcha
 * Also intercepts TRPC fetch responses to capture fresh signed media URLs.
 *
 * Wrapped in an IIFE with a re-injection guard: content.js re-injects this
 * script on every page load, and the extension reloading while a tab stays
 * open can leave a stale copy resident — a second injection previously
 * crashed with "Identifier 'SITE_KEY' has already been declared" (top-level
 * const redeclaration), silently killing the TRPC intercept below without
 * any visible error tying it back to this file (2026-08-13).
 */
(function () {
  if (window.__flowAgentInjected) return;
  window.__flowAgentInjected = true;

  const SITE_KEY = '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV';

  // ─── TRPC Response Monitor ─────────────────────────────────
  // Monkey-patch fetch to intercept TRPC responses containing media URLs.
  // Fresh signed GCS URLs are extracted and forwarded to the agent.

  const _originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await _originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      // Only intercept TRPC calls on labs.google that return project/flow data
      if (url.includes('/fx/api/trpc/') && response.ok) {
        const clone = response.clone();
        clone.text().then(text => {
          if (text.includes('storage.googleapis.com/ai-sandbox-videofx/') || text.includes('flow-content.google/')) {
            window.dispatchEvent(new CustomEvent('TRPC_MEDIA_URLS', {
              detail: { url, body: text },
            }));
          }
        }).catch(() => {});
      }
    } catch {}
    return response;
  };

  window.addEventListener('GET_CAPTCHA', async ({ detail }) => {
    const { requestId, pageAction } = detail;
    try {
      await waitForGrecaptcha();
      const token = await window.grecaptcha.enterprise.execute(SITE_KEY, {
        action: pageAction,
      });
      window.dispatchEvent(new CustomEvent('CAPTCHA_RESULT', {
        detail: { requestId, token },
      }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('CAPTCHA_RESULT', {
        detail: { requestId, error: e.message },
      }));
    }
  });

  function waitForGrecaptcha(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (window.grecaptcha?.enterprise?.execute) return resolve();
        if (Date.now() - start > timeout) return reject(new Error('grecaptcha not available'));
        setTimeout(check, 200);
      };
      check();
    });
  }
})();
