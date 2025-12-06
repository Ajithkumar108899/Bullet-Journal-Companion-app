export interface User {
  id?: string | number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  name?: string; // Computed: firstName + lastName
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
  success?: boolean;
  message?: string;
  token?: string; // For backward compatibility
}

