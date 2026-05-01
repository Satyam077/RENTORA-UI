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
import { FeaturesComponent } from '../Rentora-Management/features/features.component';
import { PlansComponent } from '../Rentora-Management/plans/plans.component';
import { SubscriptionsComponent } from '../landlords/subscriptions/subscriptions.component';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { BillingComponent } from "../landlords/billing/billing.component";

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
    FeaturesComponent,
    PlansComponent,
    SubscriptionsComponent,
    // Angular Material
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatDialogModule,
    SpinnerComponent,
    BillingComponent
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
  logsDisplayedColumns = ['recipient', 'type', 'subject', 'status', 'sentAt', 'actions'];

  constructor(
    private emailTemplateService: EmailTemplateService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const json = sessionStorage.getItem('currentUser');
    if (!json) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = JSON.parse(json);
    this.role = Number(currentUser.user?.role) as Role;

    this.loadEmailTemplates();
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
        this.showSnackBar('Failed to load email templates.', 'error');
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

    this.error = '';
    this.success = '';

    if (
      !this.selectedEmailTemplate.templateName ||
      !this.selectedEmailTemplate.emailSubject ||
      !this.selectedEmailTemplate.emailBody
    ) {
      this.showSnackBar('Please fill in all required fields', 'error');
      return;
    }

    if (this.isAddingEmailTemplate) {
      const createRequest: EmailTemplateCreateRequest = {
        templateName: this.selectedEmailTemplate.templateName,
        emailSubject: this.selectedEmailTemplate.emailSubject,
        emailBody: this.selectedEmailTemplate.emailBody,
        applicableFor: this.selectedEmailTemplate.applicableFor,
        tokens: this.selectedEmailTemplate.tokens,
      };

      this.emailTemplateService.createTemplate(createRequest).subscribe({
        next: (response: any) => {
          const template = response.data || response;
          const message = response.message || 'Email template created successfully!';
          this.emailTemplates.unshift(template);
          this.showSnackBar(message);
          this.cancelEmailTemplateEdit();
        },
        error: (err) => {
          const msg = err.error?.message || err.error || err.message || 'Failed to create email template.';
          this.showSnackBar(typeof msg === 'string' ? msg : 'Failed to create template.', 'error');
        },
      });
    } else if (this.isEditingEmailTemplate && this.selectedEmailTemplate.id) {
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
          const message = response.message || 'Email template updated successfully!';
          const index = this.emailTemplates.findIndex((t) => t.id === template.id);
          if (index !== -1) this.emailTemplates[index] = template;
          this.showSnackBar(message);
          this.cancelEmailTemplateEdit();
        },
        error: (err) => {
          const msg = err.error?.message || err.error || err.message || 'Failed to update email template.';
          this.showSnackBar(typeof msg === 'string' ? msg : 'Failed to update template.', 'error');
        },
      });
    }
  }

  deleteEmailTemplate(template: EmailTemplate): void {
    if (!template.id) return;

    if (confirm(`Are you sure you want to delete the template "${template.templateName}"?`)) {
      this.emailTemplateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.emailTemplates = this.emailTemplates.filter((t) => t.id !== template.id);
          this.showSnackBar('Template deleted successfully!');
        },
        error: () => {
          this.showSnackBar('Failed to delete email template.', 'error');
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
        if (index !== -1) this.emailTemplates[index] = updated;
      },
      error: () => { },
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

  // Communication Logs Methods
  filterLogs() {
    this.filteredLogs = this.communicationLogs.filter((log) => {
      const typeMatch = this.logFilterType === 'all' || log.type === this.logFilterType;
      const statusMatch = this.logFilterStatus === 'all' || log.status === this.logFilterStatus;
      return typeMatch && statusMatch;
    });
  }

  viewLogDetails(log: CommunicationLog) {
    this.showSnackBar(`${log.type.toUpperCase()} to ${log.recipient}: ${log.message}`);
  }

  retryFailedLog(log: CommunicationLog) {
    log.status = 'pending';
    this.showSnackBar('Retrying to send message...');
  }

  getStatusChipColor(status: string): string {
    switch (status) {
      case 'sent': return 'accent';
      case 'failed': return 'warn';
      case 'pending': return 'primary';
      default: return 'primary';
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-bar-error'] : ['snack-bar-success'],
    });
  }
}
