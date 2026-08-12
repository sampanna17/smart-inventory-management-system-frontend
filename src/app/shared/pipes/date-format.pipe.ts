import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

export type DateFormatType = 'date' | 'time' | 'datetime' | 'full' | 'mediumDate' | 'short' | string;

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: string | Date | number | null | undefined, format: DateFormatType = 'datetime'): string {
    if (!value) return '-';

    const pattern = this.resolvePattern(format);
    try {
      return this.datePipe.transform(value, pattern) || '-';
    } catch {
      return '-';
    }
  }

  private resolvePattern(format: DateFormatType): string {
    switch (format) {
      case 'date':
      case 'mediumDate':
        return 'MMM d, y';
      case 'time':
        return 'h:mm a';
      case 'datetime':
        return 'MMM d, y, h:mm a';
      case 'full':
        return 'EEEE, MMMM d, y, h:mm a';
      case 'short':
        return 'M/d/yy, h:mm a';
      default:
        return format;
    }
  }
}
