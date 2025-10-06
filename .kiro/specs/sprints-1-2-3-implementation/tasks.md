# Implementation Plan - Sprints 1-3

## SPRINT 1: MASTER DATA MODULES

- [x] 1. Installments Module

  - Create Redux slice with CRUD operations
  - Create list, add, details, and edit screens
  - Integrate with payment plans
  - Add navigation routes
  - _Requirements: 1.1, 1.2_

- [x] 1.1 Create Installments Redux Slice

  - Create `src/store/slices/installmentsSlice.js`
  - Implement fetchInstallmentsByPlan, createInstallment, updateInstallment, deleteInstallment thunks
  - Define initial state with list, current, loading, error, planId
  - _Requirements: 1.1_

- [x] 1.2 Create Installments Screens

  - Create `src/screens/masters/installments/InstallmentsListScreen.js`
  - Create `src/screens/masters/installments/AddInstallmentScreen.js`
  - Create `src/screens/masters/installments/InstallmentDetailsScreen.js`
  - Create `src/screens/masters/installments/EditInstallmentScreen.js`
  - Create `src/screens/masters/installments/index.js`
  - _Requirements: 1.1, 1.2_

- [x] 1.3 Create Installment Card Component

  - Create `src/components/masters/InstallmentCard.js`
  - Display installment number, amount, due date, status
  - _Requirements: 1.1_

- [x] 1.4 Integrate Installments with Payment Plans

  - Add "View Installments" button in PaymentPlanDetailsScreen
  - Navigate to InstallmentsListScreen with plan_id
  - _Requirements: 1.1_

- [x] 2. PLC Module

  - Create Redux slice with CRUD operations
  - Create list, add, details, and edit screens
  - Add search and filter functionality
  - Add navigation routes
  - _Requirements: 1.3, 1.4_

- [x] 2.1 Create PLC Redux Slice

  - Create `src/store/slices/plcSlice.js`
  - Implement fetchPLCs, createPLC, fetchPLCById, updatePLC, deletePLC thunks
  - Define initial state with list, current, loading, error, searchQuery
  - _Requirements: 1.3_

- [x] 2.2 Create PLC Screens

  - Create `src/screens/masters/plc/PLCListScreen.js`
  - Create `src/screens/masters/plc/AddPLCScreen.js`
  - Create `src/screens/masters/plc/PLCDetailsScreen.js`
  - Create `src/screens/masters/plc/EditPLCScreen.js`
  - Create `src/screens/masters/plc/index.js`
  - _Requirements: 1.3, 1.4_

- [x] 2.3 Create PLC Card Component

  - Create `src/components/masters/PLCCard.js`
  - Display PLC name, charges, project info
  - _Requirements: 1.3_

- [x] 2.4 Add PLC Navigation

  - Add PLCStack to DashboardNavigator
  - Add PLC access from Dashboard quick actions
  - _Requirements: 1.3_

- [x] 3. Banks Module

  - Create Redux slice with CRUD operations
  - Create list, add, details, and edit screens
  - Add search functionality
  - Add navigation routes
  - _Requirements: 1.5, 1.6_

- [x] 3.1 Create Banks Redux Slice

  - Create `src/store/slices/banksSlice.js`
  - Implement fetchBanks, createBank, fetchBankById, updateBank, deleteBank, searchBanks thunks
  - Define initial state with list, current, loading, error, searchQuery
  - _Requirements: 1.5_

- [x] 3.2 Create Banks Screens

  - Create `src/screens/masters/banks/BanksListScreen.js`
  - Create `src/screens/masters/banks/AddBankScreen.js`
  - Create `src/screens/masters/banks/BankDetailsScreen.js`
  - Create `src/screens/masters/banks/EditBankScreen.js`
  - Create `src/screens/masters/banks/index.js`
  - _Requirements: 1.5, 1.6_

- [x] 3.3 Create Bank Card Component

  - Create `src/components/masters/BankCard.js`
  - Display bank name, branch, IFSC code
  - _Requirements: 1.5_

- [x] 3.4 Add Banks Navigation

  - Add BanksStack to DashboardNavigator
  - Add Banks access from Dashboard
  - _Requirements: 1.5_

