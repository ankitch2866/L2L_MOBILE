// Customer Service - API integration for customer-related operations
import api from '../config/api';

class CustomerService {
  /**
   * Fetch all projects
   */
  async getProjects() {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        return response.data.data || [];
      }
      throw new Error(response.data?.message || 'Failed to fetch projects');
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Fetch customers by project ID
   */
  async getCustomersByProject(projectId) {
    try {
      const response = await api.get(`/api/master/customers/project/${projectId}`);
      if (response.data?.success) {
        return response.data.data || [];
      }
      throw new Error(response.data?.message || 'Failed to fetch customers');
    } catch (error) {
      console.error('Error fetching customers by project:', error);
      throw error;
    }
  }

  /**
   * Search customer by ID (manual_application_id or customer_id)
   */
  async searchCustomer(customerId) {
    try {
      const response = await api.get(`/api/master/customers?search=${encodeURIComponent(customerId)}&limit=1`);
      if (response.data?.success && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      throw new Error(`Customer not found with ID: ${customerId}`);
    } catch (error) {
      console.error('Error searching customer:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive customer details
   */
  async getCustomerDetails(customerId) {
    try {
      // Use the customer ID directly (it's already the numeric ID from CustomerQueryCard)
      console.log('Fetching customer details for ID:', customerId);
      
      // Get detailed customer info directly
      const detailResponse = await api.get(`/api/master/customers/${customerId}`);
      
      if (!detailResponse.data?.success || !detailResponse.data.data) {
        throw new Error('Failed to fetch customer details');
      }
      
      let customerData = detailResponse.data.data;
      console.log('Fetched customer:', customerData.name, 'ID:', customerData.customer_id);
      
      // Fetch payment plan name if available
      if (customerData.payment_plan_id) {
        try {
          const planResponse = await api.get(`/api/master/plans/${customerData.payment_plan_id}`);
          if (planResponse.data?.success && planResponse.data.data) {
            customerData.plan_name = planResponse.data.data.plan_name;
          }
        } catch (planError) {
          console.log('Could not fetch plan details:', planError.message);
          // Continue without plan name
        }
      }
      
      // Try to get unit data
      try {
        const unitResponse = await api.get(`/api/home/customer-unit/${customerId}`);
        if (unitResponse.data?.success && unitResponse.data.data && unitResponse.data.data.length > 0) {
          const unitData = unitResponse.data.data[0];
          customerData = { ...customerData, ...unitData };
        }
      } catch (unitError) {
        console.log('No unit data found');
        // Continue without unit data
      }
      
      // Try to get booking data
      try {
        const bookingResponse = await api.get(`/api/transaction/bookings/customer/${customerId}/unit-details`);
        if (bookingResponse.data?.success && bookingResponse.data.data) {
          const bookingData = bookingResponse.data.data;
          customerData = { ...customerData, ...bookingData };
        }
      } catch (bookingError) {
        console.log('No booking data found');
        // Continue without booking data
      }
      
      return customerData;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a customer (using logic endpoint like web version)
   */
  async getPaymentHistory(customerId) {
    try {
      const response = await api.get(`/api/transaction/customer/payment-details-logic/${customerId}`);
      if (response.data?.success) {
        const payments = response.data.data || [];
        console.log('Raw payment data from API:', JSON.stringify(payments[0], null, 2));
        
        // The API returns formatted strings like "₹2,50,000" and "-", we need to parse them
        const parseAmount = (amountStr) => {
          if (!amountStr || amountStr === '-') return 0;
          // Remove ₹ symbol, commas, and parse
          const cleaned = String(amountStr).replace(/[₹,]/g, '').trim();
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        // Standardize field names for consistent rendering
        const standardized = payments.map(receipt => {
          const standardizedReceipt = {
            ...receipt,
            // Map API fields to expected fields
            receipt_number: receipt.receiptNo || 'N/A',
            payment_date: receipt.receiptDate,
            amount: parseAmount(receipt.totalAmount),
            cheque_no: receipt.chequeNo !== '-' ? receipt.chequeNo : null,
            cheque_date: receipt.chequeDate !== '-' ? receipt.chequeDate : null,
            drawn_on: receipt.drawnOn !== '-' ? receipt.drawnOn : null,
            status: receipt.status || 'C',
            // Parse breakdown amounts (they come as formatted strings)
            basic: parseAmount(receipt.basic),
            edc: parseAmount(receipt.edc),
            plc: parseAmount(receipt.plc),
            gst: parseAmount(receipt.gst),
            others: parseAmount(receipt.others),
          };
          
          console.log('Standardized receipt:', JSON.stringify(standardizedReceipt, null, 2));
          return standardizedReceipt;
        });
        
        return standardized;
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Fallback to basic endpoint
      try {
        const fallbackResponse = await api.get(`/api/transaction/payments/customer/${customerId}`);
        if (fallbackResponse.data?.success) {
          const payments = fallbackResponse.data.data || [];
          console.log('Fallback payment data from API:', JSON.stringify(payments[0], null, 2));
          
          const parseAmount = (amountStr) => {
            if (!amountStr || amountStr === '-') return 0;
            const cleaned = String(amountStr).replace(/[₹,]/g, '').trim();
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          };
          
          // Apply same standardization to fallback data
          return payments.map(receipt => ({
            ...receipt,
            receipt_number: receipt.receiptNo || receipt.receipt_number || 'N/A',
            payment_date: receipt.receiptDate || receipt.payment_date,
            amount: parseAmount(receipt.totalAmount || receipt.amount),
            cheque_no: receipt.chequeNo !== '-' ? receipt.chequeNo : null,
            cheque_date: receipt.chequeDate !== '-' ? receipt.chequeDate : null,
            drawn_on: receipt.drawnOn !== '-' ? receipt.drawnOn : null,
            status: receipt.status || 'C',
            basic: parseAmount(receipt.basic),
            edc: parseAmount(receipt.edc),
            plc: parseAmount(receipt.plc),
            gst: parseAmount(receipt.gst),
            others: parseAmount(receipt.others),
          }));
        }
      } catch (fallbackError) {
        console.error('Fallback payment fetch also failed:', fallbackError);
      }
      return [];
    }
  }

  /**
   * Get co-applicants for a customer
   */
  async getCoApplicants(customerId) {
    try {
      // Try master endpoint directly (transfer endpoint not available yet)
      const response = await api.get(`/api/master/co-applicants?customer_id=${customerId}`);
      if (response.data?.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      // Silently handle - endpoint may not exist for all customers
      return [];
    }
  }

  /**
   * Get broker information
   */
  async getBrokerInfo(brokerId) {
    try {
      const response = await api.get(`/api/master/brokers/${brokerId}`);
      if (response.data?.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching broker info:', error);
      return null;
    }
  }

  /**
   * Get documents for a customer
   */
  async getDocuments(customerId) {
    try {
      const response = await api.get(`/api/master/documents/customer/${customerId}`);
      if (response.data?.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      // Silently handle - endpoint may not exist yet
      return [];
    }
  }

  /**
   * Get customer feedback/calling history
   */
  async getCustomerFeedback(customerId) {
    try {
      const response = await api.get(`/api/transaction/customers/${customerId}/feedbacks`);
      if (response.data?.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching customer feedback:', error);
      return [];
    }
  }

  /**
   * Get dispatch data for a customer
   */
  async getDispatchData(customerId) {
    try {
      const response = await api.get(`/api/transaction/customer-dispatches?customer_id=${customerId}`);
      if (response.data?.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
      return [];
    }
  }

  /**
   * Get transfer history for a customer
   */
  async getTransferHistory(customerId) {
    try {
      const response = await api.get(`/api/transaction/transfer-charges`);
      if (response.data?.success) {
        // Filter for this specific customer
        const allTransfers = response.data.data || [];
        return allTransfers.filter(transfer => transfer.customer_id === parseInt(customerId));
      }
      return [];
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      return [];
    }
  }
}

export default new CustomerService();
