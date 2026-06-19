import type { ReactNode } from 'react';
import type { MorphState } from '../types';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
  morph?: MorphState | null;
  isMorphing?: boolean;
}

export function GlassCard({
  children,
  className = '',
  shimmer = true,
  morph = null,
  isMorphing = false,
}: GlassCardProps) {
  const morphClass = morph ? `is-${morph}` : '';
  const colorClass = isMorphing ? 'is-morphing' : '';
  return (
    <div
      className={`glass glass-card rounded-2xl md:rounded-3xl ${morphClass} ${colorClass} ${shimmer ? 'glass-shimmer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
