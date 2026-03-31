// Dev-only performance logger for map debugging
const MAP_DEBUG = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MAP_DEBUG === "1";

const startTime = typeof performance !== "undefined" ? performance.now() : 0;

export function logMapPerf(event: string, data?: Record<string, unknown>) {
  if (!MAP_DEBUG) return;
  const elapsed = typeof performance !== "undefined" ? (performance.now() - startTime).toFixed(1) : "0";
  const prefix = `[MAP ${elapsed}ms]`;
  if (data) {
    console.log(prefix, event, data);
  } else {
    console.log(prefix, event);
  }
}
