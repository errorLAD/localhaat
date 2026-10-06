import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-primary-700 text-white hover:bg-primary-800 shadow-sm active:scale-[0.98]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 hover:text-black',
      secondary: 'bg-secondary text-white hover:bg-orange-600 shadow-sm active:scale-[0.98]',
      ghost: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-12 rounded-lg px-6 text-base font-semibold',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
