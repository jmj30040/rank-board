'use client';

import { useEffect, useRef, useState } from 'react';
type KakaoMapProps = {
  latitude: string | number;
  longitude: string | number;
  placeName?: string;
};

type KakaoMapInstance = {
  setCenter: (position: unknown) => void;
  relayout: () => void;
};

type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoInfoWindowInstance = {
  open: (map: KakaoMapInstance, marker: KakaoMarkerInstance) => void;
};

// SDK 로드 상태를 관리하는 전역 Promise (중복 로드 방지)
let sdkLoadPromise: Promise<void> | null = null;

const loadKakaoSDK = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject('Browser only');

  // 이미 로드된 경우 즉시 반환
  if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function') {
    return new Promise((resolve) => window.kakao?.maps.load(() => resolve()));
  }

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'kakao-maps-sdk';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => resolve());
      } else {
        reject(new Error('Kakao maps load failed'));
      }
    };
    
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error('Kakao SDK script load error'));
    };
    
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
};

export default function KakaoMap({ latitude, longitude, placeName }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const isValidCoords = latitude !== undefined && longitude !== undefined && 
                        !isNaN(latNum) && !isNaN(lngNum) && 
                        latNum !== 0 && lngNum !== 0;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-data'>(isValidCoords ? 'loading' : 'no-data');

  useEffect(() => {
    if (!isValidCoords) {
      return;
    }

    let isUnmounted = false;
    let mapInstance: KakaoMapInstance | null = null;

    const initMap = async () => {
      try {
        await loadKakaoSDK();
        
        if (isUnmounted || !mapRef.current || !window.kakao) return;

        const kakao = window.kakao;
        const position = new kakao.maps.LatLng(latNum, lngNum);
        
        mapInstance = new kakao.maps.Map(mapRef.current, {
          center: position,
          level: 3,
        });
        
        const marker = new kakao.maps.Marker({
          position,
        }) as KakaoMarkerInstance;

        marker.setMap(mapInstance);

        if (placeName) {
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${placeName}</div>`,
          }) as KakaoInfoWindowInstance;

          infowindow.open(mapInstance, marker);
        }

        // 레이아웃 안정화 (고정 높이가 적용된 후 실행되도록 지연)
        setTimeout(() => {
          if (!isUnmounted && mapInstance) {
            mapInstance.relayout();
            mapInstance.setCenter(position);
            setStatus('success');
          }
        }, 150);

      } catch (err) {
        console.error('KakaoMap initialization failed:', err);
        if (!isUnmounted) setStatus('error');
      }
    };

    initMap();

    return () => { isUnmounted = true; };
  }, [latNum, lngNum, placeName, isValidCoords]);

  return (
    <div className="w-full h-56 min-h-[220px] rounded-2xl overflow-hidden shadow-inner bg-slate-50 relative mb-4">
      {/* 지도 컨테이너 - ref 사용 */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* 상태 오버레이 */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 gap-2">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">지도를 불러오는 중입니다</p>
        </div>
      )}

      {status === 'no-data' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10 px-6 text-center">
          <p className="text-[11px] font-black text-slate-400 tracking-tight">📍 지도 좌표 정보가 없습니다</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-50 z-10 px-6 text-center">
          <p className="text-[11px] font-black text-rose-400 tracking-tight">⚠️ 지도를 표시할 수 없습니다</p>
        </div>
      )}
    </div>
  );
}