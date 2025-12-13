export interface AgreementModel {
    id?: string;
    propertyId: string;
    propertyName?: string;
    unitId: string;
    unitName?: string;
    tenantId: string;
    tenantName?: string;
    ownerId: string;
    agreementNumber: string;
    agreementType: AgreementType;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    securityDeposit: number;
    rentDueDay: number;
    agreementFileUrl?: string;
    status: AgreementStatus;
    terminatedOn?: Date | null;
    terminationReason?: string;
    isRenewed?: boolean;
    renewedFromAgreementId?: string;
    notes?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}

export interface AgreementCreateRequest {
    propertyId: string;
    unitId: string;
    tenantId: string;
    ownerId: string;
    agreementNumber: string;
    agreementType: AgreementType;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    securityDeposit: number;
    rentDueDay?: number;
    agreementFileUrl?: string;
    status?: AgreementStatus;
    notes?: string;
    createdBy: string;
}

export interface AgreementUpdateRequest {
    id: string;
    propertyId: string;
    unitId: string;
    tenantId: string;
    ownerId: string;
    agreementNumber: string;
    agreementType: AgreementType;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    securityDeposit: number;
    rentDueDay?: number;
    agreementFileUrl?: string;
    status: AgreementStatus;
    terminatedOn?: Date | null;
    terminationReason?: string;
    isRenewed?: boolean;
    renewedFromAgreementId?: string;
    notes?: string;
    isActive?: boolean;
    updatedBy: string;
}

export enum AgreementType {
    Residential = 0,
    Commercial = 1,
    PG = 2,
    Office = 3,
    ShortTerm = 4,
    Other = 5
}

export enum AgreementStatus {
    Draft = 0,
    Active = 1,
    Expired = 2,
    Terminated = 3
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

export interface TenantOption {
    id: string;
    fullName: string;
    propertyId?: string;
    unitId?: string;
}
