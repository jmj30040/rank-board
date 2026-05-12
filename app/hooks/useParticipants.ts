import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Participant } from '../types';

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'participants'), orderBy('score', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const participantsData: Participant[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        participantsData.push({
          id: doc.id,
          name: data.name,
          team: data.team,
          score: data.score,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      setParticipants(participantsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { participants, loading };
}