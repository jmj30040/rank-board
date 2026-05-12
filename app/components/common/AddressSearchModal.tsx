'use client';

import { useEffect, useState } from 'react';

interface AddressResult {
  name: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

interface AddressSearchModalProps {
  onSelect: (address: AddressResult) => void;
  onClose: () => void;
}

interface KakaoPlacesService {
  keywordSearch: (keyword: string, callback: (data: KakaoPlaceItem[], status: string) => void) => void;
}

interface KakaoStatus {
  OK: string;
  ZERO_RESULT: string;
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        services: {
          Places: new () => KakaoPlacesService;
          Status: KakaoStatus;
        };
      };
    };
  }
}

type KakaoPlaceItem = {
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
  x?: string;
  y?: string;
};

export default function AddressSearchModal({ onSelect, onClose }: AddressSearchModalProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.kakao?.maps?.services
  );
  useEffect(() => {
    if (sdkLoaded || typeof window === 'undefined') return;
    if (window.kakao?.maps?.services) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao?.maps.load(() => {
        setSdkLoaded(true);
      });
    };
    script.onerror = () => {
      console.error('Kakao SDK load failed');
      alert('카카오 지도 SDK를 불러오는 데 실패했습니다.');
    };
    document.head.appendChild(script);
  }, [sdkLoaded]);

  const handleSearch = () => {
    if (!keyword.trim() || !sdkLoaded || typeof window === 'undefined' || !window.kakao) return;

    setIsSearching(true);
    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      setIsSearching(false);
      if (status === kakao.maps.services.Status.OK) {
        setResults(data.map((item) => ({
          name: item.place_name || item.address_name || '',
          address: item.address_name || '',
          roadAddress: item.road_address_name || item.address_name || '',
          latitude: parseFloat(item.y || '') || 0,
          longitude: parseFloat(item.x || '') || 0,
        })));
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        setResults([]);
      } else {
        console.error('주소 검색 오류', status);
        alert('주소 검색에 실패했습니다.');
      }
    });
  };

  const handleSelect = (item: AddressResult) => {
    onSelect(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-slate-900">장소 검색</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="장소명 또는 주소 입력"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2 border border-slate-300 rounded text-slate-900"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !sdkLoaded}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                >
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  {item.roadAddress && (
                    <div className="text-sm text-slate-600">{item.roadAddress}</div>
                  )}
                  {item.address && (
                    <div className="text-sm text-slate-500">{item.address}</div>
                  )}
                </button>
              ))}
            </div>
          ) : keyword && !isSearching ? (
            <div className="text-center text-slate-600">검색 결과가 없습니다.</div>
          ) : null}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-500 text-white py-2 rounded hover:bg-slate-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}