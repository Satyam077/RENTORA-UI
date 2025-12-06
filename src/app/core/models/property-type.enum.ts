export enum PropertyType {
    Apartment = 1,
    IndependentHouse = 2,
    PG = 3,
    CommercialShop = 4,
    OfficeSpace = 5,
    Warehouse = 6,
    Land = 7,
    Other = 8
}

export const PropertyTypeLabels: { [key in PropertyType]: string } = {
    [PropertyType.Apartment]: 'Apartment',
    [PropertyType.IndependentHouse]: 'Independent House',
    [PropertyType.PG]: 'PG',
    [PropertyType.CommercialShop]: 'Commercial Shop',
    [PropertyType.OfficeSpace]: 'Office Space',
    [PropertyType.Warehouse]: 'Warehouse',
    [PropertyType.Land]: 'Land',
    [PropertyType.Other]: 'Other'
};
