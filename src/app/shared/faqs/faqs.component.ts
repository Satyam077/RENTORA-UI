import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css'
})
export class FaqsComponent {
  faqs: FaqItem[] = [
    {
      question: 'What is Rentora PMS?',
      answer: 'Rentora is a property management system that helps landlords manage properties, tenants, rent, electricity bills, maintenance, and agreements in one place.'
    },
    {
      question: 'Who can use Rentora?',
      answer: 'Rentora is designed for: Property owners / landlords, Real estate agents, Tenants, and Small societies and PG owners.'
    },
    {
      question: 'Is Rentora available on mobile and web?',
      answer: 'Yes. Rentora works on both web browsers and mobile apps, so you can manage your property anytime, anywhere.'
    },
    {
      question: 'Do tenants need to register themselves?',
      answer: 'No. Tenants are added by the landlord or admin. Tenants receive an invitation and log in using OTP/Password.'
    },
    {
      question: 'How do tenants log in to Rentora?',
      answer: 'Tenants log in using their mobile number or email with OTP/Password.'
    },
    {
      question: 'Can I manage multiple properties in Rentora?',
      answer: 'Yes. You can add and manage multiple properties and units under one account.'
    },
    {
      question: 'How is rent calculated in Rentora?',
      answer: 'Rentora allows you to: Set fixed monthly rent, Add electricity usage (per unit), and Add maintenance charges. All are combined into one monthly bill.'
    },
    {
      question: 'Can electricity bills change every month?',
      answer: 'Yes. Electricity units can be updated monthly, and the bill is calculated automatically based on the rate per unit.'
    },
    {
      question: 'Can I add maintenance charges?',
      answer: 'Yes. You can add a fixed monthly maintenance charge, which is included in the tenant’s bill.'
    },
    {
      question: 'Will tenants see a bill breakup?',
      answer: 'Yes. Tenants can clearly see: Rent amount, Electricity charges, Maintenance charges, and Total payable amount.'
    },
    {
      question: 'Does Rentora send rent reminders?',
      answer: 'Yes. Rentora can send: Bill generation notifications, Rent due reminders, and Overdue payment alerts. This reduces manual follow-ups.'
    },
    {
      question: 'Can tenants raise maintenance complaints?',
      answer: 'Yes. Tenants can raise maintenance requests, add photos, and track the status.'
    },
    {
      question: 'Can I upload rental agreements and documents?',
      answer: 'Yes. Rentora allows you to upload and store: Rental agreements, Tenant ID proofs, and Property documents.'
    },
    {
      question: 'Does Rentora support online payments?',
      answer: 'Online payment support can be enabled. For early users, payments can also be marked manually.'
    },
    {
      question: 'Is Rentora safe and secure?',
      answer: 'Yes. Rentora uses secure login, role-based access, and data protection to keep your information safe.'
    },
    {
      question: 'Can I track paid and pending rent?',
      answer: 'Yes. You can easily see: Paid rent, Pending rent, and Overdue payments from your dashboard.'
    },
    {
      question: 'Can tenants pay rent in parts?',
      answer: 'This feature can be enabled depending on your plan and payment settings.'
    },
    {
      question: 'What happens when a tenant moves out?',
      answer: 'You can mark the tenant as moved out. The unit becomes vacant, and tenant access is disabled.'
    },
    {
      question: 'Is Rentora suitable for small landlords?',
      answer: 'Yes. Rentora is perfect for: Owners with 2–3 properties, Owners with 10–50 units. It grows with your needs.'
    },
    {
      question: 'How do I get started with Rentora?',
      answer: 'Simply register as a landlord, add your property and tenants, and start managing everything from one dashboard.'
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
