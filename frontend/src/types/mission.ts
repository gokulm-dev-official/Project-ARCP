export interface Mission {
  id: number;
  ambulanceId: number;
  ambulanceNumber: string;
  driverName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  destinationName?: string;
  alertRadiusMeters: number;
  distanceCoveredKm?: number;
  startTime: string;
  endTime?: string;
  totalAlertsTriggered?: number;
  totalAcknowledgements?: number;
  nearbyVehicleCount?: number;
}

export interface MissionRequest {
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  destinationName?: string;
  alertRadiusMeters?: number;
}
