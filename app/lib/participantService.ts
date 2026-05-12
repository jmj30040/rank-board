import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Participant, ScoreLog } from '../types';

export async function addParticipant(name: string, team: string): Promise<void> {
  const now = new Date();
  await addDoc(collection(db, 'participants'), {
    name,
    team,
    score: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateParticipant(id: string, name: string, team: string): Promise<void> {
  const now = new Date();
  await updateDoc(doc(db, 'participants', id), {
    name,
    team,
    updatedAt: now,
  });
}

export async function deleteParticipant(id: string): Promise<void> {
  await deleteDoc(doc(db, 'participants', id));
}

export async function updateScore(participantId: string, delta: number, reason: string): Promise<void> {
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
    team: data.team,
    delta,
    reason,
    beforeScore,
    afterScore,
    createdAt: new Date(),
  });
}