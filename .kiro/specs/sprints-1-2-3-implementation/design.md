# Design Document - Sprints 1-3 Implementation

## Overview

This design document outlines the technical architecture for implementing Sprints 1, 2, and 3, covering master data modules (Installments, PLC, Banks, Stock, Project Sizes) and transaction modules (Booking, Allotment, Payment, Cheque, Payment Query, Payment Raise, Unit Transfer, BBA, Dispatch, Customer Feedback).

The design follows existing patterns from successfully implemented modules (CoApplicants, Customers, Projects, Properties) to ensure consistency and maintainability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
├─────────────────────────────────────────────────────────────┤
│  Screens Layer                                               │
│  ├── Master Data Screens (Sprint 1)                         │
│  │   ├── Installments, PLC, Banks, Stock, Project Sizes    │
│  └── Transaction Screens (Sprint 2-3)                       │
│      ├── Booking, Allotment, Payment, Cheque               │
│      └── Payment Query, Raise, Transfer, BBA, Dispatch     │
├─────────────────────────────────────────────────────────────┤
│  Redux State Management                                      │
│  ├── Slices for each module                                │
│  └── Async thunks for API calls                            │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Axios)                                          │
│  ├── Request/Response interceptors                         │
│  └── Error handling                                        │
├─────────────────────────────────────────────────────────────┤
│  Backend API                                                │
│  └── Existing endpoints + new transaction endpoints        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Sprint 1: Master Data Modules

#### 1. Installments Module

**Redux Slice**: `installmentsSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  planId: null
}
```

**Screens**:
1. `InstallmentsListScreen.js` - Display installments for a payment plan
2. `AddInstallmentScreen.js` - Create new installment
3. `InstallmentDetailsScreen.js` - View installment details
4. `EditInstallmentScreen.js` - Edit installment

**API Endpoints**:
- GET `/api/master/plans/:plan_id/installments`
- POST `/api/master/plans/:plan_id/installments`
- GET `/api/master/installments/:installment_id`
- PUT `/api/master/installments/:installment_id`
- DELETE `/api/master/installments/:installment_id`

**Component**: `InstallmentCard.js`

---

#### 2. PLC Module

**Redux Slice**: `plcSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  searchQuery: ''
}
```

**Screens**:
1. `PLCListScreen.js`
2. `AddPLCScreen.js`
3. `PLCDetailsScreen.js`
4. `EditPLCScreen.js`

**API Endpoints**:
- GET `/api/master/plcs`
- POST `/api/master/plcs`
- GET `/api/master/plcs/:id`
- PUT `/api/master/plcs/:id`
- DELETE `/api/master/plcs/:id`

**Component**: `PLCCard.js`

---

#### 3. Banks Module

**Redux Slice**: `banksSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  searchQuery: ''
}
```

**Screens**:
1. `BanksListScreen.js`
2. `AddBankScreen.js`
3. `BankDetailsScreen.js`
4. `EditBankScreen.js`

**API Endpoints**:
- GET `/api/master/banks`
- POST `/api/master/banks`
- GET `/api/master/banks/:id`
- PUT `/api/master/banks/:id`
- DELETE `/api/master/banks/:id`
- GET `/api/master/banks/search`

**Component**: `BankCard.js`

---

#### 4. Stock Module

**Redux Slice**: `stocksSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  filters: {
    project_id: null,
    status: null
  }
}
```

**Screens**:
1. `StockListScreen.js`
2. `AddStockScreen.js`
3. `StockDetailsScreen.js`
4. `EditStockScreen.js`

**API Endpoints**:
- GET `/api/master/stocks`
- POST `/api/master/stocks`
- GET `/api/master/stocks/:stock_id`
- PUT `/api/master/stocks/:stock_id`
- DELETE `/api/master/stocks/:stock_id`
- GET `/api/master/stock/stocklist`

**Component**: `StockCard.js`

---

#### 5. Project Sizes Module

**Redux Slice**: `projectSizesSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  projectId: null
}
```

**Screens**:
1. `ProjectSizesListScreen.js`
2. `AddProjectSizeScreen.js`
3. `EditProjectSizeScreen.js`

**API Endpoints**:
- GET `/api/master/project-sizes`
- POST `/api/master/project-sizes`
- GET `/api/master/project-sizes/:id`
- PUT `/api/master/project-sizes/:id`
- DELETE `/api/master/project-sizes/:id`
- GET `/api/master/project-sizes/project/:project_id`

**Component**: `ProjectSizeCard.js`

---

### Sprint 2: Core Transaction Modules

#### 6. Booking Module

**Redux Slice**: `bookingsSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    project_id: null,
    customer_id: null
  },
  statistics: {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  }
}
```

