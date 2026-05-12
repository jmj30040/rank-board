import { useState, useEffect } from 'react';
import { Team } from '../types';
import { subscribeTeams } from '../lib/teamService';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTeams(
      (data) => {
        setTeams(data);
        setLoading(false);
      },
      (err) => {
        console.error('Teams subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { teams, loading, error };
}
