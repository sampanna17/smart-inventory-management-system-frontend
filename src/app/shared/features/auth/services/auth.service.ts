import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/auth';

  createAdmin(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }
}
