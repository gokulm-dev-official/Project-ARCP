export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationUpdate {
  userId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  missionId?: number;
}

export interface LocationResponse {
  userId: number;
  userName: string;
  role: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  online: boolean;
  lastUpdate: string;
}
