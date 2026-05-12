export interface Participant {
  id: string;
  name: string;
  team: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreLog {
  id: string;
  participantId: string;
  participantName: string;
  team: string;
  delta: number;
  reason: string;
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