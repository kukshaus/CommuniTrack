import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
}) => {
  return (
    <div
      className={cn(
        'bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm',
        'transition-all duration-200 ease-in-out',
        hover && 'hover:shadow-lg hover:border-gray-300/50 hover:bg-white/80 hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-5 border-b border-gray-200/50', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-5 border-t border-gray-200/50 bg-gray-50/50', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
