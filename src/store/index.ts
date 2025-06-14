import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "./slices/navigationSlice";
import contentReducer from "./slices/contentSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    content: contentReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
