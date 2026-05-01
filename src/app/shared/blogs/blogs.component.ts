import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
}

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent {
  blogs: BlogPost[] = [
    {
      id: 2,
      title: 'Simplifying Landlord Life: How Rentmizo Automates Property Management',
      date: 'January 24, 2026',
      author: 'Rentmizo Team',
      category: 'Property Management',
      excerpt: 'Tired of chasing rent and losing track of maintenance requests? See how Rentmizo turns chaos into calm for property owners.',
      content: `
        <p>Being a property owner is rewarding, but let's face it: the day-to-day management can be a headache. From chasing late rent payments to keeping track of expirng leases and handling 2 AM maintenance calls, the list of tasks never ends.</p>

        <p>At Rentmizo, we built our platform with one core mission: <strong>Make life easier for landlords.</strong> Here is how we do it.</p>

        <h3>1. Automated Rent Collection</h3>
        <p>The days of knocking on doors or sending awkward "Where is the rent?" texts are over. Rentmizo automates the entire collection process.</p>
        <ul>
            <li><strong>Automatic Invoices:</strong> We generate and send professional rent invoices to your tenants automatically.</li>
            <li><strong>Smart Reminders:</strong> Our system sends gentle reminders via SMS and Email before the due date, reducing late payments significantly.</li>
            <li><strong>Multiple Payment Options:</strong> Tenants can pay online via UPI, Credit Card, or Net Banking, making it convenient for them and ensuring you get paid faster.</li>
        </ul>

        <h3>2. Centralized Digital Records</h3>
        <p>Stop digging through filing cabinets or searching through old WhatsApp chats for that one document. Rentmizo acts as your secure digital vault.</p>
        <ul>
            <li><strong>Lease Storage:</strong> Keep all rental agreements safely stored and easily accessible.</li>
            <li><strong>Tenant ID Proofs:</strong> Securely upload and manage KYC documents for all your tenants.</li>
            <li><strong>Unit History:</strong> View the complete history of a unit—who lived there, when they moved out, and what maintenance was done.</li>
        </ul>

        <h3>3. Streamlined Maintenance</h3>
        <p>Maintenance requests often get lost in translation. With Rentmizo, tenants can raise tickets directly through their app, complete with photos and descriptions.</p>
        <p>You get notified instantly and can track the progress of every repair. This keeps your property in top shape and your tenants happy.</p>

        <h3>4. Financial Clarity</h3>
        <p>No more manual spreadsheets. Our dashboard gives you a real-time view of your financial health.</p>
        <ul>
            <li><strong>Income Tracking:</strong> See exactly how much rent has been collected this month.</li>
            <li><strong>Expense Management:</strong> Log maintenance costs and other expenses to see your net income.</li>
            <li><strong>Pending Dues:</strong> Instantly identify which units have overdue payments.</li>
        </ul>

        <h3>Conclusion</h3>
        <p>Rentmizo isn't just software; it's your 24/7 property manager. By automating the repetitive tasks, we give you back the one thing money can't buy: your time.</p>
      `,
      image: 'assets/blog-ease.jpg'
    }
  ];
}
