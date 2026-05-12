import { useState, useEffect } from 'react';
import { Schedule } from '../types';
import { subscribeSchedules } from '../lib/scheduleService';

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSchedules(
      (data) => {
        setSchedules(data);
        setLoading(false);
      },
      (err) => {
        console.error('Schedules subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { schedules, loading, error };
}