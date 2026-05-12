'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import { Team, Participant } from '../types';
import RankingPageHero from './RankingPageHero';
import TeamRankingSection from './TeamRankingSection';
import PersonalRankingSection from './PersonalRankingSection';

// 공동 순위 계산 함수
function calculateRanks<T extends { score: number }>(items: T[]) {
  let previousScore: number | null = null;
  let previousRank = 0;

  return [...items]
    .sort((a, b) => b.score - a.score)
    .map((item, index) => {
      const rank =
        previousScore !== null && item.score === previousScore
          ? previousRank
          : index + 1;

      previousScore = item.score;
      previousRank = rank;

      return {
        ...item,
        rank,
      };
    });
}

export default function RankingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubTeams = onSnapshot(
      query(collection(db, 'teams'), orderBy('score', 'desc')),
      (snap) => {
        setTeams(snap.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name ?? "",
          color: doc.data().color ?? "#3b82f6",
          score: Number(doc.data().score ?? 0),
          ...doc.data() 
        } as Team)));
        setLoading(false);
      },
      (err) => {
        console.error("Teams error:", err);
        setError("랭킹 데이터를 불러오지 못했습니다. Firestore 권한을 확인해주세요.");
      }
    );

    const unsubParts = onSnapshot(
      query(collection(db, 'participants'), orderBy('score', 'desc')),
      (snap) => {
        setParticipants(snap.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name ?? "",
          department: doc.data().department ?? "부서 미입력",
          teamId: doc.data().teamId ?? null,
          teamName: doc.data().teamName ?? "팀 미배정",
          teamColor: doc.data().teamColor ?? "#94A3B8",
          score: Number(doc.data().score ?? 0),
          ...doc.data() 
        } as Participant)));
      },
      (err) => {
        console.error("Participants error:", err);
        setError("랭킹 데이터를 불러오지 못했습니다.");
      }
    );

    return () => { unsubTeams(); unsubParts(); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">Ranking Synchronizing...</div>
        </div>
      </div>
    );
  }

  const teamRankings = calculateRanks(teams);
  const personalRankings = calculateRanks(participants);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <RankingPageHero />

      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-500 font-bold text-center mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <TeamRankingSection rankings={teamRankings} participants={participants} />
          <PersonalRankingSection rankings={personalRankings} />
        </div>
      </div>
    </div>
  );
}