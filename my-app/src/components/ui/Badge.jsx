import { cn } from './utils';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default:  'bg-[var(--surface-raised)] text-[var(--text-secondary)]',
    primary:  'bg-[var(--accent)]/10 text-[var(--accent)]',
    success:  'bg-[var(--success)]/10 text-[var(--success)]',
    warning:  'bg-[var(--warning)]/10 text-[var(--warning)]',
    danger:   'bg-[var(--danger)]/10 text-[var(--danger)]',
    pending:  'bg-[var(--warning)]/10 text-[var(--warning)]',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
