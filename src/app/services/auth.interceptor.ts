import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  const isApiCall = req.url.startsWith(API_BASE_URL);

  if (!token || !isApiCall) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
