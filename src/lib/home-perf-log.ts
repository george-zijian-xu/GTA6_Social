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
  new URLSearchParams(window.location.search).has("perf");

export function perfLog(event: string, data?: Record<string, unknown> | unknown) {
  if (!enabled()) return;
  console.log(`[HOME] ${event}`, { t: Math.round(performance.now()), ...(data as Record<string, unknown>) });
}

// ---- Session state ----
let perfObserverInitialized = false;
let fontsReadyAt: number | null = null;
let clsTotal = 0;
const clsSourceFreq = new Map<string, number>();

// Buffer for image load events that arrive before viewport detection completes
interface PendingImageLoad {
  postId: string;
  priority: boolean;
  dbWidth: number | null;
  dbHeight: number | null;
  rendered: { w: number; h: number };
  natural: { w: number; h: number };
}
const pendingImageLoads: PendingImageLoad[] = [];
let viewportDetectionComplete = false;
let viewportObserverDone = false;

/** Reset all module-level state for fresh instrumentation on repeated visits */
export function resetHomePerfSession() {
  if (!enabled()) return;
  // Do NOT reset perfObserverInitialized — leave observers attached to avoid duplicates
  fontsReadyAt = null;
  clsTotal = 0;
  clsSourceFreq.clear();
  pendingImageLoads.length = 0;
  viewportDetectionComplete = false;
  viewportObserverDone = false;
  if (window.homePerfSession) {
    window.homePerfSession.lcpFinal = null;
    window.homePerfSession.clsTotal = 0;
    window.homePerfSession.clsTopSources = [];
    window.homePerfSession.firstVisiblePostIds = [];
  }
}

interface LcpData {
  t_lcp: number;
  size?: number;
  url?: string;
  renderTime?: number;
  loadTime?: number;
  element?: string;
  postId?: string | null;
  cardIndex?: string | null;
  hadPriority?: boolean;
}

interface SessionData {
  lcpFinal: LcpData | null;
  clsTotal: number;
  clsTopSources: Array<{ selector: string; count: number }>;
  firstVisiblePostIds: string[];
}

declare global {
  interface Window {
    homePerfSession?: SessionData;
  }
}

if (typeof window !== "undefined" && enabled()) {
  window.homePerfSession = {
    lcpFinal: null,
    clsTotal: 0,
    clsTopSources: [],
    firstVisiblePostIds: [],
  };
}

