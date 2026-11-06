import React from 'react';
import { initials, colorFromId } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function Avatar({ user, size = 'md', ring = false, className }) {
  const userId = user?.id || user?.email || user?.name;
  const sizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div 
      className={cn(
        "rounded-full grid place-content-center font-bold text-white shadow-card transition-transform active:scale-95",
        sizes[size],
        ring && "ring-2 ring-surface",
        className
      )}
      style={{ backgroundColor: colorFromId(userId) }}
    >
      {initials(user?.name)}
    </div>
  );
}