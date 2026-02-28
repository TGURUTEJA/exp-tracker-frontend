'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { FC, PropsWithChildren, useState } from 'react';
import { getQueryClient } from './GetQueryClient';

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

const ReactClientTanstackProvider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(
    () => getQueryClient()
  );

  if (typeof window !== 'undefined') {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactClientTanstackProvider;
