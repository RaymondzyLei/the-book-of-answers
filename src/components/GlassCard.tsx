import type { ReactNode } from 'react';
import type { MorphState } from '../types';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
  morph?: MorphState | null;
}

export function GlassCard({
  children,
  className = '',
  shimmer = true,
  morph = null,
}: GlassCardProps) {
  const morphClass = morph ? `is-${morph}` : '';
  return (
    <div
      className={`glass glass-card rounded-2xl md:rounded-3xl ${morphClass} ${shimmer ? 'glass-shimmer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
