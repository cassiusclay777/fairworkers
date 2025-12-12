import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      {/* Icon */}
      {icon || (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      )}
      
      {/* Text Content */}
      <div className="space-y-2">
        <h3 className="font-heading font-900 text-xl text-text">
          {title}
        </h3>
        <p className="font-body font-500 text-body-16 text-gray-600 max-w-md">
          {description}
        </p>
      </div>
      
      {/* Action Button */}
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;