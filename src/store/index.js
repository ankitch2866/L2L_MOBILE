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
import bookingsReducer from './slices/bookingsSlice';
import allotmentsReducer from './slices/allotmentsSlice';
import paymentsReducer from './slices/paymentsSlice';
import chequesReducer from './slices/chequesSlice';
import paymentQueriesReducer from './slices/paymentQueriesSlice';
import paymentRaisesReducer from './slices/paymentRaisesSlice';
import unitTransfersReducer from './slices/unitTransfersSlice';
import bbaReducer from './slices/bbaSlice';
import dispatchesReducer from './slices/dispatchesSlice';
import callingFeedbackReducer from './slices/callingFeedbackSlice';
import employeesReducer from './slices/employeesSlice';

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
    bookings: bookingsReducer,
    allotments: allotmentsReducer,
    payments: paymentsReducer,
    cheques: chequesReducer,
    paymentQueries: paymentQueriesReducer,
    paymentRaises: paymentRaisesReducer,
    unitTransfers: unitTransfersReducer,
    bba: bbaReducer,
    dispatches: dispatchesReducer,
    callingFeedback: callingFeedbackReducer,
    employees: employeesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
