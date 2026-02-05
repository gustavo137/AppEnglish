import type { VerbItem } from "./types";

// Load from public/verbs.json (cached by the service worker)
export async function loadVerbs(): Promise<VerbItem[]> {
  const res = await fetch("/verbs.json");
  if (!res.ok) throw new Error(`Failed to load verbs.json: ${res.status}`);
  const data = (await res.json()) as VerbItem[];
  return data;
}

// Some entries in your sample are unsplash *page* URLs, not direct images.
// This helper tries to convert unsplash photo page URLs into images.unsplash.com URLs.
// If conversion fails, it returns the original.
export function normalizeImageUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "unsplash.com") {
      // /photos/<id> or /photos/<id>/<slug>
      const m = u.pathname.match(/^\/photos\/([A-Za-z0-9_-]+)/);
      if (m?.[1]) {
        const id = m[1];
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=60`;
      }
    }
  } catch {
    // ignore
  }
  return url;
}

export function sampleWithout<T>(arr: T[], excludeIndex: number): T[] {
  return arr.filter((_, i) => i !== excludeIndex);
}

export function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
