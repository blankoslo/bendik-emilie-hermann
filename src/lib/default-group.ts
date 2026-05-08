"use client";

import { useCallback, useEffect, useState } from "react";

interface DefaultGroup {
  id: number;
  name: string;
}

function storageKey(userId: string) {
  return `default_group_${userId}`;
}

export function useDefaultGroup(userId: string | undefined) {
  const [defaultGroup, setDefaultGroupState] = useState<DefaultGroup | null>(null);

  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) setDefaultGroupState(JSON.parse(raw) as DefaultGroup);
    } catch {
      // ignore
    }
  }, [userId]);

  const setDefaultGroup = useCallback(
    (group: DefaultGroup | null) => {
      if (!userId) return;
      try {
        if (group) {
          localStorage.setItem(storageKey(userId), JSON.stringify(group));
        } else {
          localStorage.removeItem(storageKey(userId));
        }
        setDefaultGroupState(group);
      } catch {
        // ignore
      }
    },
    [userId],
  );

  return { defaultGroup, setDefaultGroup };
}
