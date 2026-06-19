import type { ReactNode } from 'react';
import type { MorphState } from '../types';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  morph?: MorphState | null;
}

export function GlassCard({
  children,
  className = '',
  morph = null,
}: GlassCardProps) {
  const morphClass = morph ? `is-${morph}` : '';
  return (
    <div
      className={`glass glass-card rounded-2xl md:rounded-3xl ${morphClass} ${className}`}
    >
      {children}
    </div>
  );
}
