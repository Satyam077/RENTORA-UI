import { Features } from "./features.model";

export interface Plans {
    id?: string;
    planName: string;
    description: string;
    price: number;
    yearlyDiscount: number;
    isMarkedAsPopular: boolean;
    features?: Features[];
    featureIds?: string[];
}
