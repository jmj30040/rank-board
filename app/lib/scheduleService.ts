import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Schedule } from '../types';

export function subscribeSchedules(
  onChange: (schedules: Schedule[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, 'schedules'), orderBy('startDateTime', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const schedulesData: Schedule[] = [];
      snapshot.forEach((doc) => {
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
      onChange(schedulesData);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function addSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = new Date();
  await addDoc(collection(db, 'schedules'), {
    ...schedule,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateSchedule(id: string, schedule: Partial<Omit<Schedule, 'id' | 'createdAt'>>): Promise<void> {
  const now = new Date();
  await updateDoc(doc(db, 'schedules', id), {
    ...schedule,
    updatedAt: now,
  });
}

export async function deleteSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, 'schedules', id));
}

export async function getSchedules(): Promise<Schedule[]> {
  const q = query(collection(db, 'schedules'), orderBy('startDateTime', 'asc'));
  const querySnapshot = await getDocs(q);
  const schedules: Schedule[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    schedules.push({
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
  return schedules;
}