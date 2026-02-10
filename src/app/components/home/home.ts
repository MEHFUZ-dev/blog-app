import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf, NgClass, NgFor],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private subscription: Subscription | null = null;

    showMenu = false;
    activePage: string = 'Home'; // default
    isAuthenticated: boolean = false;
    userType: string = 'user'; // default to user
    mobileMenuOpen = false;
    isAdmin: boolean = false;

  constructor() {
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    this.auth.me().subscribe({
      next: (user) => {
        this.isAdmin = user.email === 'ansarmujavar@gmail.com' || user.email === 'mujawarmehfuz25@gmail.com';
      },
      error: () => {
        this.isAdmin = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

toggleMenu() {
  this.showMenu = !this.showMenu;
}

toggleMobileMenu() {
  this.mobileMenuOpen = !this.mobileMenuOpen;
}


signIn() {

}

goToAdmin() {
  this.router.navigate(['/admin']);
}

signOut() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLogged');
  this.isAuthenticated = false;
  this.isAdmin = false;
  this.router.navigate(['/home']);
}

services = [
  {
    title: 'Printing & Copying Services',
    items: [
      { name: 'Black & White Printing', desc: 'Professional B&W prints for documents, forms, and materials' },
      { name: 'Color Printing', desc: 'Vibrant color prints for marketing materials and presentations' },
      { name: 'Bulk Copying', desc: 'Large volume copying at competitive rates for businesses' },
      { name: 'Document Binding', desc: 'Professional binding for reports, presentations, and books' },
      { name: 'Lamination', desc: 'Protect your important documents with quality lamination' },
      { name: 'Same Day Service', desc: 'Quick turnaround for urgent printing and copying needs' }
    ]
  },
  {
    title: 'Typing Services',
    items: [
      { name: 'English Typing', desc: 'Professional English document typing with accuracy' },
      { name: 'Marathi Typing', desc: 'Native Marathi typing services for local documents' },
      { name: 'Hindi Typing', desc: 'Professional Hindi document typing services' },
      { name: 'Resume Building', desc: 'Professional resume typing and formatting services' },
      { name: 'Project Reports', desc: 'Academic project report typing and formatting' },
      { name: 'Data Entry', desc: 'Accurate and efficient data entry services' }
    ]
  },
  {
    title: 'Legal Documentation',
    items: [
      { name: 'Court Forms', desc: 'Assistance with various court document preparation' },
      { name: 'Legal Typing', desc: 'Professional typing of legal documents and forms' },
      { name: 'Affidavit Preparation', desc: 'Help with affidavit drafting and typing services' },
      { name: 'Notary Services', desc: 'Document notarization assistance and guidance' },
      { name: 'Agreement Drafting', desc: 'Basic agreement and contract typing services' },
      { name: 'Legal Consultation', desc: 'Basic legal guidance and documentation help' }
    ]
  },
  {
    title: 'Digital Services',
    items: [
      { name: 'Document Scanning', desc: 'High-quality scanning of all document types' },
      { name: 'PDF Conversion', desc: 'Convert documents to searchable PDFs' },
      { name: 'OCR Services', desc: 'Text recognition for editable documents' },
      { name: 'Photo Scanning', desc: 'Digitize your old photos and memories' },
      { name: 'Email Services', desc: 'Send scanned documents via email' },
      { name: 'USB Transfer', desc: 'Transfer digital files to USB drives' }
    ]
  },
  {
    title: 'Online Forms & Applications',
    items: [
      { name: 'Government Forms', desc: 'Assistance with various government applications' },
      { name: 'Aadhaar Services', desc: 'Help with Aadhaar-related applications' },
      { name: 'PAN Card Applications', desc: 'Assistance with PAN card applications' },
      { name: 'Bank Forms', desc: 'Help with banking document preparation' },
      { name: 'Educational Forms', desc: 'School and college application assistance' },
      { name: 'Job Applications', desc: 'Online job application form filling' }
    ]
  }
];

contactInfo = [
  {
    title: 'Address',
    value: `Simran Computers<br>
            Bazar Peth, Near Anand Hospital<br>
            Karjat, Maharashtra 414402`,
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    title: 'Phone',
    value: `<a href="tel:+918087881607" class="text-gray-900 hover:text-gray-700">+91 80878 81607</a>`,
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
  },
  {
    title: 'Email',
    value: `<a href="mailto:info@simrancomputers.com" class="text-gray-900 hover:text-gray-700">info@simrancomputers.com</a>`,
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8 M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    title: 'Working Hours',
    value: `Monday - Saturday: 9:00 AM - 8:00 PM<br>Sunday: Closed`,
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  }
];




}
