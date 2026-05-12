import { useState, useEffect } from 'react';
import { Participant } from '../types';
import { subscribeParticipants } from '../lib/participantService';

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeParticipants(
      (data) => {
        setParticipants(data);
        setLoading(false);
      },
      (err) => {
        console.error('Participants subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { participants, loading, error };
}