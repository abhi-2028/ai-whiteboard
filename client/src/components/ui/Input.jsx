import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Label = ({ children, className }) => (
  <label className={cn("block text-xs font-medium text-muted mb-1", className)}>{children}</label>
);

export function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <Label>{label}</Label>}
      <input 
        className={cn(
          "input-base rounded-full",
          error && "border-danger",
          className
        )} 
        {...props} 
      />
      {error && <p className="text-danger text-[11px] mt-1 ml-2">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <Label>{label}</Label>}
      <textarea 
        rows={4}
        className={cn("input-base resize-none rounded-2xl", error && "border-danger", className)} 
        {...props} 
      />
      {error && <p className="text-danger text-[11px] mt-1 ml-2">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, ...props }) {
  return (
    <div className="w-full relative">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <select 
          className={cn("input-base appearance-none rounded-full pr-10", error && "border-danger", className)} 
          {...props} 
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      </div>
      {error && <p className="text-danger text-[11px] mt-1 ml-2">{error}</p>}
    </div>
  );
}