- [x] 4. Stock Module

  - Create Redux slice with CRUD operations
  - Create list, add, details, and edit screens
  - Add filter by project and status
  - Add navigation routes
  - _Requirements: 1.7, 1.8_

- [x] 4.1 Create Stock Redux Slice

  - Create `src/store/slices/stocksSlice.js`
  - Implement fetchStocks, createStock, fetchStockById, updateStock, deleteStock thunks
  - Define initial state with list, current, loading, error, filters
  - _Requirements: 1.7_

- [x] 4.2 Create Stock Screens

  - Create `src/screens/masters/stock/StockListScreen.js`
  - Create `src/screens/masters/stock/AddStockScreen.js`
  - Create `src/screens/masters/stock/StockDetailsScreen.js`
  - Create `src/screens/masters/stock/EditStockScreen.js`
  - Create `src/screens/masters/stock/index.js`
  - _Requirements: 1.7, 1.8_

- [x] 4.3 Create Stock Card Component

  - Create `src/components/masters/StockCard.js`
  - Display unit details, project, status, availability
  - _Requirements: 1.7_

- [x] 4.4 Add Stock Navigation

  - Add StockStack to DashboardNavigator
  - Add Stock access from Dashboard
  - _Requirements: 1.7_

- [ ] 5. Project Sizes Module

  - Create Redux slice with CRUD operations
  - Create list, add, and edit screens
  - Filter by project
  - Add navigation routes
  - _Requirements: 1.9, 1.10_

- [ ] 5.1 Create Project Sizes Redux Slice

  - Create `src/store/slices/projectSizesSlice.js`
  - Implement fetchProjectSizes, createProjectSize, updateProjectSize, deleteProjectSize thunks
  - Define initial state with list, current, loading, error, projectId
  - _Requirements: 1.9_

- [ ] 5.2 Create Project Sizes Screens

  - Create `src/screens/masters/projectSizes/ProjectSizesListScreen.js`
  - Create `src/screens/masters/projectSizes/AddProjectSizeScreen.js`
  - Create `src/screens/masters/projectSizes/EditProjectSizeScreen.js`
  - Create `src/screens/masters/projectSizes/index.js`
  - _Requirements: 1.9, 1.10_

- [ ] 5.3 Create Project Size Card Component

  - Create `src/components/masters/ProjectSizeCard.js`
  - Display size, project, area details
  - _Requirements: 1.9_

- [ ] 5.4 Add Project Sizes Navigation
  - Add ProjectSizesStack to DashboardNavigator
  - Add access from Projects module
  - _Requirements: 1.9_

## SPRINT 2: CORE TRANSACTION MODULES

- [ ] 6. Booking Module

  - Create Redux slice with CRUD operations
  - Create list, create, details, edit, and status screens
  - Add booking statistics
  - Add navigation routes
  - _Requirements: 2.1-2.7_

- [ ] 6.1 Create Bookings Redux Slice

  - Create `src/store/slices/bookingsSlice.js`
  - Implement fetchBookings, createBooking, fetchBookingById, updateBooking, deleteBooking, updateBookingStatus thunks
  - Define initial state with list, current, loading, error, filters, statistics
  - _Requirements: 2.1_

- [ ] 6.2 Create Bookings Screens

  - Create `src/screens/transactions/bookings/BookingsListScreen.js`
  - Create `src/screens/transactions/bookings/CreateBookingScreen.js`
  - Create `src/screens/transactions/bookings/BookingDetailsScreen.js`
  - Create `src/screens/transactions/bookings/EditBookingScreen.js`
  - Create `src/screens/transactions/bookings/BookingStatusScreen.js`
  - Create `src/screens/transactions/bookings/index.js`
  - _Requirements: 2.1-2.5_

- [ ] 6.3 Create Booking Card Component

  - Create `src/components/transactions/BookingCard.js`
  - Display booking number, customer, property, status, amount
  - _Requirements: 2.1_

- [ ] 6.4 Add Bookings Navigation

  - Add BookingsStack to DashboardNavigator
  - Add Bookings access from Dashboard
  - _Requirements: 2.1_

- [ ] 6.5 Implement Booking Business Logic

  - Validate customer and property availability
  - Update property status on booking creation
  - Handle booking cancellation and property release
  - _Requirements: 2.6, 2.7_

