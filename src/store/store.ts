// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./RootReducer";


export const store = configureStore({
  reducer: {
    counter: rootReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ... RootState, AppDispatch types as before
