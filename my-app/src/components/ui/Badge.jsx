import { cn } from './Button';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-surface-hover text-text-muted',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
