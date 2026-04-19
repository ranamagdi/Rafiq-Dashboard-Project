import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/slices/user/userSlice";
import sliderReducer from '../store/slices/ui/sliderSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    slider:sliderReducer
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;