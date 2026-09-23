// SBS Offline Evidence Queue & Synchronization Engine (Slice 2)
// Authoritative source: docs/evidence-and-offline.md §3

import { EvidenceType } from "../installation/types";

export interface QueuedEvidenceItem {
  clientUuid: string;
  requirementId: string;
  type: EvidenceType;
  fileRef?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  measurementValue?: string | null;
  measurementUnit?: string | null;
  deviceCapturedAt: string;
  supersedesEvidenceId?: string | null;
  gpsLat?: number | null;
  gpsLng?: number | null;
  syncStatus: "pending" | "syncing" | "failed";
  retryCount: number;
  lastError?: string | null;
}

const STORAGE_KEY = "SBS_OFFLINE_EVIDENCE_QUEUE";

export function getLocalQueue(): QueuedEvidenceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read offline queue from localStorage", e);
    return [];
  }
}

export function saveLocalQueue(queue: QueuedEvidenceItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to persist offline queue to localStorage", e);
  }
}

export function generateClientUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cli_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

export function enqueueEvidence(
  item: Omit<QueuedEvidenceItem, "clientUuid" | "deviceCapturedAt" | "syncStatus" | "retryCount">
): QueuedEvidenceItem {
  const queue = getLocalQueue();
  const queuedItem: QueuedEvidenceItem = {
    ...item,
    clientUuid: generateClientUuid(),
    deviceCapturedAt: new Date().toISOString(),
    syncStatus: "pending",
    retryCount: 0,
  };

  queue.push(queuedItem);
  saveLocalQueue(queue);
  return queuedItem;
}

export function removeQueuedItem(clientUuid: string) {
  const queue = getLocalQueue().filter((q) => q.clientUuid !== clientUuid);
  saveLocalQueue(queue);
}

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
}

export async function syncQueue(): Promise<SyncResult> {
  const queue = getLocalQueue();
  const pending = queue.filter((i) => i.syncStatus !== "syncing");
  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
  }

  // Mark in-flight as syncing
  for (const item of pending) {
    item.syncStatus = "syncing";
  }
  saveLocalQueue(queue);

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const res = await fetch("/api/sbs/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientUuid: item.clientUuid,
          requirementId: item.requirementId,
          type: item.type,
          fileRef: item.fileRef,
          fileName: item.fileName,
          fileSize: item.fileSize,
          measurementValue: item.measurementValue,
          measurementUnit: item.measurementUnit,
          deviceCapturedAt: item.deviceCapturedAt,
          supersedesEvidenceId: item.supersedesEvidenceId,
          gpsLat: item.gpsLat,
          gpsLng: item.gpsLng,
        }),
      });

      if (!res.ok) {
        throw new Error(`Sync failed with HTTP ${res.status}`);
      }

      // Successfully synced — remove from local queue
      removeQueuedItem(item.clientUuid);
      syncedCount++;
    } catch (err: unknown) {
      item.syncStatus = "failed";
      item.retryCount += 1;
      item.lastError = err instanceof Error ? err.message : "Sync error";
      failedCount++;
    }
  }

  const remaining = getLocalQueue();
  saveLocalQueue(remaining);

  return {
    syncedCount,
    failedCount,
    remainingCount: remaining.length,
  };
}
