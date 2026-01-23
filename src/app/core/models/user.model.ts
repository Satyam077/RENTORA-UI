import { Role } from './role.enum';

export interface RegistrationRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  dateOfBirth?: Date;
  role?: Role;
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
  address:
  { addressLine1: string; addressLine2: string; city: string; state: string; country: string; zipCode: string; };
  dateOfBirth: string;
  gender: string;
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  profileImageUrl?: string;
}

export interface OtpRequest {
  emailOrMobile: string;
  otpCode: string;
}

// User model matching Registration entity
export interface User {
  id?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: Date | string;
  email: string;
  isEmailVerified?: boolean;
  mobile: string;
  isMobileVerified?: boolean;
  password?: string;
  confirmPassword?: string;
  profileImageUrl?: string;
  address?: Address;
  role: Role;
  tenantId?: string;
  ownerId?: string;
  createdBy?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Address {
  id?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UserCreateRequest {
  fullName: string;
  gender?: string;
  dateOfBirth?: Date | string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword?: string;
  profileImageUrl?: string;
  address?: Address;
  role: Role;
  tenantId?: string;
  ownerId?: string;
}

export interface UserUpdateRequest {
  id: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: Date | string;
  email: string;
  mobile: string;
  profileImageUrl?: string;
  address?: Address;
  role: Role;
  tenantId?: string;
  ownerId?: string;
  isActive?: boolean;
}
