import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { User } from '../Models/user';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to currentUser$ observable to get real-time updates
    this.userSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );

    // Also get the current value immediately
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getUserInitials(): string {
    if (this.currentUser?.nom && this.currentUser?.prenom) {
      return (this.currentUser.prenom[0] + this.currentUser.nom[0]).toUpperCase();
    }
    return 'US';
  }

  logout() {
    this.authService.logout();
  }

  // Helper methods to check user roles
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isTechnicien(): boolean {
    return this.authService.isTechnicien();
  }

  isUser(): boolean {
    return this.authService.isUser();
  }
}
