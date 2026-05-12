'use client';

import { useEffect, useRef } from 'react';

interface KakaoMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  placeName?: string;
}

export default function KakaoMap({ latitude, longitude, address, placeName }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !mapRef.current) return;
      const kakao = window.kakao;

      const displayMap = (lat: number, lng: number) => {
        const options = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3,
        };
        const map = new kakao.maps.Map(mapRef.current, options);
        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);

        if (placeName) {
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;color:#000;">${placeName}</div>`,
          });
          infowindow.open(map, marker);
        }
      };

      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        displayMap(latitude, longitude);
      } else if (address) {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            displayMap(parseFloat(result[0].y), parseFloat(result[0].x));
          }
        });
      }
    };

    window.kakao?.maps?.load(initMap);
  }, [latitude, longitude, address, placeName]);

  return <div ref={mapRef} className="w-full h-48 rounded-lg overflow-hidden shadow-inner bg-slate-100" />;
}