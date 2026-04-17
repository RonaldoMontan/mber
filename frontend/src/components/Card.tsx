import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'highlight';
  className?: string;
}

export const Card = ({ children, variant = 'default', className = '' }: CardProps) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-[#B22222] text-white',
    highlight: 'bg-[#B22222] text-white shadow-xl',
  };

  return (
    <div className={`rounded-3xl p-6 shadow-lg ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
