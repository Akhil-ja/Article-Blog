import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import articleReducer from "./slices/articleSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articleReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
