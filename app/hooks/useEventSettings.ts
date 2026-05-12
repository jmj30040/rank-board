'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface EventSettings {
  mainTitle: string;
  eventName: string;
  startDate: string;
  endDate: string;
  heroDescription: string;
}

const defaultSettings: EventSettings = {
  mainTitle: "Refresh Day",
  eventName: "재무경영정보실 워크샵",
  startDate: "2026-06-11",
  endDate: "2026-06-12",
  heroDescription: "오늘의 일정과 게임 랭킹을\n한눈에 확인하고 즐거운 시간을 보내세요!"
};

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  if (!settings) {
    return null;
  }

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'event'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as EventSettings);
      }
      setLoading(false);
    }, (err) => {
      console.error("Settings fetch error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { settings, loading };
}

