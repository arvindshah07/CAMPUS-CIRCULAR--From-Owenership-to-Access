import { motion } from 'framer-motion';

export const CircularRoute = ({ className }) => {
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <svg width="200" height="200" viewBox="0 0 200 200" className="absolute">
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          strokeDasharray="4 8"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Nodes */}
        <motion.circle
          cx="100"
          cy="20"
          r="6"
          className="fill-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
        <motion.circle
          cx="169"
          cy="140"
          r="6"
          className="fill-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.0 }}
        />
        <motion.circle
          cx="31"
          cy="140"
          r="6"
          className="fill-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 }}
        />
      </svg>
    </div>
  );
};
