'use client';

import { Team, Participant } from '@/types';
import EmptyRankingState from './EmptyRankingState';

interface TeamRankingSectionProps {
  rankings: (Team & { rank: number })[];
  participants: Participant[];
}

export default function TeamRankingSection({ rankings, participants }: TeamRankingSectionProps) {
  const topThree = rankings.slice(0, 3);
  const others = rankings.slice(3);

  if (rankings.length === 0) {
    return <EmptyRankingState title="팀별 랭킹" message="아직 등록된 팀이 없습니다." />;
  }

  return (
    <section className="animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
        <h2 className="text-2xl font-black text-slate-900">팀별 랭킹</h2>
        <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{rankings.length} Teams</span>
      </div>

      {/* 1-3등 포디움 스타일 */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {topThree.map((team) => (
          <div 
            key={team.id}
            className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] ${
              team.rank === 1 
                ? 'bg-white border-sky-400 shadow-2xl shadow-sky-100 ring-8 ring-sky-50' 
                : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: team.color }}></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${
                  team.rank === 1 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {team.rank === 1 ? '👑' : team.rank}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{team.name}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                    Members: {participants.filter(p => p.teamId === team.id).length}명
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-sky-500 tabular-nums tracking-tighter">
                  {team.score.toLocaleString()}<span className="text-lg ml-1 opacity-50">pt</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 나머지 순위 리스트 */}
      <div className="space-y-3">
        {others.map((team) => (
          <div key={team.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:bg-slate-50">
            <div className="flex items-center gap-5">
              <div className="w-8 text-center font-black text-slate-300 italic text-lg">
                {team.rank}
              </div>
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: team.color }}></div>
              <div className="font-black text-slate-700 text-lg">{team.name}</div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-400">소속 {participants.filter(p => p.teamId === team.id).length}명</span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {team.score.toLocaleString()}<span className="text-xs ml-0.5 opacity-30 italic">pt</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}