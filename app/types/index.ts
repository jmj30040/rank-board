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
  var kakao: any;
}