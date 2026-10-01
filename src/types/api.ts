export type UserRole = 'ADMIN' | 'GESTOR' | 'OPERADOR';

export type SignalLightColor = 'GREEN' | 'YELLOW' | 'RED';

export type MachineOperationalStatus = 
  | 'OPERATING' 
  | 'MAINTENANCE' 
  | 'STOPPED' 
  | 'NO_COMMUNICATION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  receiveAlerts: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export interface LoginResponseData {
  accessToken: string;
  user: User;
}