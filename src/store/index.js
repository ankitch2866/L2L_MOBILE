// Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import propertiesReducer from './slices/propertiesSlice';
import customersReducer from './slices/customersSlice';
import coApplicantsReducer from './slices/coApplicantsSlice';
import brokersReducer from './slices/brokersSlice';
import paymentPlansReducer from './slices/paymentPlansSlice';
import installmentsReducer from './slices/installmentsSlice';
import plcReducer from './slices/plcSlice';
import banksReducer from './slices/banksSlice';
import stocksReducer from './slices/stocksSlice';
import projectSizesReducer from './slices/projectSizesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    properties: propertiesReducer,
    customers: customersReducer,
    coApplicants: coApplicantsReducer,
    brokers: brokersReducer,
    paymentPlans: paymentPlansReducer,
    installments: installmentsReducer,
    plc: plcReducer,
    banks: banksReducer,
    stocks: stocksReducer,
    projectSizes: projectSizesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