- [ ] 7. Allotment Module

  - Create Redux slice with CRUD operations
  - Create list, create, details, edit, and letter screens
  - Add allotment letter generation
  - Add navigation routes
  - _Requirements: 3.1-3.6_

- [ ] 7.1 Create Allotments Redux Slice

  - Create `src/store/slices/allotmentsSlice.js`
  - Implement fetchAllotments, createAllotment, fetchAllotmentById, updateAllotment, deleteAllotment, generateLetter thunks
  - Define initial state with list, current, loading, error, filters
  - _Requirements: 3.1_

- [ ] 7.2 Create Allotments Screens

  - Create `src/screens/transactions/allotments/AllotmentsListScreen.js`
  - Create `src/screens/transactions/allotments/CreateAllotmentScreen.js`
  - Create `src/screens/transactions/allotments/AllotmentDetailsScreen.js`
  - Create `src/screens/transactions/allotments/EditAllotmentScreen.js`
  - Create `src/screens/transactions/allotments/AllotmentLetterScreen.js`
  - Create `src/screens/transactions/allotments/index.js`
  - _Requirements: 3.1-3.5_

- [ ] 7.3 Create Allotment Card Component

  - Create `src/components/transactions/AllotmentCard.js`
  - Display allotment number, customer, property, date
  - _Requirements: 3.1_

- [ ] 7.4 Add Allotments Navigation

  - Add AllotmentsStack to DashboardNavigator
  - Add Allotments access from Dashboard and Bookings
  - _Requirements: 3.1_

- [ ] 7.5 Implement Allotment Letter Generation
  - Create letter template component
  - Add PDF generation functionality
  - Add share/download options
  - _Requirements: 3.5, 3.6_

## SPRINT 3: ADVANCED TRANSACTION MODULES

- [ ] 8. Payment Module

  - Create Redux slice with CRUD operations
  - Create dashboard, entry, details, edit, customer payments, transaction details, and credit payment screens
  - Add payment statistics
  - Add navigation routes
  - _Requirements: 4.1-4.7_

- [ ] 8.1 Create Payments Redux Slice

  - Create `src/store/slices/paymentsSlice.js`
  - Implement fetchPayments, createPayment, fetchPaymentById, updatePayment, deletePayment, fetchCustomerPayments, createCreditPayment, fetchStatistics thunks
  - Define initial state with list, current, loading, error, filters, statistics
  - _Requirements: 4.1_

- [ ] 8.2 Create Payments Screens

  - Create `src/screens/transactions/payments/PaymentsDashboardScreen.js`
  - Create `src/screens/transactions/payments/PaymentEntryScreen.js`
  - Create `src/screens/transactions/payments/PaymentDetailsScreen.js`
  - Create `src/screens/transactions/payments/EditPaymentScreen.js`
  - Create `src/screens/transactions/payments/CustomerPaymentsScreen.js`
  - Create `src/screens/transactions/payments/TransactionDetailsScreen.js`
  - Create `src/screens/transactions/payments/CreditPaymentScreen.js`
  - Create `src/screens/transactions/payments/index.js`
  - _Requirements: 4.1-4.7_

- [ ] 8.3 Create Payment Card Component

  - Create `src/components/transactions/PaymentCard.js`
  - Display payment number, customer, amount, method, date, status
  - _Requirements: 4.1_

- [ ] 8.4 Add Payments Navigation

  - Add PaymentsStack to DashboardNavigator
  - Add Payments access from Dashboard
  - _Requirements: 4.1_

- [ ] 8.5 Implement Payment Business Logic

  - Validate payment amounts and methods
  - Update customer balance on payment
  - Handle credit payments and adjustments
  - _Requirements: 4.7_

- [ ] 9. Cheque Management Module

  - Create Redux slice with CRUD operations
  - Create dashboard, deposit, details, status, and feedback screens
  - Add cheque statistics
  - Add navigation routes
  - _Requirements: 5.1-5.7_

- [ ] 9.1 Create Cheques Redux Slice

  - Create `src/store/slices/chequesSlice.js`
  - Implement fetchCheques, createCheque, fetchChequeById, updateCheque, sendToBank, updateFeedback, fetchStatistics thunks
  - Define initial state with list, current, loading, error, filters, statistics
  - _Requirements: 5.1_

