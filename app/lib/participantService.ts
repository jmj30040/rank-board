import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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