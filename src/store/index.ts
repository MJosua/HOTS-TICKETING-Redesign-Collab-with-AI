
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import catalogReducer from './slices/catalogSlice';
import ticketsReducer from './slices/ticketsSlice';
import userManagementReducer from './slices/userManagementSlice';
import customFunctionReducer from './slices/customFunctionSlice';
import srfSliceReducer from './slices/srf_slice';
import skuSliceReducer from './slices/SKUslice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    tickets: ticketsReducer,
    userManagement: userManagementReducer,
    customFunction: customFunctionReducer,
    srf: srfSliceReducer,
    sku: skuSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
