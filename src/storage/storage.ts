import type { StorageSchema } from "../types";

const STORAGE_KEY = "ranking-engine:data";

function emptySchema(): StorageSchema {
  return { version: 1, rankings: [] };
}

export function migrate(raw: unknown): StorageSchema {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !("version" in raw) ||
    !("rankings" in raw) ||
    !Array.isArray((raw as { rankings: unknown }).rankings)
  ) {
    return emptySchema();
  }

  const schema = raw as StorageSchema;

  // No migrations exist yet - this switch is the seam for future
  // version bumps (e.g. adding a new field to RankingList) so old
  // saved data upgrades instead of getting discarded.
  switch (schema.version) {
    case 1:
      return schema;
    default:
      return emptySchema();
  }
}

export function loadAll(): StorageSchema {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptySchema();

  try {
    return migrate(JSON.parse(raw));
  } catch {
    return emptySchema();
  }
}

export function saveAll(data: StorageSchema): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
