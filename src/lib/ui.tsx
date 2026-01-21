/**
 * Lightweight UI components using Tailwind CSS
 * All inline, no external dependencies
 */

import { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

// Container - max-width wrapper
export function Container({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'md',
  ...props 
}: ButtonProps) {
  const baseStyles = "font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

// Card components
export function Card({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return <div className={cn("border-b border-gray-200 px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return <h2 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h2>;
}

export function CardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return <p className={cn("text-sm text-gray-600", className)}>{children}</p>;
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
}

export function InputWithIcon({ 
  icon: Icon, 
  ...props 
}: InputProps & { icon?: any }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />}
      <Input className={Icon ? "pl-10" : ""} {...props} />
    </div>
  );
}

// Badge
export function Badge({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700", className)}>
      {children}
    </span>
  );
}

// PageHeader
export function PageHeader({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string 
}) {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-4 text-xl text-gray-600">{subtitle}</p>}
    </div>
  );
}

// Section
export function Section({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return <div className={cn("py-12", className)}>{children}</div>;
}

// Calendar - simple date input
export function Calendar({ 
  ...props 
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input 
      type="date" 
      {...props}
    />
  );
}
