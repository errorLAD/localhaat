'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl animate-in zoom-in-95',
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5 text-gray-500 hover:text-gray-900" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)}>{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-lg font-bold leading-none tracking-tight text-gray-900', className)}>{children}</h2>;
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)}>{children}</p>;
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-end space-x-2 mt-6', className)}>{children}</div>;
}
