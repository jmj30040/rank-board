'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEventSettings } from './hooks/useEventSettings';

function formatEventDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const yyyy = start.getFullYear();
  const startMM = String(start.getMonth() + 1).padStart(2, "0");
  const startDD = String(start.getDate()).padStart(2, "0");
  const endMM = String(end.getMonth() + 1).padStart(2, "0");
  const endDD = String(end.getDate()).padStart(2, "0");

  return `${yyyy}.${startMM}.${startDD} - ${endMM}.${endDD}`;
}

export default function Home() {
  const { settings } = useEventSettings();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sky-400 to-emerald-400 pt-20 pb-32 px-6 rounded-b-[3rem] shadow-sm">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <Image src="/icons/farmsco.svg" alt="Farmsco" width={48} height={48} className="h-10 md:h-12 w-auto" />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight">{settings.mainTitle}</h1>
          <p className="text-xl font-medium opacity-90 mb-2">{settings.eventName}</p>
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-white/30">
            {formatEventDateRange(settings.startDate, settings.endDate)}
          </div>
          <p className="mt-8 text-lg font-light leading-relaxed whitespace-pre-line">
            {settings.heroDescription}
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/schedule" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
              <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                📅
              </div>
              <h3 className="text-xl font-bold mb-2">오늘의 일정</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                진행 중인 일정과 장소 정보를 실시간으로 확인하세요.
              </p>
            </div>
          </Link>

          <Link href="/ranking" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🏆
              </div>
              <h3 className="text-xl font-bold mb-2">실시간 랭킹</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                팀/개인별 게임 점수와 순위를 실시간으로 집계합니다.
              </p>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                ⚙️
              </div>
              <h3 className="text-xl font-bold mb-2">관리자 메뉴</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                참가자 관리 및 게임 점수 입력을 위한 공간입니다.
              </p>
            </div>
          </Link>
        </div>
        
        <footer className="mt-20 text-center text-slate-400 text-sm">
          © 2026 Refresh Day Hub. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