- [ ] 9.2 Create Cheques Screens

  - Create `src/screens/transactions/cheques/ChequesDashboardScreen.js`
  - Create `src/screens/transactions/cheques/ChequeDepositScreen.js`
  - Create `src/screens/transactions/cheques/ChequeDetailsScreen.js`
  - Create `src/screens/transactions/cheques/ChequeStatusScreen.js`
  - Create `src/screens/transactions/cheques/ChequeFeedbackScreen.js`
  - Create `src/screens/transactions/cheques/index.js`
  - _Requirements: 5.1-5.6_

- [ ] 9.3 Create Cheque Card Component

  - Create `src/components/transactions/ChequeCard.js`
  - Display cheque number, bank, amount, date, status
  - _Requirements: 5.1_

- [ ] 9.4 Add Cheques Navigation

  - Add ChequesStack to DashboardNavigator
  - Add Cheques access from Dashboard and Payments
  - _Requirements: 5.1_

- [ ] 9.5 Implement Cheque Business Logic

  - Handle cheque status transitions
  - Update payment status on clearance
  - Handle bounced cheques and reversals
  - _Requirements: 5.6, 5.7_

- [ ] 10. Payment Query Module

  - Create Redux slice with CRUD operations
  - Create list, generate, details, and edit screens
  - Add navigation routes
  - _Requirements: 6.1-6.4_

- [ ] 10.1 Create Payment Queries Redux Slice

  - Create `src/store/slices/paymentQueriesSlice.js`
  - Implement fetchPaymentQueries, generateQuery, fetchQueryById, updateQuery thunks
  - _Requirements: 6.1_

- [ ] 10.2 Create Payment Queries Screens

  - Create `src/screens/transactions/paymentQueries/PaymentQueriesListScreen.js`
  - Create `src/screens/transactions/paymentQueries/GeneratePaymentQueryScreen.js`
  - Create `src/screens/transactions/paymentQueries/PaymentQueryDetailsScreen.js`
  - Create `src/screens/transactions/paymentQueries/EditPaymentQueryScreen.js`
  - Create `src/screens/transactions/paymentQueries/index.js`
  - _Requirements: 6.1-6.4_

- [ ] 11. Payment Raise Module

  - Create Redux slice with CRUD operations
  - Create list, create, details, and edit screens
  - Add navigation routes
  - _Requirements: 7.1-7.4_

- [ ] 11.1 Create Payment Raises Redux Slice

  - Create `src/store/slices/paymentRaisesSlice.js`
  - Implement fetchPaymentRaises, createRaise, fetchRaiseById, updateRaise thunks
  - _Requirements: 7.1_

- [ ] 11.2 Create Payment Raises Screens

  - Create `src/screens/transactions/paymentRaises/PaymentRaisesListScreen.js`
  - Create `src/screens/transactions/paymentRaises/CreatePaymentRaiseScreen.js`
  - Create `src/screens/transactions/paymentRaises/PaymentRaiseDetailsScreen.js`
  - Create `src/screens/transactions/paymentRaises/EditPaymentRaiseScreen.js`
  - Create `src/screens/transactions/paymentRaises/index.js`
  - _Requirements: 7.1-7.4_

- [ ] 12. Unit Transfer Module

  - Create Redux slice with CRUD operations
  - Create list, create, details, edit, and transaction screens
  - Add navigation routes
  - _Requirements: 8.1-8.5_

- [ ] 12.1 Create Unit Transfers Redux Slice

  - Create `src/store/slices/unitTransfersSlice.js`
  - Implement fetchTransfers, createTransfer, fetchTransferById, updateTransfer thunks
  - _Requirements: 8.1_

- [ ] 12.2 Create Unit Transfers Screens

  - Create `src/screens/transactions/unitTransfers/UnitTransfersListScreen.js`
  - Create `src/screens/transactions/unitTransfers/CreateUnitTransferScreen.js`
  - Create `src/screens/transactions/unitTransfers/UnitTransferDetailsScreen.js`
  - Create `src/screens/transactions/unitTransfers/EditUnitTransferScreen.js`
  - Create `src/screens/transactions/unitTransfers/TransferTransactionScreen.js`
  - Create `src/screens/transactions/unitTransfers/index.js`
  - _Requirements: 8.1-8.5_

