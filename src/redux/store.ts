import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./features/bookSlice";

export const store = configureStore({
  reducer: {
    bookSlice: bookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;