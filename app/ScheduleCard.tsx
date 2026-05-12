'use client';

import { Schedule } from './types';
import KakaoMap from './KakaoMap';
import { getNaverMapUrl, getKakaoNaviUrl, getTmapUrl } from './mapLinks';

interface ScheduleCardProps {
  schedule: Schedule;
  isActive: boolean;
  isPast: boolean;
}

export default function ScheduleCard({ schedule, isActive, isPast }: ScheduleCardProps) {
  const hasLocation = !!(schedule.placeName || schedule.address || schedule.roadAddress);
  const displayAddress = schedule.roadAddress || schedule.address || '';

  // 아이콘 업로드 경로 (public/icons 폴더 내 저장)
  const iconPath = '/icons';

  return (
    <div
      className={`p-6 rounded-[2rem] border transition-all ${
        isActive
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
          <div className={`px-4 py-1.5 rounded-xl text-sm font-black ${isActive ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {schedule.startDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~{' '}
            {schedule.endDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
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

      {hasLocation && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <KakaoMap
            latitude={schedule.latitude}
            longitude={schedule.longitude}
            address={displayAddress}
            placeName={schedule.placeName}
          />
          <div className="mt-4 flex flex-row gap-2">
            <a
              href={getNaverMapUrl(schedule)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-2xl text-[11px] font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <img 
                src={`${iconPath}/naver-map.webp`} 
                alt="" 
                className="w-4 h-4 object-contain" 
              />
              네이버지도
            </a>
            <a
              href={getKakaoNaviUrl(schedule)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#FEE500] text-[#191919] py-3 rounded-2xl text-[11px] font-black hover:bg-[#FADA0A] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <img 
                src={`${iconPath}/kakao-navi.svg`} 
                alt="" 
                className="w-4 h-4 object-contain" 
              />
              카카오내비
            </a>
            <a
              href={getTmapUrl(schedule)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-black hover:bg-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <img 
                src={`${iconPath}/tmap.svg`} 
                alt="" 
                className="w-4 h-4 object-contain" 
              />
              티맵
            </a>
          </div>
        </div>
      )}
    </div>
  );
}