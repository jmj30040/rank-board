import { Participant } from '../types';

export function calculateRankings(participants: Participant[]): (Participant & { rank: number })[] {
  if (participants.length === 0) return [];

  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const withRanks: (Participant & { rank: number })[] = [];

  sorted.forEach((participant, index) => {
    const prev = withRanks[index - 1];
    const rank = prev && prev.score === participant.score ? prev.rank : index + 1;
    withRanks.push({ ...participant, rank });
  });

  return withRanks;
}