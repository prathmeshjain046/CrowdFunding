import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import campaignReducer from "./campaignSlice";
import investmentReducer from "./investmentSlice"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaign: campaignReducer,
    investment: investmentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;




