import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { EmailTemplateService } from '../../core/services/email-template.service';
import {
  EmailTemplate,
  EmailTemplateCreateRequest,
  EmailTemplateUpdateRequest,
  ApplicableFor,
  ApplicableForLabels,
  EmailTemplateName,
  EmailTemplateNameLabels,
} from '../../core/models/email-template.model';
import { Role } from '../../core/models/role.enum';
import { Router } from '@angular/router';
import { ProfileComponent } from '../../shared/profile/profile.component';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  isActive: boolean;
}

interface GlobalSetting {
  paymentGateway: string;
  billingPlan: string;
  currency: string;
  taxRate: number;
  lateFeePercentage: number;
  gracePeriodDays: number;
}

interface IntegrationConfig {
  email: {
    provider: string;
    apiKey: string;
    senderEmail: string;
    senderName: string;
    isEnabled: boolean;
  };
  sms: {
    provider: string;
    apiKey: string;
    senderId: string;
    isEnabled: boolean;
  };
  whatsapp: {
    provider: string;
    apiKey: string;
    phoneNumber: string;
    isEnabled: boolean;
  };
}

interface CommunicationLog {
  id: string;
  recipient: string;
  type: 'email' | 'sms' | 'whatsapp';
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
  message: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    QuillModule,
    ProfileComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  providers: [EmailTemplateService],
})
export class SettingsComponent implements OnInit {

  roles?: Role[];
  role: number = 0;


  // Email Templates
  emailTemplates: EmailTemplate[] = [];
  selectedEmailTemplate: EmailTemplate | null = null;
  isEditingEmailTemplate = false;
  isAddingEmailTemplate = false;
  isLoadingTemplates = false;
  success = '';
  error = '';

  // ApplicableFor enum and labels
  ApplicableFor = ApplicableFor;
  applicableForLabels = ApplicableForLabels;
  applicableForOptions = Object.keys(ApplicableFor)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      value: Number(key),
      label: ApplicableForLabels[Number(key) as ApplicableFor],
    }));

  // EmailTemplateName enum and labels
  EmailTemplateName = EmailTemplateName;
  emailTemplateNameLabels = EmailTemplateNameLabels;

  emailTemplateNameOptions = Object.keys(EmailTemplateName)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      value: Number(key),
      label: EmailTemplateNameLabels[Number(key) as EmailTemplateName],
    }));
  @ViewChild('quill') quillEditor: any;

  // Quill editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image'],
    ],
  };

  // Notification Templates (old mock data - keeping for backward compatibility)
  notificationTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to RENTORA',
      content:
        'Dear {{name}}, Welcome to RENTORA property management system...',
      isActive: true,
    },
    {
      id: '2',
      name: 'Payment Reminder',
      type: 'sms',
      content:
        'Hi {{name}}, Your rent payment of {{amount}} is due on {{date}}.',
      isActive: true,
    },
    {
      id: '3',
      name: 'Maintenance Update',
      type: 'whatsapp',
      content:
        'Hello {{name}}, Your maintenance request #{{ticketId}} has been updated.',
      isActive: true,
    },
  ];

  selectedTemplate: NotificationTemplate | null = null;
  isEditingTemplate = false;

  // Global Settings
  globalSettings: GlobalSetting = {
    paymentGateway: 'stripe',
    billingPlan: 'monthly',
    currency: 'USD',
    taxRate: 10,
    lateFeePercentage: 5,
    gracePeriodDays: 3,
  };

  // Integration Configs
  integrationConfig: IntegrationConfig = {
    email: {
      provider: 'SendGrid',
      apiKey: '',
      senderEmail: 'noreply@rentora.com',
      senderName: 'RENTORA',
      isEnabled: false,
    },
    sms: {
      provider: 'Twilio',
      apiKey: '',
      senderId: 'RENTORA',
      isEnabled: false,
    },
    whatsapp: {
      provider: 'Twilio',
      apiKey: '',
      phoneNumber: '',
      isEnabled: false,
    },
  };

  // Communication Logs
  communicationLogs: CommunicationLog[] = [
    {
      id: '1',
      recipient: 'john.doe@example.com',
      type: 'email',
      subject: 'Payment Confirmation',
      status: 'sent',
      sentAt: new Date('2024-12-02T10:30:00'),
      message: 'Your payment has been received successfully.',
    },
    {
      id: '2',
      recipient: '+1234567890',
      type: 'sms',
      subject: 'Rent Reminder',
      status: 'sent',
      sentAt: new Date('2024-12-02T09:15:00'),
      message: 'Your rent is due in 3 days.',
    },
    {
      id: '3',
      recipient: '+1234567891',
      type: 'whatsapp',
      subject: 'Maintenance Update',
      status: 'failed',
      sentAt: new Date('2024-12-01T14:20:00'),
      message: 'Your maintenance request has been completed.',
    },
  ];

  filteredLogs: CommunicationLog[] = [...this.communicationLogs];
  logFilterType: string = 'all';
  logFilterStatus: string = 'all';

  constructor(
    private emailTemplateService: EmailTemplateService,
    private router: Router,
  ) {}



  ngOnInit(): void {
    const json = sessionStorage.getItem('currentUser');
    if (!json) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = JSON.parse(json);
    this.role = Number(currentUser.user?.role) as Role;
    console.log('Current user role in settings:', this.role);

    // Set default active tab based on role
    if (this.role === 1 || this.role === 2) {
      this.activeTab = 'templates';
    } else if (this.role === 3) {
      this.activeTab = 'profiles';
    }

    this.loadEmailTemplates();
  }
