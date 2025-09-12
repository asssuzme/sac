import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Modern pulse animation for cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <div className="animate-pulse">
        <div className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 h-full w-full" />
      </div>
    </div>
  );
}

// Smooth spinner with gradient
export function Spinner({ size = "default", className }: { size?: "sm" | "default" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Dots loading animation
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15
          }}
        />
      ))}
    </div>
  );
}

// Shimmer effect for text
export function TextShimmer({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse"
          style={{ width: `${100 - i * 20}%` }}
        />
      ))}
    </div>
  );
}

// Progress bar with gradient
export function ProgressLoader({ progress = 0, className }: { progress?: number; className?: string }) {
  return (
    <div className={cn("w-full h-2 bg-muted/30 rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

// Futuristic grid loader
export function GridLoader({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-1 w-12 h-12", className)}>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-primary rounded-sm"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Page loading overlay
export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-4">
        <GridLoader className="mx-auto" />
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}

// Skeleton for dashboard stats
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="h-12 w-12 rounded-xl bg-muted/50" />
          <div className="h-6 w-16 rounded bg-muted/50" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-24 rounded bg-muted/50" />
          <div className="h-4 w-32 rounded bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 rounded bg-muted/50" />
        </td>
      ))}
    </tr>
  );
}