**Screens**:
1. `BookingsListScreen.js`
2. `CreateBookingScreen.js`
3. `BookingDetailsScreen.js`
4. `EditBookingScreen.js`
5. `BookingStatusScreen.js`

**API Endpoints** (To be created in backend):
- GET `/api/transactions/bookings`
- POST `/api/transactions/bookings`
- GET `/api/transactions/bookings/:id`
- PUT `/api/transactions/bookings/:id`
- DELETE `/api/transactions/bookings/:id`
- PATCH `/api/transactions/bookings/:id/status`

**Component**: `BookingCard.js`

---

#### 7. Allotment Module

**Redux Slice**: `allotmentsSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  filters: {
    project_id: null,
    customer_id: null,
    status: null
  }
}
```

**Screens**:
1. `AllotmentsListScreen.js`
2. `CreateAllotmentScreen.js`
3. `AllotmentDetailsScreen.js`
4. `EditAllotmentScreen.js`
5. `AllotmentLetterScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/allotments`
- POST `/api/transactions/allotments`
- GET `/api/transactions/allotments/:id`
- PUT `/api/transactions/allotments/:id`
- DELETE `/api/transactions/allotments/:id`
- GET `/api/transactions/allotments/:id/letter`

**Component**: `AllotmentCard.js`

---

### Sprint 3: Advanced Transaction Modules

#### 8. Payment Module

**Redux Slice**: `paymentsSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  filters: {
    customer_id: null,
    project_id: null,
    payment_method: null,
    date_from: null,
    date_to: null
  },
  statistics: {
    total_amount: 0,
    total_count: 0,
    by_method: {}
  }
}
```

**Screens**:
1. `PaymentsDashboardScreen.js`
2. `PaymentEntryScreen.js`
3. `PaymentDetailsScreen.js`
4. `EditPaymentScreen.js`
5. `CustomerPaymentsScreen.js`
6. `TransactionDetailsScreen.js`
7. `CreditPaymentScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/payments`
- POST `/api/transactions/payments`
- GET `/api/transactions/payments/:id`
- PUT `/api/transactions/payments/:id`
- DELETE `/api/transactions/payments/:id`
- GET `/api/transactions/payments/customer/:customer_id`
- POST `/api/transactions/payments/credit`
- GET `/api/transactions/payments/statistics`

**Component**: `PaymentCard.js`

---

#### 9. Cheque Management Module

**Redux Slice**: `chequesSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    bank_id: null,
    customer_id: null
  },
  statistics: {
    pending: 0,
    sent_to_bank: 0,
    cleared: 0,
    bounced: 0
  }
}
```

**Screens**:
1. `ChequesDashboardScreen.js`
2. `ChequeDepositScreen.js`
3. `ChequeDetailsScreen.js`
4. `ChequeStatusScreen.js`
5. `ChequeFeedbackScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/cheques`
- POST `/api/transactions/cheques`
- GET `/api/transactions/cheques/:id`
- PUT `/api/transactions/cheques/:id`
- PATCH `/api/transactions/cheques/:id/send-to-bank`
- PATCH `/api/transactions/cheques/:id/feedback`
- GET `/api/transactions/cheques/statistics`

**Component**: `ChequeCard.js`

---

#### 10. Payment Query Module

**Redux Slice**: `paymentQueriesSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null
}
```

**Screens**:
1. `PaymentQueriesListScreen.js`
2. `GeneratePaymentQueryScreen.js`
3. `PaymentQueryDetailsScreen.js`
4. `EditPaymentQueryScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/payment-queries`
- POST `/api/transactions/payment-queries`
- GET `/api/transactions/payment-queries/:id`
- PUT `/api/transactions/payment-queries/:id`

---

#### 11. Payment Raise Module

**Redux Slice**: `paymentRaisesSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null
}
```

**Screens**:
1. `PaymentRaisesListScreen.js`
2. `CreatePaymentRaiseScreen.js`
3. `PaymentRaiseDetailsScreen.js`
4. `EditPaymentRaiseScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/payment-raises`
- POST `/api/transactions/payment-raises`
- GET `/api/transactions/payment-raises/:id`
- PUT `/api/transactions/payment-raises/:id`

---

#### 12. Unit Transfer Module

**Redux Slice**: `unitTransfersSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null
}
```

**Screens**:
1. `UnitTransfersListScreen.js`
2. `CreateUnitTransferScreen.js`
3. `UnitTransferDetailsScreen.js`
4. `EditUnitTransferScreen.js`
5. `TransferTransactionScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/unit-transfers`
- POST `/api/transactions/unit-transfers`
- GET `/api/transactions/unit-transfers/:id`
- PUT `/api/transactions/unit-transfers/:id`

---

#### 13. BBA Module

**Redux Slice**: `bbaSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null,
  statistics: {
    pending: 0,
    verified: 0,
    completed: 0
  }
}
```

