export interface UnitModel {
    id?: string;
    ownerId: string;
    propertyId: string;
    tenantId?: string;
    unitName: string;
    rentAmount: number;
    securityDeposit: number;
    isOccupied: boolean;
    dueDay: number;
    notes?: string;
    createdBy: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
}

export interface UnitCreateRequest {
    ownerId: string;
    propertyId: string;
    tenantId?: string;
    unitName: string;
    rentAmount: number;
    securityDeposit: number;
    isOccupied: boolean;
    dueDay: number;
    notes?: string;
    createdBy: string;
}

export interface UnitUpdateRequest {
    id: string;
    ownerId: string;
    propertyId: string;
    tenantId?: string;
    unitName: string;
    rentAmount: number;
    securityDeposit: number;
    isOccupied: boolean;
    dueDay: number;
    notes?: string;
    isActive: boolean;
    updatedBy: string;
}

export interface PropertyOption {
    id: string;
    propertyName: string;
}

