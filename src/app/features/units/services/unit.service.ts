import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Unit } from '../../../core/models/unit.model';
import { CreateUnitRequest, UpdateUnitRequest } from '../models/unit-request.model';
import { UNIT_API } from '../constants/unit.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  units = signal<Unit[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadUnits(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Unit[]>>(UNIT_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load units');
          this.toastr.error('Failed to load units');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.units.set(res.data);
        }
      });
  }

  createUnit(data: CreateUnitRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Unit>>(UNIT_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.units.update(units => [...units, res.data]);
            this.toastr.success(res.message || 'Unit created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create unit');
          return throwError(() => err);
        })
      );
  }

  updateUnit(id: number, data: UpdateUnitRequest) {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Unit>>(UNIT_API.UPDATE(id), data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
          this.units.update((units) => units.map((u) => (u.unitId === id ? res.data : u)));
          this.toastr.success(res.message || 'Unit updated successfully');
        }
      }),
      catchError((err) => {
        this.toastr.error(err.error?.message || 'Failed to update unit');
        return throwError(() => err);
      }),
    );
  }

  deleteUnit(id: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(UNIT_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.units.update(units => units.filter(u => u.unitId !== id));
            this.toastr.success(res.message || 'Unit deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete unit');
          return throwError(() => err);
        })
      );
  }
}
