import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
}

export const ResponsiveTable = ({ children }: ResponsiveTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Indicador de scroll para mobile */}
      <div className="lg:hidden px-4 py-2 bg-blue-50 border-b border-blue-200">
        <p className="text-xs text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          Deslize para ver mais
        </p>
      </div>
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        {children}
      </div>
    </div>
  );
};
