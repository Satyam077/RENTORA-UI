import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = sessionStorage.getItem('token');
  // if (!token) {
  //   router.navigate(['/login']);
  //   return false;
  // }
  if (!authService.isLoggedIn()) {
    sessionStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  return true;
};
