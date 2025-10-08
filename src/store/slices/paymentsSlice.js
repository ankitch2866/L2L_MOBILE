import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Fetch all payments
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching payments with filters:', filters);
      const params = new URLSearchParams();
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/transaction/payment/dashboard?${params.toString()}`);
      console.log('Payments API response:', response.data);
      console.log('Full API response structure:', JSON.stringify(response.data, null, 2));
      
      const payments = response.data?.data || response.data || [];
      let totalCount = payments.length;
      
      // Try different possible total count fields
      if (response.data?.total) {
        totalCount = response.data.total;
      } else if (response.data?.totalCount) {
        totalCount = response.data.totalCount;
      } else if (response.data?.count) {
        totalCount = response.data.count;
      } else if (response.data?.pagination?.total) {
        totalCount = response.data.pagination.total;
      } else if (response.data?.meta?.total) {
        totalCount = response.data.meta.total;
      } else {
        // If no total count is provided, assume we got all payments
        // This handles cases where backend doesn't support pagination
        totalCount = payments.length;
        console.log('No total count found in response, using payments length:', totalCount);
      }
      
      console.log('Payments data:', payments);
      console.log('Number of payments:', payments.length);
      console.log('Total count:', totalCount);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      return { payments, totalCount };
    } catch (error) {
      console.error('Error fetching payments:', error);
      console.error('Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payments');
    }
  }
);

// Fetch all payments for statistics calculation (without pagination)
export const fetchAllPaymentsForStats = createAsyncThunk(
  'payments/fetchAllPaymentsForStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching all payments for statistics...');
      
      // Simple approach: Just get all payments with high limit
      let allPayments = [];
      
      try {
        const response = await api.get('/api/transaction/payment/dashboard?limit=10000');
        console.log('All payments API response:', response.data);
        allPayments = response.data?.data || response.data || [];
        console.log('Got payments with high limit:', allPayments.length);
      } catch (error) {
        console.log('High limit approach failed, trying without limit:', error.message);
        try {
          const response2 = await api.get('/api/transaction/payment/dashboard');
          console.log('No limit API response:', response2.data);
          allPayments = response2.data?.data || response2.data || [];
          console.log('Got payments without limit:', allPayments.length);
        } catch (error2) {
          console.log('All approaches failed:', error2.message);
          allPayments = [];
        }
      }
      
      // Approach 4: If we still have limited results, try to fetch all pages
      // Only do this if we have very few payments (less than 20) to avoid duplicates
      if (allPayments.length > 0 && allPayments.length < 20) {
        console.log('Attempting to fetch all pages for complete statistics...');
        try {
          let page = 2; // Start from page 2 since we already have page 1
          let hasMorePages = true;
          let allPagesPayments = [...allPayments];
          
          while (hasMorePages && page <= 10) { // Limit to 10 pages to prevent infinite loop
            const response = await api.get(`/api/transaction/payment/dashboard?page=${page}&limit=100`);
            const pagePayments = response.data?.data || response.data || [];
            
            if (pagePayments.length === 0) {
              hasMorePages = false;
            } else {
              allPagesPayments = [...allPagesPayments, ...pagePayments];
              page++;
              console.log(`Fetched page ${page - 1}, total payments so far: ${allPagesPayments.length}`);
            }
          }
          
          if (allPagesPayments.length > allPayments.length) {
            allPayments = allPagesPayments;
            console.log('Fetched all pages, total payments:', allPayments.length);
          }
        } catch (error) {
          console.log('Multi-page fetch failed:', error.message);
        }
      }
      
      // Remove duplicates based on payment_id or transaction_id
      const uniquePayments = [];
      const seenIds = new Set();
      
      for (const payment of allPayments) {
        const id = payment.payment_id || payment.transaction_id || payment.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          uniquePayments.push(payment);
        }
      }
      
      console.log('Original payments count:', allPayments.length);
      console.log('Unique payments count:', uniquePayments.length);
      console.log('Sample payment:', uniquePayments[0]);
      return uniquePayments;
    } catch (error) {
      console.error('Error fetching all payments for stats:', error);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch all payments');
    }
  }
);

// Create new payment
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transaction/store-payment-transaction', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create payment');
    }
  }
);

// Fetch payment by ID
export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching payment by ID:', id);
      const response = await api.get(`/api/transaction/payment/transaction/${id}`);
      console.log('Payment by ID API response:', response.data);
      const payment = response.data?.data || response.data;
      console.log('Payment data loaded:', payment);
      return payment;
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      console.error('Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch payment');
    }
  }
);

// Update payment
export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/transaction/payment/transaction/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update payment');
    }
  }
);

// Delete payment
export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/transaction/payment/transaction/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete payment');
    }
  }
);

// Fetch customer payments
export const fetchCustomerPayments = createAsyncThunk(
  'payments/fetchCustomerPayments',
  async (customerId, { rejectWithValue }) => {
    try {
      console.log('Fetching customer payments for ID:', customerId);
      const response = await api.get(`/api/transaction/customer/payment-details/${customerId}`);
      console.log('Customer payments API response:', response.data);
      const payments = response.data?.data || response.data || [];
      console.log('Customer payments loaded:', payments.length);
      return payments;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      console.error('Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch customer payments');
    }
  }
);

// Fetch payment statistics
export const fetchStatistics = createAsyncThunk(
  'payments/fetchStatistics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching payment statistics with filters:', filters);
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.project_id) params.append('project_id', filters.project_id);
      
      const response = await api.get(`/api/transaction/total-collection?${params.toString()}`);
      console.log('Payment statistics API response:', response.data);
      console.log('Statistics data:', response.data?.data || response.data);
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      console.error('Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
);

// DISABLED: Credit Payment Functions - endpoints don't exist in backend
// export const fetchCreditPayments = createAsyncThunk(
//   'payments/fetchCreditPayments',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const params = new URLSearchParams();
//       if (filters.customer_id) params.append('customer_id', filters.customer_id);
//       if (filters.credit_type) params.append('credit_type', filters.credit_type);
//       if (filters.status) params.append('status', filters.status);
//       if (filters.date_from) params.append('date_from', filters.date_from);
//       if (filters.date_to) params.append('date_to', filters.date_to);
//       
//       const response = await api.get(`/api/transaction/credit-payments?${params.toString()}`);
//       return response.data?.data || response.data || [];
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch credit payments');
//     }
//   }
// );

// DISABLED: Credit Payment Functions - endpoints don't exist in backend
// export const createCreditPayment = createAsyncThunk(
//   'payments/createCreditPayment',
//   async (creditData, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/api/transaction/credit-payments', creditData);
//       return response.data?.data || response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create credit payment');
//     }
//   }
// );

// export const fetchCreditPaymentById = createAsyncThunk(
//   'payments/fetchCreditPaymentById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/api/transaction/credit-payments/${id}`);
//       return response.data?.data || response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch credit payment');
//     }
//   }
// );

