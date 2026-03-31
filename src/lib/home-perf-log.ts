/**
 * Homepage performance instrumentation.
 * Logs to console with [HOME] prefix. Attaches PerformanceObserver for
 * LCP, CLS, and paint. Also exports helpers for image-load and masonry
 * layout sampling.
 *
 * All functions are no-ops in production unless ?perf=1 is in the URL.
 *
 * NOTE: sampleMasonryStability() is initial-load only — it samples for
 * ~1 second after the first client render. A later "masonry stable" log
 * does NOT mean the whole page is stable; it only means no reflows were
 * detected during that opening window.
 */

const enabled = () =>
  typeof window !== "undefined" &&
  (process.env.NODE_ENV === "development" ||
    new URLSearchParams(window.location.search).has("perf"));

export function perfLog(event: string, data?: Record<string, unknown>) {
  if (!enabled()) return;
  console.log(`[HOME] ${event}`, { t: Math.round(performance.now()), ...data });
}

// ---- singleton guard ----
let perfObserverInitialized = false;

// When document.fonts.ready resolves we store the timestamp so CLS entries
// can be labelled "before-fonts" or "after-fonts".
let fontsReadyAt: number | null = null;

/** Call once on the feed component mount to attach PerformanceObserver. */
export function initPerfObserver() {
  if (!enabled()) return;
  if (perfObserverInitialized) return;
  perfObserverInitialized = true;

  if (typeof PerformanceObserver === "undefined") return;

  // Track when fonts are ready so CLS entries can be correlated.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      fontsReadyAt = performance.now();
      perfLog("fonts ready", { fontsReadyAt: Math.round(fontsReadyAt) });
    });
  }

  // LCP — buffer the latest candidate; flush final value on page hide/unload.
  let latestLcp: Record<string, unknown> | null = null;

  const flushLcp = () => {
    if (latestLcp) {
      perfLog("LCP (final)", latestLcp);
      latestLcp = null;
    }
  };

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcp = entry as PerformanceEntry & {
          element?: Element;
          url?: string;
          size?: number;
          loadTime?: number;
          renderTime?: number;
        };
        // Overwrite with each newer candidate; only the last one matters.
        latestLcp = {
          t_lcp: Math.round(lcp.startTime),
          size: lcp.size,
          url: lcp.url,
          renderTime: lcp.renderTime ? Math.round(lcp.renderTime) : undefined,
          loadTime: lcp.loadTime ? Math.round(lcp.loadTime) : undefined,
          element: lcp.element ? describeElement(lcp.element) : undefined,
        };
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch { /* unsupported */ }

  // Flush final LCP candidate when the page is hidden or unloaded.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushLcp();
  }, { once: true });
  window.addEventListener("pagehide", flushLcp, { once: true });

  // CLS — tag each shift as before-fonts or after-fonts.
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const cls = entry as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
          sources?: Array<{
            node?: Node;
            currentRect?: DOMRectReadOnly;
            previousRect?: DOMRectReadOnly;
          }>;
        };
        if (cls.hadRecentInput) continue;
        if (!cls.value || cls.value < 0.001) continue;

        const phase = fontsReadyAt
          ? (entry.startTime < fontsReadyAt ? "before-fonts" : "after-fonts")
          : "before-fonts";

        const sources = (cls.sources ?? []).map((s) => ({
          node: s.node ? describeElement(s.node as Element) : undefined,
          delta: s.currentRect && s.previousRect
            ? {
                dy: Math.round(s.currentRect.top - s.previousRect.top),
                dx: Math.round(s.currentRect.left - s.previousRect.left),
              }
            : undefined,
        }));

        perfLog("CLS shift", { value: cls.value.toFixed(4), phase, sources });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch { /* unsupported */ }

  // Paint (FCP)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        perfLog("paint", { name: entry.name, t: Math.round(entry.startTime) });
      }
    }).observe({ type: "paint", buffered: true });
  } catch { /* unsupported */ }
}

/**
 * Call from image onLoad to record rendered vs natural dimensions.
 * Only call for initial viewport cards (e.g. index < 6) to keep logs focused.
 */
export function logImageLoad(
  postId: string,
  priority: boolean,
  dbWidth: number | null,
  dbHeight: number | null,
  e: React.SyntheticEvent<HTMLImageElement>,
) {
  if (!enabled()) return;
  const img = e.currentTarget;
  perfLog("image loaded", {
    postId: String(postId),
    priority,
    rendered: { w: img.clientWidth, h: img.clientHeight },
    natural: { w: img.naturalWidth, h: img.naturalHeight },
    dbDims: dbWidth && dbHeight ? { w: dbWidth, h: dbHeight } : "missing",
    missingDbDims: !dbWidth || !dbHeight,
  });
}

/**
 * Sample masonry container height + column top offsets via rAF for ~1 second
 * after initial client render. Logs whenever the container height changes.
 *
 * INITIAL-LOAD ONLY: this sampler does not cover later reshuffles caused by
 * infinite scroll or state changes. "masonry stable (sampling done)" only
 * means no reflows were detected in the opening ~1 second.
 */
export function sampleMasonryStability(container: HTMLElement) {
  if (!enabled()) return;
  let lastH = container.getBoundingClientRect().height;
  let frames = 0;
  const maxFrames = 60; // ~1 s at 60 fps

  const tick = () => {
    frames++;
    const h = container.getBoundingClientRect().height;
    if (Math.abs(h - lastH) > 1) {
      const cols = container.querySelectorAll(".masonry-grid_column");
      const colTops = Array.from(cols).map((c) =>
        Math.round((c as HTMLElement).getBoundingClientRect().top),
      );
      perfLog("masonry reflow", {
        prevH: Math.round(lastH),
        newH: Math.round(h),
        delta: Math.round(h - lastH),
        frame: frames,
        colTops,
      });
      lastH = h;
    }
    if (frames < maxFrames) requestAnimationFrame(tick);
    else perfLog("masonry stable (sampling done)", { finalH: Math.round(h), frames });
  };

  requestAnimationFrame(tick);
}

// ---- helpers ----

function describeElement(el: Element): string {
  if (!el) return "(null)";
  const tag = el.tagName?.toLowerCase() ?? "?";
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className
    ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")}`
    : "";
  const src = (el as HTMLImageElement).src
    ? ` src="${(el as HTMLImageElement).src.slice(0, 80)}"`
    : "";
  return `${tag}${id}${cls}${src}`;
}