activeTab:
    | 'templates'
    | 'global'
    | 'integrations'
    | 'logs'
    | 'profiles'
    | 'billingRates'
    | 'payment'
    | 'notifications' = 'templates';
  setActiveTab(
    tab:
      | 'templates'
      | 'global'
      | 'integrations'
      | 'logs'
      | 'profiles'
      | 'billingRates'
      | 'payment'
      | 'notifications',
  ) {
    this.activeTab = tab;
  }

  // Email Template Methods
  loadEmailTemplates(): void {
    this.isLoadingTemplates = true;
    this.emailTemplateService.getAllTemplates().subscribe({
      next: (templates) => {
        this.emailTemplates = templates;
        this.isLoadingTemplates = false;
      },
      error: (error) => {
        this.isLoadingTemplates = false;
        this.error = 'Failed to load email templates. Please try again later.';
      },
    });
  }

  openAddEmailTemplateModal(): void {
    this.selectedEmailTemplate = {
      templateName: this.emailTemplateNameLabels[0],
      emailTemplateName: EmailTemplateName.AdminRegistration,
      emailSubject: '',
      emailBody: '',
      applicableFor: this.applicableForLabels[ApplicableFor.Admin],
      tokens: '',
      isActive: true,
    };
    this.isAddingEmailTemplate = true;
  }

  editEmailTemplate(template: EmailTemplate): void {
    this.selectedEmailTemplate = { ...template };
    this.isEditingEmailTemplate = true;
    setTimeout(() => {
      if (this.quillEditor && this.selectedEmailTemplate?.emailBody) {
        this.quillEditor.quillEditor.root.innerHTML =
          this.selectedEmailTemplate.emailBody;
      }
    }, 50);
  }

  saveEmailTemplate(): void {
    if (!this.selectedEmailTemplate) return;

    // Clear previous messages
    this.error = '';
    this.success = '';

    if (
      !this.selectedEmailTemplate.templateName ||
      !this.selectedEmailTemplate.emailSubject ||
      !this.selectedEmailTemplate.emailBody
    ) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.isAddingEmailTemplate) {
      // Create new template
      const createRequest: EmailTemplateCreateRequest = {
        templateName: this.selectedEmailTemplate.templateName,
        emailSubject: this.selectedEmailTemplate.emailSubject,
        emailBody: this.selectedEmailTemplate.emailBody,
        applicableFor: this.selectedEmailTemplate.applicableFor,
        tokens: this.selectedEmailTemplate.tokens,
      };

      this.emailTemplateService.createTemplate(createRequest).subscribe({
        next: (response: any) => {
          console.log('Create response:', response);

          // Handle response structure - could be direct template or wrapped response
          const template = response.data || response;
          const message =
            response.message || 'Email template created successfully!';

          this.emailTemplates.unshift(template);
          this.success = message;
          this.cancelEmailTemplateEdit();

          // Auto-clear success message after 5 seconds
          setTimeout(() => {
            this.success = '';
          }, 5000);
        },
        error: (err) => {
          if (err.error?.message) {
            this.error = err.error.message;
          } else if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Failed to create email template. Please try again.';
          }
        },
      });
    } else if (this.isEditingEmailTemplate && this.selectedEmailTemplate.id) {
      // Update existing template
      const updateRequest: EmailTemplateUpdateRequest = {
        id: this.selectedEmailTemplate.id,
        templateName: this.selectedEmailTemplate.templateName,
        emailSubject: this.selectedEmailTemplate.emailSubject,
        emailBody: this.selectedEmailTemplate.emailBody,
        applicableFor: this.selectedEmailTemplate.applicableFor,
        tokens: this.selectedEmailTemplate.tokens,
        isActive: this.selectedEmailTemplate.isActive ?? true,
      };

      this.emailTemplateService.updateTemplate(updateRequest).subscribe({
        next: (response: any) => {
          const template = response.data || response;
          const message =
            response.message || 'Email template updated successfully!';

          const index = this.emailTemplates.findIndex(
            (t) => t.id === template.id,
          );
          if (index !== -1) {
            this.emailTemplates[index] = template;
          }

          this.success = message;
          this.cancelEmailTemplateEdit();

          setTimeout(() => {
            this.success = '';
          }, 5000);
        },
        error: (err) => {
          if (err.error?.message) {
            this.error = err.error.message;
          } else if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Failed to update email template. Please try again.';
          }
        },
      });
    }
  }

  deleteEmailTemplate(template: EmailTemplate): void {
    if (!template.id) return;

    if (
      confirm(
        `Are you sure you want to delete the template "${template.templateName}"?`,
      )
    ) {
      this.emailTemplateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.emailTemplates = this.emailTemplates.filter(
            (t) => t.id !== template.id,
          );
        },
        error: (error) => {
          alert('Failed to delete email template. Please try again.');
        },
      });
    }
  }

  toggleEmailTemplateStatus(template: EmailTemplate): void {
    if (!template.id) return;

    const updatedTemplate: EmailTemplateUpdateRequest = {
      id: template.id,
      templateName: template.templateName,
      emailSubject: template.emailSubject,
      emailBody: template.emailBody,
      applicableFor: template.applicableFor,
      tokens: template.tokens,
      isActive: !template.isActive,
    };

    this.emailTemplateService.updateTemplate(updatedTemplate).subscribe({
      next: (updated) => {
        const index = this.emailTemplates.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          this.emailTemplates[index] = updated;
        }
      },
      error: (error) => {},
    });
  }

  cancelEmailTemplateEdit(): void {
    this.selectedEmailTemplate = null;
    this.isEditingEmailTemplate = false;
    this.isAddingEmailTemplate = false;
  }

  getApplicableForLabel(applicableFor: ApplicableFor): string {
    return ApplicableForLabels[applicableFor] || 'Unknown';
  }

  editTemplate(template: NotificationTemplate) {
    this.selectedTemplate = { ...template };
    this.isEditingTemplate = true;
  }

  saveTemplate() {
    if (this.selectedTemplate) {
      const index = this.notificationTemplates.findIndex(
        (t) => t.id === this.selectedTemplate!.id,
      );
      if (index !== -1) {
        this.notificationTemplates[index] = { ...this.selectedTemplate };
      }
      this.cancelEditTemplate();
    }
  }

  cancelEditTemplate() {
    this.selectedTemplate = null;
    this.isEditingTemplate = false;
  }

  toggleTemplateStatus(template: NotificationTemplate) {
    template.isActive = !template.isActive;
  }

  saveGlobalSettings() {
    console.log('Saving global settings:', this.globalSettings);
  }

  saveIntegrationConfig() {
    console.log('Saving integration config:', this.integrationConfig);
    alert('Integration settings saved successfully!');
  }

  testIntegration(type: 'email' | 'sms' | 'whatsapp') {
    console.log(`Testing ${type} integration...`);
    alert(`Testing ${type} integration... Check your console for details.`);
  }

  // Communication Logs Methods
  filterLogs() {
    this.filteredLogs = this.communicationLogs.filter((log) => {
      const typeMatch =
        this.logFilterType === 'all' || log.type === this.logFilterType;
      const statusMatch =
        this.logFilterStatus === 'all' || log.status === this.logFilterStatus;
      return typeMatch && statusMatch;
    });
  }

  viewLogDetails(log: CommunicationLog) {
    alert(
      `Log Details:\n\nRecipient: ${log.recipient}\nType: ${log.type}\nSubject: ${log.subject}\nStatus: ${log.status}\nSent: ${log.sentAt}\nMessage: ${log.message}`,
    );
  }

  retryFailedLog(log: CommunicationLog) {
    console.log('Retrying failed log:', log);
    log.status = 'pending';
    alert('Retrying to send message...');
  }
}
