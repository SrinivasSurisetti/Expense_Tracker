import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    // Validation
    if (!this.email || !this.password) {
      alert("Please fill in all fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert("Please enter a valid email address (e.g., user@example.com)");
      return;
    }

    this.isLoading = true;

    const data = {
      email: this.email,
      password: this.password
    };

    this.auth.login(data).subscribe(
      (res: any) => {
        this.isLoading = false;
        
        if (res && res.token) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("userEmail", this.email); // Store email for data persistence
          alert("Login Successful");
          // Navigate to home or use reload if API doesn't support direct routing
          window.location.href = '/';
        } else {
          alert("Login failed: No token received");
        }
      },
      (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        alert("Login Failed: " + (err.error?.message || err.statusText || 'Unknown error'));
      }
    );
  }

}