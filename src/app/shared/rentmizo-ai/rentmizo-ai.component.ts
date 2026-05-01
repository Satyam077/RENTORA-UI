import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contants } from '../../constants';

interface ChatMessage {
  text: string;
  type: 'bot' | 'user';
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-rentmizo-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rentmizo-ai.component.html',
  styleUrls: ['./rentmizo-ai.component.css']
})
export class RentmizoAiComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  isTyping = false;
  botAvatar = 'assets/Images/anime-bot.png';
  constants = new Contants();

  messages: ChatMessage[] = [
    { text: "Hi there! I'm your Rentmizo Assistant. How can I help you today?", type: 'bot' }
  ];

  faqs: FAQ[] = [
    { question: "What is Rentmizo?", answer: "Rentmizo is an all-in-one property management platform designed for landlords, property managers, and tenants to streamline property operations." },
    { question: "How do I register?", answer: "You can register by clicking the 'Register as Landlord' button on our homepage. Follow the steps to set up your account!" },
    { question: "Multiple properties?", answer: "Yes! Rentmizo allows you to manage an unlimited number of properties and units from a single dashboard." },
    { question: "Rent collection?", answer: "Rent collection is automated via our secure payment gateway. Tenants get reminders, and funds are settled directly to your bank account." },
    { question: "Mobile app?", answer: "Our platform is fully responsive and works perfectly on mobile browsers. Dedicated apps for iOS and Android are coming soon!" },
    { question: "Add a tenant?", answer: "Go to your 'Tenants' tab in the dashboard and click 'Add Tenant'. You'll need their basic details and email." },
    { question: "Maintenance tracking?", answer: "Yes! Tenants can raise maintenance tickets, and you can track their progress, assign vendors, and manage costs." },
    { question: "Pricing plans?", answer: "We offer several plans: Basic (Free), Pro (₹499/mo), and Enterprise (Custom). Check our Plans page for details!" },
    { question: "Free trial?", answer: "Yes, we offer a 30-day free trial on our Pro plan so you can explore all premium features." },
    { question: "Generate invoices?", answer: "Rentmizo automatically generates digital invoices for every rent payment and maintenance cost." },
    { question: "Online payments?", answer: "Tenants can pay via UPI, Credit/Debit cards, and Net Banking through our secure Rentmizo Pay integration." },
    { question: "Data security?", answer: "We use bank-grade encryption and secure cloud hosting to ensure your property and tenant data is always safe." },
    { question: "Lease agreements?", answer: "You can upload and manage digital lease agreements, track expiry dates, and get renewal alerts." },
    { question: "Automated reminders?", answer: "Our system sends automated SMS and Email reminders to tenants before their rent is due." },
    { question: "Financial reports?", answer: "Yes, you can export detailed revenue, expense, and tax reports in PDF and Excel formats." },
    { question: "Contact support?", answer: "You can reach us at support@rentmizo.com or call our helpline at +91-XXXXXXXXXX." },
    { question: "Rentmizo Pay?", answer: "Rentmizo Pay is our integrated payment solution that simplifies rent collection and vendor payouts." },
    { question: "Utility bills?", answer: "Landlords can record and track utility bill payments (Electricity, Water, etc.) for each unit." },
    { question: "Document storage?", answer: "We provide secure cloud storage for property photos, tenant IDs, and legal documents." },
    { question: "Custom emails?", answer: "Yes! You can customize the content and branding of your automated notifications in the settings." }
  ];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 1) {
      // Small delay for natural feel
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.messages.push({ text: userText, type: 'user' });
    this.userInput = '';

    this.processResponse(userText);
  }

  selectQuestion(faq: FAQ) {
    this.messages.push({ text: faq.question, type: 'user' });
    this.isTyping = true;
    
    setTimeout(() => {
      this.messages.push({ text: faq.answer, type: 'bot' });
      this.isTyping = false;
    }, 800);
  }

  private processResponse(input: string) {
    this.isTyping = true;
    
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const match = this.faqs.find(f => 
        lowerInput.includes(f.question.toLowerCase()) || 
        f.question.toLowerCase().includes(lowerInput)
      );

      if (match) {
        this.messages.push({ text: match.answer, type: 'bot' });
      } else {
        this.messages.push({ 
          text: `I'm not sure about that. Please contact our support team at ${this.constants.email} for more information!`, 
          type: 'bot' 
        });
      }
      this.isTyping = false;
    }, 1000);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
