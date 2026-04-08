import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly apiUrl = 'http://localhost:5125/api/Auth/login';

  formData = {
    email: '',
    password: '',
  };

  message = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.formData.email.trim() || !this.formData.password.trim()) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.http.post<any>(this.apiUrl, this.formData).subscribe({
      next: (response) => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.message = `Login successful. Welcome, ${response.name}.`;
        this.formData = {
          email: '',
          password: '',
        };
        this.router.navigate(['/devices']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error?.error || 'Login failed.';
      },
    });
  }
}
