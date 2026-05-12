'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSchedules } from '@/hooks/useSchedules';
import ScheduleOverview from '@/components/schedule/ScheduleOverview';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';

export default function SchedulePage() {
  const { schedules, loading } = useSchedules();

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const scrollToSchedule = (id: string) => {
    setHighlightedId(id);
    const target = document.getElementById(`schedule-${id}`);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // 2초 후 강조 효과 제거
    setTimeout(() => setHighlightedId(null), 2000);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1 font-medium">
              <span className="text-lg">←</span> 돌아가기
            </Link>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Refresh Day Schedule</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <p className="text-sky-500 font-bold tracking-widest text-xs uppercase mb-2">Timeline</p>
          <h2 className="text-3xl font-black text-slate-900">전체 일정 안내</h2>
        </div>

        {!loading && schedules.length > 0 && (
          <>
            <ScheduleOverview schedules={schedules} onItemClick={scrollToSchedule} />
            <ScheduleTimeline schedules={schedules} highlightedId={highlightedId} />
          </>
        )}
      </div>
    </div>
  );
}
