import React from 'react';
import { useAppStore } from '../store';

// We keep AppProvider for compatibility but it just renders children
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Re-export hook for backward compatibility with existing components
export const useApp = () => {
  return useAppStore();
};
