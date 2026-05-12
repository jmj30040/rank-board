export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  department: string; // 부서 필드 복구
  teamId: string | null;
  teamName: string;
  teamColor: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreLog {
  id: string;
  targetType: 'participant' | 'team';
  targetId: string;
  targetName: string;
  teamId?: string;
  teamName?: string;
  delta: number;
  beforeScore: number;
  afterScore: number;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  placeName: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  interface Window {
    kakao?: KakaoStatic;
  }
}

export interface KakaoStatic {
  maps: {
    LatLng: new (lat: number, lng: number) => unknown;
    Map: new (element: HTMLElement, options: Record<string, unknown>) => KakaoMapInstance;
    Marker: new (options: Record<string, unknown>) => unknown;
    InfoWindow: new (options: Record<string, unknown>) => unknown;
    load: (callback: () => void) => void;
    services: {
      Places: new () => KakaoPlacesService;
      Status: KakaoStatus;
    };
  };
}

export interface KakaoMapInstance {
  relayout: () => void;
  setCenter: (position: unknown) => void;
}

export interface KakaoPlacesService {
  keywordSearch: (keyword: string, callback: (data: KakaoPlace[], status: string) => void) => void;
}

export interface KakaoStatus {
  OK: string;
  ZERO_RESULT: string;
}

export type KakaoMapProps = {
  latitude: string | number;
  longitude: string | number;
  placeName?: string;
};

export type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone?: string;
  place_url?: string;
};