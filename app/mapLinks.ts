import { Schedule } from './types';

export function getPlaceKeyword(schedule: Partial<Schedule>) {
  const address = schedule.roadAddress || schedule.address || '';
  const placeName = schedule.placeName || '';

  // 주소와 장소명이 중복되는 경우 하나만 사용하여 검색 정확도를 높입니다.
  if (address.includes(placeName)) return address;
  if (placeName.includes(address)) return placeName;

  return [placeName, address].filter(Boolean).join(' ');
}

export function getNaverMapUrl(schedule: Partial<Schedule>) {
  const lat = Number(schedule.latitude);
  const lng = Number(schedule.longitude);
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return '';
  
  const name = encodeURIComponent(schedule.placeName || '목적지');
  return `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=refresh-day`;
}

export function getKakaoNaviUrl(schedule: Partial<Schedule>) {
  const x = Number(schedule.longitude); // 경도
  const y = Number(schedule.latitude);  // 위도
  if (!x || !y || isNaN(x) || isNaN(y)) return '';

  const name = encodeURIComponent(schedule.placeName || '목적지');
  return `https://map.kakao.com/link/to/${name},${y},${x}`;
}

export function getTmapUrl(schedule: Partial<Schedule>) {
  const x = Number(schedule.longitude); // 경도
  const y = Number(schedule.latitude);  // 위도
  if (!x || !y || isNaN(x) || isNaN(y)) return '';

  const name = encodeURIComponent(schedule.placeName || '목적지');
  return `tmap://route?goalname=${name}&goalx=${x}&goaly=${y}`;
}