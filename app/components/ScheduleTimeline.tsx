'use client';

import { useEffect, useState } from 'react';
import { Schedule } from '../types';
import ScheduleCard from './ScheduleCard';

interface ScheduleTimelineProps {
  schedules: Schedule[];
}

export default function ScheduleTimeline({ schedules }: ScheduleTimelineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isScheduleActive = (schedule: Schedule) => {
    const now = new Date();
    return schedule.startDateTime <= now && now <= schedule.endDateTime;
  };

  const isSchedulePast = (schedule: Schedule) => {
    const now = new Date();
    return now > schedule.endDateTime;
  };

  return (
    <section className="mt-20">
      <div className="mb-10 text-center">
        <p className="text-sky-500 font-bold tracking-widest text-xs uppercase mb-2">Details</p>
        <h2 className="text-3xl font-black text-slate-900">상세 일정 안내</h2>
      </div>

      <div className="space-y-6">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            isActive={mounted ? isScheduleActive(schedule) : false}
            isPast={mounted ? isSchedulePast(schedule) : false}
          />
        ))}
      </div>
    </section>
  );
}