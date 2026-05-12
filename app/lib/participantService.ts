import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Participant } from '../types';

export function subscribeParticipants(
  onChange: (participants: Participant[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, 'participants'), orderBy('score', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const participantsData: Participant[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        participantsData.push({
          id: doc.id,
          name: data.name,
          department: data.department,
          teamId: data.teamId,
          teamName: data.teamName,
          teamColor: data.teamColor,
          score: Number(data.score ?? 0),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      onChange(participantsData);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function addParticipant(name: string, department: string, teamId: string | null, teamName: string, teamColor: string): Promise<void> {
  const now = new Date();
  await addDoc(collection(db, 'participants'), {
    name,
    department,
    teamId,
    teamName,
    teamColor,
    score: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateParticipant(id: string, name: string, department: string, teamId: string | null, teamName: string, teamColor: string): Promise<void> {
  const now = new Date();
  await updateDoc(doc(db, 'participants', id), {
    name,
    department,
    teamId,
    teamName,
    teamColor,
    updatedAt: now,
  });
}

export async function deleteParticipant(id: string): Promise<void> {
  await deleteDoc(doc(db, 'participants', id));
}

export async function updateScore(participantId: string, delta: number): Promise<void> {
  const participantRef = doc(db, 'participants', participantId);
  const participantSnap = await getDoc(participantRef);

  if (!participantSnap.exists()) {
    throw new Error('Participant not found');
  }

  const data = participantSnap.data();
  const beforeScore = data.score;
  const afterScore = beforeScore + delta;

  await updateDoc(participantRef, {
    score: afterScore,
    updatedAt: new Date(),
  });

  await addDoc(collection(db, 'scoreLogs'), {
    participantId,
    participantName: data.name,
    teamId: data.teamId || '',
    teamName: data.teamName || '',
    delta,
    beforeScore,
    afterScore,
    createdAt: new Date(),
  });
}