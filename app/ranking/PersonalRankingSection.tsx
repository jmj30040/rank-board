'use client';

import { Participant } from '../types';
import EmptyRankingState from './EmptyRankingState';

interface PersonalRankingSectionProps {
  rankings: (Participant & { rank: number })[];
}

export default function PersonalRankingSection({ rankings }: PersonalRankingSectionProps) {
  if (rankings.length === 0) {
    return <EmptyRankingState title="개인별 랭킹" message="아직 등록된 참가자가 없습니다." />;
  }

  return (
    <section className="animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
        <h2 className="text-2xl font-black text-slate-900">개인별 랭킹</h2>
        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{rankings.length} Participants</span>
      </div>

      <div className="space-y-3">
        {rankings.map((p) => {
          const isTopThree = p.rank <= 3;
          
          return (
            <div 
              key={p.id} 
              className={`bg-white p-5 rounded-[2rem] border transition-all flex items-center justify-between group ${
                isTopThree ? 'border-emerald-100 shadow-md ring-4 ring-emerald-50 shadow-emerald-100/50' : 'border-slate-100 shadow-sm hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                  isTopThree ? 'bg-emerald-500 text-white text-lg scale-110' : 'bg-slate-100 text-slate-300'
                }`}>
                  {p.rank}
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-inner" style={{ backgroundColor: p.teamColor || '#94A3B8' }}>
                  {p.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800 text-lg">{p.name}</p>
                    {isTopThree && <span className="animate-bounce">⭐</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.department}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.teamName}</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">
                {p.score.toLocaleString()}<span className="text-xs ml-1 opacity-20 italic font-bold pt-1">pt</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}