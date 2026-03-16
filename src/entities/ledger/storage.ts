import { getDefaultLedgerSnapshot } from "@/entities/ledger/default-ledger";
import type { LedgerSnapshot } from "@/entities/ledger/types";
import { LEDGER_STORAGE_KEY } from "@/shared/config/app";

function cloneSnapshot(snapshot: LedgerSnapshot): LedgerSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as LedgerSnapshot;
}

export function readLedgerSnapshot(): LedgerSnapshot {
  if (typeof window === "undefined") {
    return cloneSnapshot(getDefaultLedgerSnapshot());
  }

  const cached = window.localStorage.getItem(LEDGER_STORAGE_KEY);
  if (!cached) {
    const fallback = cloneSnapshot(getDefaultLedgerSnapshot());
    window.localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(cached) as LedgerSnapshot;
  } catch {
    const fallback = cloneSnapshot(getDefaultLedgerSnapshot());
    window.localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function writeLedgerSnapshot(snapshot: LedgerSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(snapshot));
}
