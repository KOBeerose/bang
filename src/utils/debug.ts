type DebugLevel = "log" | "warn" | "error";

type DebugPayload = Record<string, unknown> | undefined;

export interface ReBangDebugEvent {
  time: string;
  level: DebugLevel;
  event: string;
  payload?: DebugPayload;
  href?: string;
}

declare global {
  interface Window {
    __rebangDebugEvents?: ReBangDebugEvent[];
    __setReBangDebug?: (enabled: boolean) => void;
  }
}

const DEBUG_STORAGE_KEY = "rebang_debug";
const MAX_DEBUG_EVENTS = 100;

function parseDebugToggle(value: string | null): boolean | null {
  if (value === null) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "" || ["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return true;
}

export function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const queryToggle = parseDebugToggle(
    params.get("debug") ?? params.get("rebangDebug")
  );

  if (queryToggle !== null) return queryToggle;

  try {
    const storedToggle = parseDebugToggle(localStorage.getItem(DEBUG_STORAGE_KEY));
    if (storedToggle !== null) return storedToggle;
  } catch {
    // Ignore localStorage access issues in private browsing or restricted environments.
  }

  return false;
}

export function setDebugEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(DEBUG_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore localStorage access issues.
  }
}

function recordDebugEvent(level: DebugLevel, event: string, payload?: DebugPayload): void {
  if (typeof window === "undefined") return;

  const entry: ReBangDebugEvent = {
    time: new Date().toISOString(),
    level,
    event,
    payload,
    href: window.location.href,
  };

  const events = window.__rebangDebugEvents ?? [];
  events.push(entry);
  window.__rebangDebugEvents = events.slice(-MAX_DEBUG_EVENTS);
}

function writeConsole(level: DebugLevel, event: string, payload?: DebugPayload): void {
  const message = `[ReBang Debug] ${event}`;

  switch (level) {
    case "warn":
      console.warn(message, payload ?? {});
      break;
    case "error":
      console.error(message, payload ?? {});
      break;
    default:
      console.log(message, payload ?? {});
      break;
  }
}

function emitDebug(level: DebugLevel, event: string, payload?: DebugPayload): void {
  recordDebugEvent(level, event, payload);

  if (!isDebugEnabled()) return;
  writeConsole(level, event, payload);
}

export function debugLog(event: string, payload?: DebugPayload): void {
  emitDebug("log", event, payload);
}

export function debugWarn(event: string, payload?: DebugPayload): void {
  emitDebug("warn", event, payload);
}

export function debugError(
  event: string,
  error: unknown,
  payload?: DebugPayload
): void {
  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { value: String(error) };

  emitDebug("error", event, {
    ...payload,
    error: errorDetails,
  });
}

if (typeof window !== "undefined") {
  window.__setReBangDebug = setDebugEnabled;
}
