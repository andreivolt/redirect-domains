import redirects from '../redirects.json';

export default defineContentScript({
  matches: redirects.flatMap((r) => r.from.map((host) => `*://${host}/*`)),
  runAt: 'document_start',
  async main() {
    const { disabledDomains } = await chrome.storage.local.get('disabledDomains');
    const disabled = new Set(disabledDomains || []);
    // A rule's `from` lists every alias of one logical redirect; its first entry is the rule's identity in the disabled set. `exclude` is a regex over path+query for pages that only exist on the source site (e.g. new-reddit-only surfaces like /poll or /settings, and share links the source must resolve first).
    const match = redirects.find(
      (r) =>
        r.from.includes(location.hostname) &&
        !disabled.has(r.from[0]) &&
        !(r.exclude !== undefined && new RegExp(r.exclude).test(location.pathname + location.search)),
    );
    if (match) {
      location.replace(location.href.replace(location.hostname, match.to));
    }
  },
});
