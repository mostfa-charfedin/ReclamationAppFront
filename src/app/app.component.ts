import { Component } from '@angular/core';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ReclamationAppFront';
constructor(private authService: AuthService) {}



    isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
