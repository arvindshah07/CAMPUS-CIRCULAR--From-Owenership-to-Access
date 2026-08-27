import { forwardRef } from 'react';
import { cn } from './Button';
import { motion } from 'framer-motion';

export const Card = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)]', className)}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export const InteractiveCard = forwardRef(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={cn('bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] cursor-pointer hover:shadow-md transition-shadow', className)}
    {...props}
  >
    {children}
  </motion.div>
));
InteractiveCard.displayName = 'InteractiveCard';