// export const updateCreditPayment = createAsyncThunk(
//   'payments/updateCreditPayment',
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await api.put(`/api/transaction/credit-payments/${id}`, data);
//       return response.data?.data || response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update credit payment');
//     }
//   }
// );

// export const deleteCreditPayment = createAsyncThunk(
//   'payments/deleteCreditPayment',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await api.delete(`/api/transaction/credit-payments/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to delete credit payment');
//     }
//   }
// );

// DISABLED: Credit Payment Functions - endpoints don't exist in backend
// export const fetchCreditPaymentStats = createAsyncThunk(
//   'payments/fetchCreditPaymentStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/api/transaction/credit-payments/statistics');
//       return response.data?.data || response.data || {};
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch credit payment statistics');
//     }
//   }
// );

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    totalCount: 0,
    filters: {
      customer_id: null,
      project_id: null,
      payment_method: null,
      date_from: null,
      date_to: null,
    },
    statistics: {
      total_amount: 0,
      total_count: 0,
      by_method: {},
    },
    // Credit Payment State
    creditPayments: [],
    currentCreditPayment: null,
    creditStats: {},
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        customer_id: null,
        project_id: null,
        payment_method: null,
        date_from: null,
        date_to: null,
      };
    },
    clearCurrentPayment: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalStatistics: (state) => {
      const payments = state.list;
      const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const byMethod = payments.reduce((acc, p) => {
        const method = p.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + (parseFloat(p.amount) || 0);
        return acc;
      }, {});
      
      state.statistics = {
        total_amount: totalAmount,
        total_count: payments.length,
        by_method: byMethod,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'payments' in action.payload) {
          state.list = Array.isArray(action.payload.payments) ? action.payload.payments : [];
          state.totalCount = action.payload.totalCount || 0;
        } else {
          // Fallback for old format
          state.list = Array.isArray(action.payload) ? action.payload : [];
          state.totalCount = state.list.length;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(p => p.id !== action.payload);
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customer payments
      .addCase(fetchCustomerPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCustomerPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DISABLED: Create credit payment - function commented out
      // .addCase(createCreditPayment.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(createCreditPayment.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.list.push(action.payload);
      // })
      // .addCase(createCreditPayment.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all payments for stats
      .addCase(fetchAllPaymentsForStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentsForStats.fulfilled, (state, action) => {
        state.loading = false;
        // Calculate statistics from all payments
        const allPayments = action.payload || [];
        console.log('Calculating statistics from payments:', allPayments.length);
        console.log('Sample payment for calculation:', allPayments[0]);
        
        const total_amount = allPayments.reduce((sum, payment) => {
          const amount = parseFloat(payment.amount) || 0;
          return sum + amount;
        }, 0);
        
        const transaction_count = allPayments.length;
        
        const online_amount = allPayments
          .filter(p => p.payment_method === 'online' || p.payment_method === 'ONLINE' || p.mode === 'ONLINE')
          .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
          
        const cheque_amount = allPayments
          .filter(p => p.payment_method === 'cheque' || p.payment_method === 'CHEQUE' || p.mode === 'CHEQUE')
          .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        
        const cash_amount = total_amount - online_amount - cheque_amount;
        
        state.statistics = {
          total_amount,
          transaction_count,
          online_amount,
          cheque_amount,
          cash_amount,
          by_method: {
            online: online_amount,
            cheque: cheque_amount,
            cash: cash_amount
          }
        };
        
        console.log('=== CALCULATED STATISTICS ===');
        console.log('Total payments processed:', allPayments.length);
        console.log('Total amount:', total_amount);
        console.log('Transaction count:', transaction_count);
        console.log('Online amount:', online_amount);
        console.log('Cheque amount:', cheque_amount);
        console.log('Cash amount:', cash_amount);
        console.log('Final statistics object:', state.statistics);
        console.log('=============================');
      })
      .addCase(fetchAllPaymentsForStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DISABLED: Credit Payment Reducers - function commented out
      // .addCase(fetchCreditPayments.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCreditPayments.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.creditPayments = action.payload;
      // })
      // .addCase(fetchCreditPayments.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      // DISABLED: Credit Payment Reducers - functions commented out
      // .addCase(fetchCreditPaymentById.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCreditPaymentById.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.currentCreditPayment = action.payload;
      // })
      // .addCase(fetchCreditPaymentById.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      // .addCase(updateCreditPayment.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(updateCreditPayment.fulfilled, (state, action) => {
      //   state.loading = false;
      //   const index = state.creditPayments.findIndex(p => p.credit_id === action.payload.credit_id);
      //   if (index !== -1) {
      //     state.creditPayments[index] = action.payload;
      //   }
      //   state.currentCreditPayment = action.payload;
      // })
      // .addCase(updateCreditPayment.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      // .addCase(deleteCreditPayment.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(deleteCreditPayment.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.creditPayments = state.creditPayments.filter(p => p.credit_id !== action.payload);
      //   if (state.currentCreditPayment?.credit_id === action.payload) {
      //     state.currentCreditPayment = null;
      //   }
      // })
      // .addCase(deleteCreditPayment.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      // DISABLED: Credit payment stats - function commented out
      // .addCase(fetchCreditPaymentStats.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCreditPaymentStats.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.creditStats = action.payload;
      // })
      // .addCase(fetchCreditPaymentStats.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearCurrentPayment, 
  clearError,
  updateLocalStatistics 
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
