export type AlertDirection = 'BEHIND' | 'AHEAD' | 'LEFT' | 'RIGHT' | 'APPROACHING' | 'PASSING' | 'CLEARED';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'CLEAR';

export interface AlertMessage {
  alertId: number;
  missionId: number;
  ambulanceId: number;
  ambulanceNumber: string;
  ambulanceLat: number;
  ambulanceLng: number;
  ambulanceSpeed: number;
  ambulanceHeading?: number;
  distanceMeters: number;
  etaSeconds: number;
  direction: AlertDirection;
  instruction: string;
  severity: AlertSeverity;
  destinationLat?: number;
  destinationLng?: number;
  destinationName?: string;
  timestamp: number;
}

export interface AcknowledgementRequest {
  alertId: number;
  missionId: number;
  vehicleId: number;
  message?: string;
}

export interface AcknowledgementResponse {
  acknowledgementId: number;
  alertId: number;
  missionId: number;
  vehicleId: number;
  vehicleNumber: string;
  driverName: string;
  message: string;
  timestamp: string;
}
