'use client';

import { Schedule } from '@/types';

interface ScheduleOverviewProps {
  schedules: Schedule[];
  onItemClick?: (id: string) => void;
}

export default function ScheduleOverview({ schedules, onItemClick }: ScheduleOverviewProps) {
  // 시작 시간 기준 오름차순 정렬
  const sortedSchedules = [...schedules].sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

  const isScheduleActive = (schedule: Schedule) => {
    const now = new Date();
    return schedule.startDateTime <= now && now <= schedule.endDateTime;
  };

  const isSchedulePast = (schedule: Schedule) => {
    const now = new Date();
    return now > schedule.endDateTime;
  };

  return (
    <section className="mb-16">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        <div className="space-y-8 relative before:content-[''] before:absolute before:left-[95px] sm:before:left-[135px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {sortedSchedules.map((schedule) => {
            const active = isScheduleActive(schedule);
            const past = isSchedulePast(schedule);
            
            return (
              <div 
                key={schedule.id} 
                onClick={() => onItemClick?.(schedule.id)}
                className={`flex gap-6 sm:gap-10 items-start transition-all cursor-pointer hover:bg-slate-50 p-4 -m-4 rounded-[2rem] ${past ? 'opacity-40' : 'opacity-100'}`}
              >
                {/* 날짜 및 시간 영역 */}
                <div className="flex-shrink-0 w-20 sm:w-32 text-right">
                  <div suppressHydrationWarning className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-sky-500' : 'text-slate-400'}`}>
                    {schedule.startDateTime.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' })}
                  </div>
                  <div suppressHydrationWarning className={`text-sm font-black tabular-nums ${active ? 'text-sky-600' : 'text-slate-700'}`}>
                    {schedule.startDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>

                {/* 요약 내용 영역 */}
                <div className="relative pt-0.5 flex-1">
                  {/* 타임라인 인디케이터 */}
                  <div className={`absolute -left-[15px] sm:-left-[39px] top-2 w-3 h-3 rounded-full border-4 border-white z-10 ${active ? 'bg-sky-500 ring-4 ring-sky-100' : 'bg-slate-300'}`} />
                  
                  <h3 className={`text-base font-bold leading-tight ${active ? 'text-sky-600' : 'text-slate-800'}`}>
                    {schedule.title}
                  </h3>
                  {schedule.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-sm">
                      {schedule.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
