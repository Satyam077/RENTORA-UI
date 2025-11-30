export interface RegistrationRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  dateOfBirth?: Date;
  role?: string;
  tenantId?: string;
  ownerId?: string;
}

export interface LoginRequest {
  emailOrMobile: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}

export interface OtpRequest {
  emailOrMobile: string;
  otpCode: string;
}
