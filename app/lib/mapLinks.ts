import { Schedule } from '../types';

export function getPlaceKeyword(schedule: Partial<Schedule>) {
  const address = schedule.roadAddress || schedule.address || '';
  const placeName = schedule.placeName || '';

  // 주소와 장소명이 중복되는 경우 (예: 장소명이 주소의 일부인 경우) 하나만 사용하여 검색 정확도를 높입니다.
  if (address.includes(placeName)) return address;
  if (placeName.includes(address)) return placeName;

  return [placeName, address].filter(Boolean).join(' ');
}

export function getNaverMapUrl(schedule: Partial<Schedule>) {
  if (!schedule.latitude || !schedule.longitude) return '';
  const name = encodeURIComponent(schedule.placeName || '목적지');
  // dlat: 위도, dlng: 경도
  return `nmap://route/car?dlat=${schedule.latitude}&dlng=${schedule.longitude}&dname=${name}&appname=refresh-day`;
}

export function getKakaoNaviUrl(schedule: Partial<Schedule>) {
  if (!schedule.latitude || !schedule.longitude) return '';
  const name = encodeURIComponent(schedule.placeName || '목적지');
  // x: 경도, y: 위도
  return `kakaonavi://navigate?name=${name}&x=${schedule.longitude}&y=${schedule.latitude}`;
}

export function getTmapUrl(schedule: Partial<Schedule>) {
  if (!schedule.latitude || !schedule.longitude) return '';
  const name = encodeURIComponent(schedule.placeName || '목적지');
  // goalx: 경도, goaly: 위도
  return `tmap://route?goalname=${name}&goalx=${schedule.longitude}&goaly=${schedule.latitude}`;
}