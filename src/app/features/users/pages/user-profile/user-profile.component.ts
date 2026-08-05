import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroUser, 
  heroEnvelope, 
  heroShieldCheck, 
  heroCalendar,
  heroPencil,
  heroCheck,
  heroXMark
} from '@ng-icons/heroicons/outline';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserProfile, UpdateProfileRequest } from '../../models/user-profile.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, DatePipe],
  viewProviders: [provideIcons({ 
    heroUser, heroEnvelope, heroShieldCheck, heroCalendar, heroPencil, heroCheck, heroXMark 
  })],
  templateUrl: './user-profile.component.html',
  styleUrls: []
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  profile = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      fullName: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.authService.currentUser();
    if (!user || !user.userId) {
      this.isLoading.set(false);
      this.toastr.error('User session invalid.');
      return;
    }

    this.isLoading.set(true);
    this.userService.getProfile(user.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile.set(response.data);
          this.resetFormToProfile();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load profile.');
        this.isLoading.set(false);
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode()) {
      // Cancel edit mode
      this.resetFormToProfile();
      this.profileForm.disable();
      this.isEditMode.set(false);
    } else {
      // Enter edit mode
      this.profileForm.enable();
      this.isEditMode.set(true);
    }
  }

  private resetFormToProfile(): void {
    const currentProfile = this.profile();
    if (currentProfile) {
      this.profileForm.patchValue({
        fullName: currentProfile.fullName,
        email: currentProfile.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentProfile = this.profile();
    if (!currentProfile) return;

    const formValues = this.profileForm.value;
    
    // Prevent unnecessary API calls if nothing has changed
    if (formValues.fullName === currentProfile.fullName && formValues.email === currentProfile.email) {
      this.profileForm.disable();
      this.isEditMode.set(false);
      this.toastr.info('No changes made to the profile.');
      return;
    }

    const request: UpdateProfileRequest = {};
    if (formValues.fullName !== currentProfile.fullName) {
      request.fullName = formValues.fullName;
    }
    if (formValues.email !== currentProfile.email) {
      request.email = formValues.email;
    }

    this.isSaving.set(true);
    this.userService.updateProfile(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile.set(response.data);
          this.updateAuthServiceSession(response.data);
          this.toastr.success(response.message || 'Profile updated successfully.');
          this.profileForm.disable();
          this.isEditMode.set(false);
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to update profile.';
        this.toastr.error(errorMsg, 'Validation Error');
        this.isSaving.set(false);
      }
    });
  }

  // Update the global auth signal and localStorage so the navbar updates instantly
  private updateAuthServiceSession(updatedProfile: UserProfile): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      const updatedSessionUser = {
        ...currentUser,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email
      };
      this.authService.currentUser.set(updatedSessionUser);
      if (typeof localStorage !== 'undefined') {
         localStorage.setItem('currentUser', JSON.stringify(updatedSessionUser));
      }
    }
  }

  get f() {
    return this.profileForm.controls;
  }
}