**Screens**:
1. `BBADashboardScreen.js`
2. `AddBBAScreen.js`
3. `BBAStatusScreen.js`
4. `EditBBAScreen.js`
5. `VerifyBBAScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/bba`
- POST `/api/transactions/bba`
- GET `/api/transactions/bba/:id`
- PUT `/api/transactions/bba/:id`
- PATCH `/api/transactions/bba/:id/status`
- PATCH `/api/transactions/bba/:id/verify`
- POST `/api/transactions/bba/auto-verify`
- POST `/api/transactions/bba/auto-status-update`

---

#### 14. Dispatch Module

**Redux Slice**: `dispatchesSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null
}
```

**Screens**:
1. `DispatchesListScreen.js`
2. `CreateDispatchScreen.js`
3. `DispatchDetailsScreen.js`
4. `EditDispatchScreen.js`
5. `DispatchItemsScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/dispatches`
- POST `/api/transactions/dispatches`
- GET `/api/transactions/dispatches/:id`
- PUT `/api/transactions/dispatches/:id`
- POST `/api/transactions/dispatches/:id/items`

---

#### 15. Customer Feedback Module

**Redux Slice**: `customerFeedbackSlice.js`
```javascript
{
  list: [],
  current: null,
  loading: false,
  error: null
}
```

**Screens**:
1. `FeedbackDashboardScreen.js`
2. `AddFeedbackScreen.js`
3. `FeedbackDetailsScreen.js`
4. `CallingHistoryScreen.js`

**API Endpoints** (To be created):
- GET `/api/transactions/feedback`
- POST `/api/transactions/feedback`
- GET `/api/transactions/feedback/:id`
- GET `/api/transactions/feedback/customer/:customer_id`

---

## Data Models

### Common Fields (All Modules)
```javascript
{
  id: number,
  created_at: timestamp,
  updated_at: timestamp,
  created_by: number,
  updated_by: number
}
```

### Module-Specific Models

Refer to backend database schema and web frontend implementations for detailed field definitions.

## Error Handling

### Error Types
1. **Network Errors**: Connection failures, timeouts
2. **Validation Errors**: Invalid form data
3. **Authorization Errors**: 401, 403 responses
4. **Server Errors**: 500+ responses
5. **Not Found Errors**: 404 responses

### Error Handling Strategy
```javascript
try {
  const response = await api.post('/endpoint', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    return rejectWithValue(error.response.data.error || 'Operation failed');
  } else if (error.request) {
    // No response received
    return rejectWithValue('Network error. Please check your connection.');
  } else {
    // Request setup error
    return rejectWithValue('An unexpected error occurred');
  }
}
```

## Testing Strategy

### Unit Testing
- Redux slices (actions, reducers, thunks)
- Utility functions
- Form validation logic

### Integration Testing
- API integration
- Redux store integration
- Navigation flow

### E2E Testing
- Complete user flows
- CRUD operations
- Error scenarios

## Navigation Integration

### Dashboard Navigator Updates
```javascript
// Add new stacks to DashboardNavigator.js
const InstallmentsStack = () => { /* ... */ };
const PLCStack = () => { /* ... */ };
const BanksStack = () => { /* ... */ };
const StockStack = () => { /* ... */ };
const BookingsStack = () => { /* ... */ };
const AllotmentsStack = () => { /* ... */ };
const PaymentsStack = () => { /* ... */ };
// ... etc
```

### Tab Navigation
- Keep existing tabs (Home, Projects, Properties, Customers, Profile)
- Add new modules as modal/stack screens accessible from Dashboard

## Performance Considerations

1. **Lazy Loading**: Load screens only when needed
2. **Pagination**: Implement for large lists
3. **Caching**: Cache frequently accessed data
4. **Debouncing**: For search/filter inputs
5. **Memoization**: Use React.memo for expensive components

## Security Considerations

1. **Authentication**: All API calls include auth token
2. **Authorization**: Check user permissions before showing actions
3. **Data Validation**: Validate on both client and server
4. **Sensitive Data**: Don't log sensitive information
5. **HTTPS**: Use secure connections (production)

## Implementation Priority

1. **Sprint 1** (Week 1-2): Master Data Modules
2. **Sprint 2** (Week 3-4): Booking & Allotment
3. **Sprint 3** (Week 5-6): Payment, Cheque, and other transactions

## Dependencies

- Existing working modules (CoApplicants, Customers, Projects, Properties)
- Backend API endpoints (some need to be created)
- React Native Paper components
- Redux Toolkit
- React Navigation
- Axios

## Success Criteria

- All screens functional and navigable
- CRUD operations working for all modules
- Data validation implemented
- Error handling in place
- Consistent UI/UX with existing modules
- No breaking changes to existing functionality
