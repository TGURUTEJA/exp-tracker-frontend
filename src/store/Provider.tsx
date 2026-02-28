// store/Provider.tsx
'use client';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export default function ReduxProvider({ children }: { children: ReactNode }) {
    console.log("ReduxProvider rendering with store state:", store.getState());
  return <Provider store={store}>{children}</Provider>;
}
