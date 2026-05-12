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
  const keyword = encodeURIComponent(getPlaceKeyword(schedule));
  return `https://map.naver.com/p/search/${keyword}`;
}

export function getKakaoNaviUrl(schedule: Partial<Schedule>) {
  // 좌표 정보가 있다면 좌표 기반 길찾기 링크를 생성합니다.
  if (schedule.latitude && schedule.longitude) {
    const name = encodeURIComponent(schedule.placeName || '목적지');
    return `https://map.kakao.com/link/to/${name},${schedule.latitude},${schedule.longitude}`;
  }
  const keyword = encodeURIComponent(getPlaceKeyword(schedule));
  return `https://map.kakao.com/link/search/${keyword}`;
}

export function getTmapUrl(schedule: Partial<Schedule>) {
  const keyword = encodeURIComponent(getPlaceKeyword(schedule));
  return `https://www.tmap.co.kr/search?searchKeyword=${keyword}`;
}