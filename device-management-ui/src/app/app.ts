import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
