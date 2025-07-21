'use client';

import React from 'react';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Simple provider component that just passes through children
// We're using Zustand for state management instead of Redux
export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return <>{children}</>;
}; 