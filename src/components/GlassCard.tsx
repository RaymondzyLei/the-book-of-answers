import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
}

export function GlassCard({ children, className = '', shimmer = true }: GlassCardProps) {
  return (
    <div
      className={`glass rounded-2xl md:rounded-3xl ${shimmer ? 'glass-shimmer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
