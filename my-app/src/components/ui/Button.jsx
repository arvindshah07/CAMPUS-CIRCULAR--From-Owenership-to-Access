import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = forwardRef(({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary:   'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)]',
    secondary: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:ring-[var(--accent)]',
    ghost:     'text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:ring-[var(--accent)]',
    danger:    'bg-[var(--danger)] text-white hover:opacity-90 focus-visible:ring-[var(--danger)]',
  };

  const sizes = {
    sm:   'h-8 px-3 text-xs',
    md:   'h-11 px-6 text-sm',
    lg:   'h-14 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = 'Button';
