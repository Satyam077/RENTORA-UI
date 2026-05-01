import { Directive, HostListener, OnInit, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]',
  standalone: true
})
export class PhoneMaskDirective implements OnInit {
  constructor(public ngControl: NgControl, private el: ElementRef) { }

  ngOnInit() {
    // Format initial value if it exists
    setTimeout(() => {
      const initialValue = this.ngControl.control?.value;
      if (initialValue) {
        this.formatValue(initialValue);
      }
    });
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.formatValue(value);
  }

  private formatValue(value: string) {
    if (!value) {
      this.ngControl.control?.setValue('', { emitEvent: false });
      return;
    }

    // First remove the +91 prefix if it exists so it doesn't get counted as digits
    let cleanedValue = value;
    if (cleanedValue.startsWith('+91 ')) {
      cleanedValue = cleanedValue.substring(4);
    } else if (cleanedValue.startsWith('+91')) {
      cleanedValue = cleanedValue.substring(3);
    }

    // Remove all non-digit characters from the remaining string
    let digits = cleanedValue.replace(/\D/g, '');

    // Limit to 10 actual phone number digits
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }

    // Format the string: +91 XXX XXX XXXX
    let formatted = '';
    if (digits.length > 0) {
      formatted = '+91 ';
      if (digits.length <= 3) {
        formatted += digits;
      } else if (digits.length <= 6) {
        formatted += digits.substring(0, 3) + ' ' + digits.substring(3);
      } else {
        formatted += digits.substring(0, 3) + ' ' + digits.substring(3, 6) + ' ' + digits.substring(6);
      }
    }

    // Set the formatted value back to the control
    if (this.ngControl.control?.value !== formatted) {
      this.ngControl.control?.setValue(formatted, { emitEvent: false });

      // Ensure native input reflects the value to prevent flickering
      if (this.el && this.el.nativeElement) {
        this.el.nativeElement.value = formatted;
      }
    }
  }
}
