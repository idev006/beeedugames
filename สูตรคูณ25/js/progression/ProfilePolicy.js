const UNSAFE_PATTERN = /[<>\u0000-\u001f\u007f]/g;
const URL_PATTERN = /(?:https?:\/\/|www\.)/i;
const PHONE_PATTERN = /(?:\d[\s-]*){8,}/;

export class ProfilePolicy {
  static sanitizeDisplayName(value, fallback = "นักซ่อมแสง") {
    const normalized = String(value ?? "")
      .normalize("NFC")
      .replace(UNSAFE_PATTERN, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12);
    if (!normalized || URL_PATTERN.test(normalized) || PHONE_PATTERN.test(normalized)) return fallback;
    return normalized;
  }
}
