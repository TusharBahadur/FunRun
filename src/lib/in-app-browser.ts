/**
 * Apps that open links in their own built-in browser (Instagram, Facebook…).
 * Google refuses to sign people in there ("disallowed_useragent"), and what's
 * saved there stays inside that app, separate from Chrome or Safari.
 */
const APPS: [RegExp, string][] = [
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/Snapchat/i, "Snapchat"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Line\//i, "LINE"],
  [/Twitter|TwitterAndroid/i, "X"],
];

/** The app whose browser this is, or null in a normal browser. Client only. */
export function inAppBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  for (const [re, name] of APPS) if (re.test(ua)) return name;
  // Android's generic WebView marker ("; wv)"): Google blocks sign-in there too.
  if (/; wv\)/.test(ua)) return "this app";
  return null;
}
