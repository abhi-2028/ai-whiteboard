import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ label, className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
    </div>
  );
}

export function FullScreenSpinner({ label = "Loading..." }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg">
      <Spinner label={label} className="flex-col gap-4" />
    </div>
  );
}