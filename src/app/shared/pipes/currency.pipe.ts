import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nprCurrency',
  standalone: true
})
export class NprCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    showSymbol: boolean = true,
    symbol: string = 'NPR',
    decimals: number = 2
  ): string {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      const fallbackZeros = decimals > 0 ? '.' + '0'.repeat(decimals) : '';
      return showSymbol ? `${symbol} 0${fallbackZeros}` : `0${fallbackZeros}`;
    }

    const numericValue = Math.abs(Number(value));
    const isNegative = Number(value) < 0;

    const fixed = numericValue.toFixed(decimals);
    const parts = fixed.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 && decimals > 0 ? '.' + parts[1] : '';

    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    const formattedResult = (isNegative ? '-' : '') + formattedInteger + decimalPart;

    return showSymbol ? `${symbol} ${formattedResult}` : formattedResult;
  }
}
