import { useSyncExternalStore } from "react";

import { currentSession as seedSession, currentStudent, institution, students } from "./mock-data";
import type { CheckInChannel, Visit } from "./types";

export interface ActiveSession {
  studentId: string;
  checkedInAt: string;
  checkedInAtMs: number;
  channel: CheckInChannel;
  library: string;
  deviceId: string | null;
}

interface StoreState {
  sessions: Record<string, ActiveSession>;
  completed: Record<string, Visit[]>;
  /** Device the student says they brought today: undefined = not answered, null = no laptop. */
  todayDevice: Record<string, string | null | undefined>;
}

const MAIN_LIBRARY = institution.libraries[0] ?? "Main Library";

function seed(): StoreState {
  const startedMs = Date.now() - 1000 * 60 * 97;
  return {
    sessions: seedSession.active
      ? {
          [currentStudent.id]: {
            studentId: currentStudent.id,
            checkedInAt: seedSession.checkedInAt,
            checkedInAtMs: startedMs,
            channel: seedSession.channel,
            library: seedSession.library,
            deviceId: seedSession.deviceId,
          },
        }
      : {},
    completed: {},
    todayDevice: {},
  };
}

let state: StoreState = seed();
const listeners = new Set<() => void>();

function emit() {
  state = {
    sessions: { ...state.sessions },
    completed: { ...state.completed },
    todayDevice: { ...state.todayDevice },
  };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isoDate(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function getSession(studentId: string): ActiveSession | undefined {
  return state.sessions[studentId];
}

export function checkIn(studentId: string, channel: CheckInChannel): ActiveSession {
  const student = students.find((s) => s.id === studentId);
  const now = Date.now();
  const answered = Object.prototype.hasOwnProperty.call(state.todayDevice, studentId);
  const declared = state.todayDevice[studentId] ?? null;
  const session: ActiveSession = {
    studentId,
    checkedInAt: clockTime(now),
    checkedInAtMs: now,
    channel,
    library: MAIN_LIBRARY,
    deviceId: answered ? declared : channel === "qr" ? student?.devices[0]?.id ?? null : null,
  };
  state.sessions[studentId] = session;
  emit();
  return session;
}

/** Ends an open session and records the completed visit. Returns it, or null if not inside. */
export function checkOut(studentId: string): Visit | null {
  const session = state.sessions[studentId];
  if (!session) return null;
  const now = Date.now();
  const visit: Visit = {
    id: `${studentId}_live_${now}`,
    studentId,
    date: isoDate(now),
    checkIn: session.checkedInAt,
    checkOut: clockTime(now),
    durationMinutes: Math.max(1, Math.round((now - session.checkedInAtMs) / 60000)),
    deviceId: session.deviceId,
    channel: session.channel,
    library: session.library,
  };
  delete state.sessions[studentId];
  delete state.todayDevice[studentId];
  state.completed[studentId] = [visit, ...(state.completed[studentId] ?? [])];
  emit();
  return visit;
}

/** Records the answer to "did you bring a laptop today?" — pass null for no laptop. */
export function setTodayDevice(studentId: string, deviceId: string | null) {
  state.todayDevice[studentId] = deviceId;
  emit();
}

export function clearTodayDevice(studentId: string) {
  delete state.todayDevice[studentId];
  emit();
}

/** undefined = question not answered yet, null = came without a laptop. */
export function useTodayDevice(studentId: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => state.todayDevice[studentId],
    () => undefined,
  );
}

export function useSession(studentId: string): ActiveSession | undefined {
  return useSyncExternalStore(
    subscribe,
    () => state.sessions[studentId],
    () => undefined,
  );
}

/** Recorded visits from this browser session, newest first. */
export function useCompletedVisits(studentId: string): Visit[] {
  return useSyncExternalStore(
    subscribe,
    () => state.completed[studentId] ?? EMPTY,
    () => EMPTY,
  );
}

const EMPTY: Visit[] = [];

export function currentlyInsideCount(): number {
  return Object.keys(state.sessions).length;
}
