import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Schedule } from '../types';

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'schedules'), orderBy('startDateTime', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const schedulesData: Schedule[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedulesData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          startDateTime: data.startDateTime.toDate(),
          endDateTime: data.endDateTime.toDate(),
          placeName: data.placeName,
          address: data.address,
          roadAddress: data.roadAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          sortOrder: data.sortOrder,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      setSchedules(schedulesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { schedules, loading };
}