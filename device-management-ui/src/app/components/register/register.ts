import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly apiUrl = 'http://localhost:5125/api/Auth/register';

  formData = {
    name: '',
    role: '',
    location: '',
    email: '',
    password: '',
  };

  message = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(): void {
    this.message = '';
    this.errorMessage = '';

    if (
      !this.formData.name.trim() ||
      !this.formData.role.trim() ||
      !this.formData.location.trim() ||
      !this.formData.email.trim() ||
      !this.formData.password.trim()
    ) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.http.post(this.apiUrl, this.formData).subscribe({
      next: () => {
        this.message = 'Registration successful.';
        this.formData = {
          name: '',
          role: '',
          location: '',
          email: '',
          password: '',
        };
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Register error:', error);
        this.errorMessage = error?.error || 'Registration failed.';
      },
    });
  }
}
