// store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import imageReducer from "./slices/imageSlice";

export const store = configureStore({
  reducer: {
    image: imageReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
