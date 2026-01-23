export interface PropertyAddress {
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface UnitModel {
  tenantId?: string;
  unitName: string;
  rentAmount: number;
  securityDeposit: number;
  isOccupied: boolean;
  notes?: string;
}

export interface PropertyModel {
  id?: string;
  ownerId: string;
  propertyName: string;
  description: string;
  type: number;
  address: PropertyAddress;
  units: UnitModel[];
  images: string[];
  documents: string[];
  isFullyOccupied: boolean;
  totalUnits: number;
  occupiedUnits: number;
  defaultRentAmount: number;
  defaultDueDay: number;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface PropertyCreateRequest {
  ownerId: string;
  propertyName: string;
  description: string;
  type: number;
  address: PropertyAddress;
  images: string[];
  documents: string[];
  defaultRentAmount: number;
  defaultDueDay: number;
  notes?: string;
  createdBy: string;
}

export interface PropertyUpdateRequest {
  id: string;
  ownerId: string;
  propertyName: string;
  description: string;
  type: number;
  address: PropertyAddress;
  images: string[];
  documents: string[];
  defaultRentAmount: number;
  defaultDueDay: number;
  notes?: string;
  isActive: boolean;
  updatedBy: string;
}
