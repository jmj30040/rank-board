'use client';

import { useParticipants } from '../hooks/useParticipants';
import { calculateRankings } from '../utils/ranking';
import Link from 'next/link';

export default function RankingPage() {
  const { participants, loading } = useParticipants();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-black animate-pulse">실시간 랭킹 집계 중...</div>
      </div>
    );
  }

  const rankings = calculateRankings(participants);

  const topThree = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium">
              <span className="text-lg">←</span> 돌아가기
            </Link>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Refresh Day Ranking</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Top 3 Podium Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2위 */}
            {topThree[1] && (
              <div className="order-2 md:order-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center relative overflow-hidden transition-all hover:shadow-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-300"></div>
                <div className="text-4xl mb-4">🥈</div>
                <div className="text-2xl font-black text-slate-900">{topThree[1].name}</div>
                <div className="text-sm text-slate-400 font-bold mb-4">{topThree[1].team}</div>
                <div className="text-3xl font-black text-slate-500">{topThree[1].score}점</div>
              </div>
            )}
            {/* 1위 */}
            {topThree[0] && (
              <div className="order-1 md:order-2 bg-white p-10 rounded-[3rem] shadow-xl border-2 border-emerald-100 text-center relative overflow-hidden transition-all hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-sky-400"></div>
                <div className="text-6xl mb-4 animate-bounce">👑</div>
                <div className="text-3xl font-black text-slate-900 mb-1">{topThree[0].name}</div>
                <div className="text-sm text-emerald-500 font-black mb-6 uppercase tracking-widest">{topThree[0].team}</div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                  {topThree[0].score}점
                </div>
              </div>
            )}
            {/* 3위 */}
            {topThree[2] && (
              <div className="order-3 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center relative overflow-hidden transition-all hover:shadow-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-orange-200"></div>
                <div className="text-4xl mb-4">🥉</div>
                <div className="text-2xl font-black text-slate-900">{topThree[2].name}</div>
                <div className="text-sm text-slate-400 font-bold mb-4">{topThree[2].team}</div>
                <div className="text-3xl font-black text-orange-400">{topThree[2].score}점</div>
              </div>
            )}
          </div>
        </div>

        {/* 나머지 순위 리스트 */}
        <div className="space-y-3">
          {others.map((participant) => (
            <div
              key={participant.id}
              className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 flex items-center justify-center font-black text-slate-300 text-lg italic">
                  {participant.rank}
                </div>
                <div>
                  <div className="font-black text-slate-800">{participant.name}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase">{participant.team}</div>
                </div>
              </div>
              <div className="text-xl font-black text-slate-600">{participant.score}점</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}