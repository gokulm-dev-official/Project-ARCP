export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'AMBULANCE_DRIVER' | 'VEHICLE_DRIVER';
  vehicleNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  vehicleNumber?: string;
  vehicleType?: string;
  hospitalName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  vehicleNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
