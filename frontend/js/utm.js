const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

const STORAGE_KEY = "kvarta_attribution";

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStored(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Сохраняет UTM из URL при первом заходе и отдаёт атрибуцию для заявки. */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const stored = readStored();
  let changed = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      stored[key] = value;
      changed = true;
    }
  }

  if (!stored.landing_path) {
    stored.landing_path = window.location.pathname || "/";
    changed = true;
  }

  if (!stored.referrer && document.referrer) {
    stored.referrer = document.referrer;
    changed = true;
  }

  if (changed) {
    writeStored(stored);
  }

  return {
    utm_source: stored.utm_source || null,
    utm_medium: stored.utm_medium || null,
    utm_campaign: stored.utm_campaign || null,
    utm_content: stored.utm_content || null,
    utm_term: stored.utm_term || null,
    landing_path: stored.landing_path || window.location.pathname || "/",
    referrer: stored.referrer || document.referrer || null,
    user_agent: navigator.userAgent || null,
  };
}
