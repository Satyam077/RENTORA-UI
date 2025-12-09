// TenantModel now matches TenantResponseDTO from backend
// This combines Tenant and User data (no redundancy)
export interface TenantModel {
    // Tenant ID
    id?: string;

    // User Information (from Registration/Users collection)
    userId: string;
    fullName: string;
    email: string;
    mobile: string;
    gender?: string;
    dateOfBirth?: Date | null;
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    profileImageUrl?: string;

    // Tenant-specific Information (from Tenants collection)
    ownerId: string;
    propertyId: string;
    unitId: string;
    permanentAddress?: string;
    currentAddress?: string;

    // Rent & Agreement Info
    rentAmount: number;
    securityDeposit?: number;
    rentDueDay?: number;
    agreementStartDate: Date;
    agreementEndDate: Date;
    isAgreementExpired?: boolean;

    // KYC / ID Proof
    documents?: string[];
    idProofType?: string;
    idProofNumber?: string;

    // Status Tracking
    isActiveTenant?: boolean;
    isRentPending?: boolean;
    isMovedOut?: boolean;
    moveInDate?: Date | null;
    moveOutDate?: Date | null;
    notes?: string;

    // Base Entity Fields
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}

export interface TenantCreateRequest {
    ownerId: string;
    propertyId: string;
    unitId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    gender?: string;
    dateOfBirth?: Date | null;
    permanentAddress?: string;
    currentAddress?: string;
    rentAmount: number;
    securityDeposit?: number;
    rentDueDay?: number;
    agreementStartDate: Date;
    agreementEndDate: Date;
    documents?: string[];
    idProofType?: string;
    idProofNumber?: string;
    moveInDate?: Date | null;
    notes?: string;
    createdBy: string;
}

export interface TenantUpdateRequest {
    id: string;
    ownerId: string;
    propertyId: string;
    unitId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    gender?: string;
    dateOfBirth?: Date | null;
    permanentAddress?: string;
    currentAddress?: string;
    rentAmount: number;
    securityDeposit?: number;
    rentDueDay?: number;
    agreementStartDate: Date;
    agreementEndDate: Date;
    isAgreementExpired?: boolean;
    documents?: string[];
    idProofType?: string;
    idProofNumber?: string;
    isActiveTenant?: boolean;
    isRentPending?: boolean;
    isMovedOut?: boolean;
    moveInDate?: Date | null;
    moveOutDate?: Date | null;
    notes?: string;
    isActive?: boolean;
    updatedBy: string;
}

export interface PropertyOption {
    id: string;
    propertyName: string;
}

export interface UnitOption {
    id: string;
    unitName: string;
    propertyId: string;
}
