export interface Maintenance {
    id?: string;
    ownerId?: string;
    tenantId: string;
    propertyId?: string;
    unitId?: string;
    category: string; // Plumbing, Electrical, HVAC, Locks/Keys, Pest Control, General
    title: string;
    description: string;
    photoUrls: string[];
    priority: number; // Priority enum: Low=0, Medium=1, High=2
    status: number; // Status enum: Open=4, Closed=5, InProgress=6, Scheduled=7
    scheduledDate?: Date;
    updateCount: number;
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    isDeleted?: boolean;
    createdBy?: string;
    updatedBy?: string;

    // Navigation properties
    property?: {
        id?: string;
        propertyName?: string;
        ownerId?: string;
    };
    unit?: {
        id?: string;
        unitName?: string;
        unitNumber?: string;
    };
}

export interface MaintenanceStats {
    active: number;
    completed: number;
    avgRating: number;
}

// Status Enum values matching C# backend
export enum StatusEnum {
    Active = 0,
    Inactive = 1,
    Pending = 2,
    Deleted = 3,
    Open = 4,
    Closed = 5,
    InProgress = 6,
    Scheduled = 7
}

// Priority Enum values matching C# backend
export enum PriorityEnum {
    Low = 0,
    Medium = 1,
    High = 2
}

