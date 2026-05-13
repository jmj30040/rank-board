'use client';

import Image from 'next/image';
import { Schedule } from '@/types';
import KakaoMap from '@/components/maps/KakaoMap';
import { getNaverMapUrl, getKakaoNaviUrl, getTmapUrl } from '@/lib/mapLinks';

interface ScheduleCardProps {
  schedule: Schedule;
  isActive: boolean;
  isPast: boolean;
  isHighlighted?: boolean;
}

export default function ScheduleCard({ schedule, isActive, isPast, isHighlighted }: ScheduleCardProps) {
  const hasAddress = !!(schedule.address || schedule.roadAddress);
  const displayAddress = schedule.roadAddress || schedule.address || '';
  const iconPath = '/icons';

  const kakaoNaviUrl = getKakaoNaviUrl(schedule);
  // 좌표 정보가 유효한지 확인 (0이 아니고 값이 존재해야 함)
  const hasCoordinates = Boolean(schedule.latitude && schedule.longitude && schedule.latitude !== 0 && schedule.longitude !== 0);
  const showMapAndNavigation = hasAddress && hasCoordinates;

  return (
    <div
      id={`schedule-${schedule.id}`}
      className={`p-6 rounded-[2rem] border transition-all duration-500 ${
        isHighlighted
          ? 'border-sky-400 bg-sky-50 shadow-xl ring-4 ring-sky-200 scale-[1.01]'
          : isActive
            ? 'border-sky-200 bg-sky-50/50 shadow-md ring-4 ring-sky-100'
            : isPast
              ? 'border-slate-100 bg-white opacity-60'
              : 'border-slate-100 bg-white shadow-sm'
      }`}
    >
      {isActive && (
        <div className="inline-flex items-center gap-1.5 bg-sky-500 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span> 진행 중
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div suppressHydrationWarning className={`px-5 py-3 rounded-2xl text-sm font-black flex flex-col gap-1 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-slate-100 text-slate-500 shadow-sm'}`}>
            <div className="flex items-center gap-1.5 text-[11px] opacity-90">
              <span>📅</span>
              {schedule.startDateTime.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
            </div>
            <div className="text-base tracking-tight">
              {schedule.startDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} -{' '}
              {schedule.endDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{schedule.title}</h3>
          {schedule.description && (
            <p className="text-slate-500 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{schedule.description}</p>
          )}
        </div>

        <div className="flex items-start gap-2 pt-2">
          <span className="text-slate-400">📍</span>
          <div>
            <div className="font-bold text-slate-800">{schedule.placeName || '미정'}</div>
            {displayAddress && <div className="text-xs text-slate-400 mt-0.5">{displayAddress}</div>}
          </div>
        </div>
      </div>

      {showMapAndNavigation && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <KakaoMap
            latitude={schedule.latitude}
            longitude={schedule.longitude}
            placeName={schedule.placeName}
          />
          <div className="mt-4 flex flex-row gap-2">
            <a
              href={getNaverMapUrl(schedule)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-2xl text-[11px] font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Image src={`${iconPath}/naver-map.webp`} alt="" width={16} height={16} className="object-contain" />
              네이버
            </a>
            <a
              href={kakaoNaviUrl || '#'}
              rel="noreferrer"
              className={`flex-1 bg-[#FEE500] text-[#191919] py-3 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                !kakaoNaviUrl ? 'pointer-events-none opacity-40' : 'hover:bg-[#FADA0A]'
              }`}
              aria-disabled={!kakaoNaviUrl}
            >
              <Image src={`${iconPath}/kakao-navi.svg`} alt="" width={16} height={16} className="object-contain" />
              카카오내비
            </a>
            <a
              href={getTmapUrl(schedule)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-black hover:bg-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Image src={`${iconPath}/tmap.svg`} alt="" width={16} height={16} className="object-contain" />
              티맵
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
