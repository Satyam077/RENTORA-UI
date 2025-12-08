export interface TenantModel {
    id?: string;
    ownerId: string;
    propertyId: string;
    unitId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    password?: string;
    otp?: string;
    gender?: string;
    fatherName?: string;
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
    password?: string;
    gender?: string;
    fatherName?: string;
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
    password?: string;
    gender?: string;
    fatherName?: string;
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
