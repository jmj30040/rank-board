import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Team } from '../types';

export function subscribeTeams(
  onChange: (teams: Team[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, 'teams'), orderBy('score', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const teamsData: Team[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          color: data.color,
          score: Number(data.score ?? 0),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Team;
      });
      onChange(teamsData);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function addTeam(name: string, color: string): Promise<void> {
  const now = new Date();
  await addDoc(collection(db, 'teams'), {
    name,
    color,
    score: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateTeam(id: string, name: string, color: string): Promise<void> {
  await updateDoc(doc(db, 'teams', id), {
    name,
    color,
    updatedAt: new Date(),
  });
}

export async function deleteTeam(id: string): Promise<void> {
  // 소속 참가자 확인
  const q = query(collection(db, 'participants'), where('teamId', '==', id));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    throw new Error('소속된 참가자가 있는 팀은 삭제할 수 없습니다.');
  }
  
  await deleteDoc(doc(db, 'teams', id));
}