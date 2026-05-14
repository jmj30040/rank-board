'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEventSettings } from '@/hooks/useEventSettings';

function formatEventDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return '일정 미정';

  const [startYear, startMonth, startDay] = startDate.split('-');
  const [, endMonth, endDay] = endDate.split('-');

  if (!startYear || !startMonth || !startDay || !endMonth || !endDay) {
    return '일정 미정';
  }

  if (startDate === endDate) {
    return `${startYear}.${startMonth}.${startDay}`;
  }

  return `${startYear}.${startMonth}.${startDay} - ${endMonth}.${endDay}`;
}

export default function RankingPageHero() {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const { settings } = useEventSettings();
  const eventDate = formatEventDateRange(settings?.startDate, settings?.endDate);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-b border-slate-100 mb-10 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-1 font-bold text-sm mb-4">
              <span>←</span> 메인으로 돌아가기
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">실시간 랭킹 <span className="text-sky-500">Live</span></h1>
            <p className="text-slate-400 font-bold mt-1">재무경영정보실 Refresh Day 2026</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner">
            <div className="text-right border-r border-slate-200 pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Event Date</p>
              <p className="text-sm font-black text-slate-700">{eventDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-0.5">Current Time</p>
              <p className="text-xl font-black text-slate-900 tabular-nums" suppressHydrationWarning>
                {currentTime?.toLocaleTimeString('ko-KR', { hour12: false })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
