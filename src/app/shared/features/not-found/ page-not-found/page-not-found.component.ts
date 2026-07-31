import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {}