/** Call once on the feed component mount to attach PerformanceObserver. */
export function initPerfObserver() {
  if (!enabled()) return;
  if (perfObserverInitialized) return;
  perfObserverInitialized = true;

  if (typeof PerformanceObserver === "undefined") return;

  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      fontsReadyAt = performance.now();
      perfLog("fonts ready", { fontsReadyAt: Math.round(fontsReadyAt) });
    });
  }

  let latestLcp: LcpData | null = null;

  const flushLcp = () => {
    if (latestLcp && window.homePerfSession) {
      window.homePerfSession.lcpFinal = latestLcp;
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
        const el = lcp.element;
        const postId = el?.getAttribute?.("data-post-id");
        const cardIndex = el?.getAttribute?.("data-card-index");
        const hadPriority = el?.getAttribute?.("data-had-priority") === "true";
        
        latestLcp = {
          t_lcp: Math.round(lcp.startTime),
          size: lcp.size,
          url: lcp.url,
          renderTime: lcp.renderTime ? Math.round(lcp.renderTime) : undefined,
          loadTime: lcp.loadTime ? Math.round(lcp.loadTime) : undefined,
          element: el ? describeElement(el) : undefined,
          postId,
          cardIndex,
          hadPriority,
        };
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch { /* unsupported */ }

  const flushAll = () => {
    flushLcp();
    if (window.homePerfSession) {
      window.homePerfSession.clsTotal = clsTotal;
      window.homePerfSession.clsTopSources = Array.from(clsSourceFreq.entries())
        .map(([selector, count]) => ({ selector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      perfLog("session summary", {
        clsTotal: clsTotal.toFixed(4),
        topShifters: window.homePerfSession.clsTopSources,
        lcpElement: window.homePerfSession.lcpFinal?.element,
        lcpPostId: window.homePerfSession.lcpFinal?.postId,
        lcpHadPriority: window.homePerfSession.lcpFinal?.hadPriority,
        firstVisiblePostIds: window.homePerfSession.firstVisiblePostIds,
      });
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll();
  }, { once: true });
  window.addEventListener("pagehide", flushAll, { once: true });

  // CLS — track frequency of each source selector
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

        clsTotal += cls.value;

        const phase = fontsReadyAt
          ? (entry.startTime < fontsReadyAt ? "before-fonts" : "after-fonts")
          : "before-fonts";

        const sources = (cls.sources ?? []).map((s) => {
          const node = s.node as Element | undefined;
          const selector = node ? describeElement(node) : undefined;
          const isMasonryCol = node?.classList?.contains("masonry-grid_column");
          const postId = node?.getAttribute?.("data-post-id");
          const cardIndex = node?.getAttribute?.("data-card-index");

          if (selector) {
            clsSourceFreq.set(selector, (clsSourceFreq.get(selector) || 0) + 1);
          }

          return {
            node: selector,
            isMasonryCol,
            postId,
            cardIndex,
            delta: s.currentRect && s.previousRect
              ? {
                  dy: Math.round(s.currentRect.top - s.previousRect.top),
                  dx: Math.round(s.currentRect.left - s.previousRect.left),
                }
              : undefined,
          };
        });

        perfLog("CLS shift", {
          value: cls.value.toFixed(4),
          phase,
          clsTotal: clsTotal.toFixed(4),
          sources,
        });
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

export function logImageLoad(
  postId: string,
  priority: boolean,
  dbWidth: number | null,
  dbHeight: number | null,
  e: React.SyntheticEvent<HTMLImageElement>,
) {
  if (!enabled()) return;

  const img = e.currentTarget;
  const rendered = { w: img.clientWidth, h: img.clientHeight };
  const natural = { w: img.naturalWidth, h: img.naturalHeight };

  // If viewport detection hasn't completed yet, buffer this event
  if (!viewportDetectionComplete) {
    pendingImageLoads.push({ postId: String(postId), priority, dbWidth, dbHeight, rendered, natural });
    return;
  }

  // Only log if this post was in the initial viewport
  const visibleIds = window.homePerfSession?.firstVisiblePostIds ?? [];
  if (!visibleIds.includes(String(postId))) return;

  perfLog("image loaded", {
    postId: String(postId),
    priority,
    rendered,
    natural,
    dbDims: dbWidth && dbHeight ? { w: dbWidth, h: dbHeight } : "missing",
    missingDbDims: !dbWidth || !dbHeight,
  });
}

export function observeInitialViewport(container: HTMLElement) {
  if (!enabled()) return;
  if (viewportObserverDone) return;
  viewportObserverDone = true;
  
  const cards = container.querySelectorAll("article[data-post-id]");
  const visibleIds: string[] = [];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = (entry.target as HTMLElement).getAttribute("data-post-id");
          if (postId && !visibleIds.includes(postId)) {
            visibleIds.push(postId);
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card) => observer.observe(card));

  setTimeout(() => {
    observer.disconnect();
    if (window.homePerfSession) {
      window.homePerfSession.firstVisiblePostIds = visibleIds;
    }
    viewportDetectionComplete = true;

    // Flush buffered image loads for visible posts only
    pendingImageLoads.forEach((pending) => {
      if (visibleIds.includes(pending.postId)) {
        perfLog("image loaded", {
          postId: pending.postId,
          priority: pending.priority,
          rendered: pending.rendered,
          natural: pending.natural,
          dbDims: pending.dbWidth && pending.dbHeight ? { w: pending.dbWidth, h: pending.dbHeight } : "missing",
          missingDbDims: !pending.dbWidth || !pending.dbHeight,
        });
      }
    });
    pendingImageLoads.length = 0;

    perfLog("initial viewport cards", { count: visibleIds.length, postIds: visibleIds });
  }, 1200);
}

export function sampleMasonryStability(container: HTMLElement) {
  if (!enabled()) return;
  let lastH = container.getBoundingClientRect().height;
  let lastColCount = container.querySelectorAll(".masonry-grid_column").length;
  let frames = 0;
  const maxFrames = 60;

  const tick = () => {
    frames++;
    const h = container.getBoundingClientRect().height;
    const cols = container.querySelectorAll(".masonry-grid_column");
    const colCount = cols.length;

    if (colCount !== lastColCount) {
      perfLog("masonry column count changed", {
        prevCount: lastColCount,
        newCount: colCount,
        frame: frames,
      });
      lastColCount = colCount;
    }

    if (Math.abs(h - lastH) > 1) {
      const colTops = Array.from(cols).map((c) =>
        Math.round((c as HTMLElement).getBoundingClientRect().top),
      );
      perfLog("masonry reflow", {
        prevH: Math.round(lastH),
        newH: Math.round(h),
        delta: Math.round(h - lastH),
        frame: frames,
        colCount,
        colTops,
      });
      lastH = h;
    }
    if (frames < maxFrames) requestAnimationFrame(tick);
    else perfLog("masonry stable (sampling done)", { finalH: Math.round(h), frames, colCount });
  };

  requestAnimationFrame(tick);
}

function describeElement(el: Element): string {
  if (!el) return "(null)";
  const tag = el.tagName?.toLowerCase() ?? "?";
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className
    ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")}`
    : "";
  const postId = el.getAttribute?.("data-post-id");
  const cardIndex = el.getAttribute?.("data-card-index");
  const dataAttrs = postId ? ` [post=${postId}${cardIndex ? `,idx=${cardIndex}` : ""}]` : "";
  const src = (el as HTMLImageElement).src
    ? ` src="${(el as HTMLImageElement).src.slice(0, 60)}"`
    : "";
  return `${tag}${id}${cls}${dataAttrs}${src}`;
}
