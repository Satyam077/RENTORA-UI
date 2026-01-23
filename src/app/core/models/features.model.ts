export interface Features {
    id?: string;
    name: string;
    description: string;
    category: string;
    imageUrl?: string;
    imageFile?: File; // For frontend use
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
