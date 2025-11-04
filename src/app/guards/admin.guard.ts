import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.role === 'ADMIN') {
      return true;
    }

    console.warn('Accès refusé: Rôle ADMIN requis');
    this.router.navigate(['/forbidden']);
    return false;
  }
}