- [ ] 13. BBA Module

  - Create Redux slice with CRUD operations
  - Create dashboard, add, status, edit, and verify screens
  - Add BBA statistics
  - Add auto-verify and auto-status update
  - Add navigation routes
  - _Requirements: 9.1-9.8_

- [ ] 13.1 Create BBA Redux Slice

  - Create `src/store/slices/bbaSlice.js`
  - Implement fetchBBAs, createBBA, fetchBBAById, updateBBA, updateStatus, verifyBBA, autoVerify, autoStatusUpdate, fetchStatistics thunks
  - _Requirements: 9.1_

- [ ] 13.2 Create BBA Screens

  - Create `src/screens/transactions/bba/BBADashboardScreen.js`
  - Create `src/screens/transactions/bba/AddBBAScreen.js`
  - Create `src/screens/transactions/bba/BBAStatusScreen.js`
  - Create `src/screens/transactions/bba/EditBBAScreen.js`
  - Create `src/screens/transactions/bba/VerifyBBAScreen.js`
  - Create `src/screens/transactions/bba/index.js`
  - _Requirements: 9.1-9.8_

- [ ] 14. Dispatch Module

  - Create Redux slice with CRUD operations
  - Create list, create, details, edit, and items screens
  - Add navigation routes
  - _Requirements: 10.1-10.5_

- [ ] 14.1 Create Dispatches Redux Slice

  - Create `src/store/slices/dispatchesSlice.js`
  - Implement fetchDispatches, createDispatch, fetchDispatchById, updateDispatch, addItems thunks
  - _Requirements: 10.1_

- [ ] 14.2 Create Dispatches Screens

  - Create `src/screens/transactions/dispatches/DispatchesListScreen.js`
  - Create `src/screens/transactions/dispatches/CreateDispatchScreen.js`
  - Create `src/screens/transactions/dispatches/DispatchDetailsScreen.js`
  - Create `src/screens/transactions/dispatches/EditDispatchScreen.js`
  - Create `src/screens/transactions/dispatches/DispatchItemsScreen.js`
  - Create `src/screens/transactions/dispatches/index.js`
  - _Requirements: 10.1-10.5_

- [ ] 15. Customer Feedback Module

  - Create Redux slice with CRUD operations
  - Create dashboard, add, details, and history screens
  - Add navigation routes
  - _Requirements: 11.1-11.4_

- [ ] 15.1 Create Customer Feedback Redux Slice

  - Create `src/store/slices/customerFeedbackSlice.js`
  - Implement fetchFeedback, createFeedback, fetchFeedbackById, fetchCustomerHistory thunks
  - _Requirements: 11.1_

- [ ] 15.2 Create Customer Feedback Screens
  - Create `src/screens/transactions/feedback/FeedbackDashboardScreen.js`
  - Create `src/screens/transactions/feedback/AddFeedbackScreen.js`
  - Create `src/screens/transactions/feedback/FeedbackDetailsScreen.js`
  - Create `src/screens/transactions/feedback/CallingHistoryScreen.js`
  - Create `src/screens/transactions/feedback/index.js`
  - _Requirements: 11.1-11.4_

## INTEGRATION & TESTING

- [ ] 16. Navigation Integration

  - Update DashboardNavigator with all new stacks
  - Add quick access links from Dashboard
  - Test navigation flow between modules
  - _Requirements: 12.1-12.4_

- [ ] 17. Redux Store Integration

  - Add all new slices to store configuration
  - Test state management across modules
  - Verify data persistence
  - _Requirements: 13.1-13.4_

- [ ] 18. Error Handling

  - Implement consistent error handling across all modules
  - Add user-friendly error messages
  - Test error scenarios
  - _Requirements: 15.1-15.4_

- [ ] 19. Performance Optimization

  - Implement pagination for large lists
  - Add loading indicators
  - Optimize re-renders
  - Test on device
  - _Requirements: 14.1-14.4_

- [ ] 20. Final Testing
  - Test all CRUD operations
  - Test navigation flows
  - Test error scenarios
  - Test on physical device
  - Fix any bugs found
  - _Requirements: All_
