import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserProfile, UpdateProfileRequest } from '../models/user-profile.model';
import { USER_API } from '../constants/user.api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  getProfile(userId: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(USER_API.BY_ID(userId));
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(USER_API.UPDATE_PROFILE, data);
  }
}
