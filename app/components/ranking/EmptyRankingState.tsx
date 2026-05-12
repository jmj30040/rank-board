'use client';

interface EmptyRankingStateProps {
  title: string;
  message: string;
}

export default function EmptyRankingState({ title, message }: EmptyRankingStateProps) {
  return (
    <section className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-slate-200 rounded-full"></div>
        <h2 className="text-2xl font-black text-slate-300">{title}</h2>
      </div>
      <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed text-slate-400 font-bold">{message}</div>
    </section>
  );
}