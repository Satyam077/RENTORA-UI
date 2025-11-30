import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);

  // Token from cookie or localStorage
  const token = localStorage.getItem('token');
  //console.log('Auth Guard - Retrieved token:', token);
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
