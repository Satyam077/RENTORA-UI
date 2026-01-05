export enum ApplicableFor {
    SuperAdmin = 1,
    Admin = 2,
    Landlords = 3,
    Tenants = 4,
    Agents = 5,
    Manager = 6
}


export enum EmailTemplateName {
    SuperAdminRegistration = 0,
    AdminRegistration = 1,
    LandlordsRegistration = 2,
    BackOfficeUserRegistration = 3,
    TenantsRegistration = 4,
    ForgotPassword = 5,
    UserLoginOtp = 6,
    HelpdeskQuery = 7
}

export interface EmailTemplate {
    id?: string;
    tokens?: string;
    templateName: string;
    emailTemplateName?: EmailTemplateName;
    emailSubject: string;
    emailBody: string;
    applicableFor: string;
    applicableForName?: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface EmailTemplateCreateRequest {
    tokens?: string;
    templateName: string;
    emailSubject: string;
    emailBody: string;
    applicableFor: string;
}

export interface EmailTemplateUpdateRequest {
    id: string;
    tokens?: string;
    templateName: string;
    emailSubject: string;
    emailBody: string;
    applicableFor: string;
    isActive: boolean;
}

export const ApplicableForLabels: { [key in ApplicableFor]: string } = {
    [ApplicableFor.SuperAdmin]: 'Super Admin',
    [ApplicableFor.Admin]: 'Admin',
    [ApplicableFor.Landlords]: 'Landlords',
    [ApplicableFor.Tenants]: 'Tenants',
    [ApplicableFor.Agents]: 'Agents',
    [ApplicableFor.Manager]: 'Manager'
};

export const EmailTemplateNameLabels: { [key in EmailTemplateName]: string } = {
    [EmailTemplateName.SuperAdminRegistration]: 'Super Admin Registration',
    [EmailTemplateName.AdminRegistration]: 'Admin Registration',
    [EmailTemplateName.LandlordsRegistration]: 'Landlords Registration',
    [EmailTemplateName.BackOfficeUserRegistration]: 'Agents Registration',
    [EmailTemplateName.TenantsRegistration]: 'Tenants Registration',
    [EmailTemplateName.ForgotPassword]: 'Forgot Password',
    [EmailTemplateName.UserLoginOtp]: 'User Login Otp',
    [EmailTemplateName.HelpdeskQuery]: 'Helpdesk Query'
};
