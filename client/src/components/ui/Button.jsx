import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary: "brand-gradient text-white shadow-[var(--shadow-brand)] hover:brightness-[1.07]",
  secondary: "bg-surface hover:bg-surface-2 text-ink border border-line shadow-card",
  ghost: "hover:bg-surface-2 text-muted hover:text-ink",
  danger: "bg-danger text-white hover:brightness-90",
  outline: "border-line bg-surface hover:border-brand-300 text-ink",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const sizes = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
  icon: "h-10 w-10",
  iconSm: "h-8 w-8",
};

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className, 
  ...props 
}) {
  return (
    <button 
      className={cn(
        "rounded-full font-semibold transition-all focus-ring active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )} 
      disabled={loading || props.disabled} 
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}