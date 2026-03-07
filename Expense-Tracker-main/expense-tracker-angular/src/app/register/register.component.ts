import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  email = '';
  password = '';
  confirmPassword = '';
  name = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!this.email || !this.password || !this.name) {
      alert("Please fill in all fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert("Please enter a valid email address (e.g., user@example.com)");
      return;
    }

    if (this.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.auth.register(data).subscribe((res: any) => {
      alert("Registration Successful");
      // Store user email for persistent data identification
      localStorage.setItem('userEmail', this.email);
      this.router.navigate(['/login']);
    }, err => {
      alert("Registration Failed: " + (err.error?.message || err.statusText || 'Unknown error'));
    });
  }

}
