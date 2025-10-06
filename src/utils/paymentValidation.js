// Payment Validation and Business Logic Utilities

/**
 * Validate payment amount
 * @param {number|string} amount - Payment amount
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePaymentAmount = (amount) => {
  if (!amount || amount === '') {
    return { valid: false, error: 'Amount is required' };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  if (numAmount > 100000000) { // 10 crore limit
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate payment method specific fields
 * @param {string} method - Payment method
 * @param {object} data - Payment data
 * @returns {object} - { valid: boolean, errors: object }
 */
export const validatePaymentMethodFields = (method, data) => {
  const errors = {};
  
  switch (method?.toLowerCase()) {
    case 'cheque':
      if (!data.cheque_number || data.cheque_number.trim() === '') {
        errors.cheque_number = 'Cheque number is required';
      }
      if (!data.bank_id) {
        errors.bank_id = 'Bank is required for cheque payments';
      }
      break;
      
    case 'online':
      if (!data.transaction_id || data.transaction_id.trim() === '') {
        errors.transaction_id = 'Transaction ID is required';
      }
      break;
      
    case 'card':
      if (data.transaction_id && data.transaction_id.length < 4) {
        errors.transaction_id = 'Invalid transaction ID';
      }
      break;
      
    case 'upi':
      if (data.transaction_id && data.transaction_id.length < 12) {
        errors.transaction_id = 'Invalid UPI transaction ID';
      }
      break;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate payment date
 * @param {string} date - Payment date (YYYY-MM-DD)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePaymentDate = (date) => {
  if (!date || date === '') {
    return { valid: false, error: 'Payment date is required' };
  }
  
  const paymentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(paymentDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Payment date cannot be in the future
  if (paymentDate > today) {
    return { valid: false, error: 'Payment date cannot be in the future' };
  }
  
  // Payment date cannot be more than 1 year old
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (paymentDate < oneYearAgo) {
    return { valid: false, error: 'Payment date cannot be more than 1 year old' };
  }
  
  return { valid: true, error: null };
};

/**
 * Calculate customer balance after payment
 * @param {number} currentBalance - Current customer balance
 * @param {number} paymentAmount - Payment amount
 * @param {string} paymentType - 'debit' or 'credit'
 * @returns {number} - New balance
 */
export const calculateCustomerBalance = (currentBalance, paymentAmount, paymentType = 'debit') => {
  const balance = parseFloat(currentBalance) || 0;
  const amount = parseFloat(paymentAmount) || 0;
  
  if (paymentType === 'credit') {
    return balance + amount;
  } else {
    return balance - amount;
  }
};

/**
 * Validate credit payment
 * @param {object} data - Credit payment data
 * @returns {object} - { valid: boolean, errors: object }
 */
export const validateCreditPayment = (data) => {
  const errors = {};
  
  if (!data.customer_id) {
    errors.customer_id = 'Customer is required';
  }
  
  const amountValidation = validatePaymentAmount(data.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
  }
  
  if (!data.credit_type) {
    errors.credit_type = 'Credit type is required';
  }
  
  if (!data.reason || data.reason.trim() === '') {
    errors.reason = 'Reason is required';
  } else if (data.reason.length < 10) {
    errors.reason = 'Reason must be at least 10 characters';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format payment data for API submission
 * @param {object} formData - Form data
 * @returns {object} - Formatted payment data
 */
export const formatPaymentData = (formData) => {
  const data = {
    customer_id: formData.customer_id,
    amount: parseFloat(formData.amount),
    payment_method: formData.payment_method,
    payment_date: formData.payment_date,
  };
  
  // Add optional fields if present
  if (formData.project_id) data.project_id = formData.project_id;
  if (formData.unit_id) data.unit_id = formData.unit_id;
  if (formData.transaction_id) data.transaction_id = formData.transaction_id;
  if (formData.cheque_number) data.cheque_number = formData.cheque_number;
  if (formData.bank_id) data.bank_id = formData.bank_id;
  if (formData.remarks) data.remarks = formData.remarks;
  
  return data;
};

/**
 * Check if payment can be edited
 * @param {object} payment - Payment object
 * @returns {object} - { canEdit: boolean, reason: string }
 */
export const canEditPayment = (payment) => {
  if (!payment) {
    return { canEdit: false, reason: 'Payment not found' };
  }
  
  // Check if payment is older than 30 days
  const paymentDate = new Date(payment.payment_date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (paymentDate < thirtyDaysAgo) {
    return { canEdit: false, reason: 'Cannot edit payments older than 30 days' };
  }
  
  // Check if payment is linked to cleared cheque
  if (payment.payment_method === 'cheque' && payment.cheque_status === 'cleared') {
    return { canEdit: false, reason: 'Cannot edit payment with cleared cheque' };
  }
  
  return { canEdit: true, reason: null };
};

/**
 * Check if payment can be deleted
 * @param {object} payment - Payment object
 * @returns {object} - { canDelete: boolean, reason: string }
 */
export const canDeletePayment = (payment) => {
  if (!payment) {
    return { canDelete: false, reason: 'Payment not found' };
  }
  
  // Check if payment is older than 7 days
  const paymentDate = new Date(payment.payment_date);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  if (paymentDate < sevenDaysAgo) {
    return { canDelete: false, reason: 'Cannot delete payments older than 7 days' };
  }
  
  // Check if payment is linked to cleared cheque
  if (payment.payment_method === 'cheque' && payment.cheque_status === 'cleared') {
    return { canDelete: false, reason: 'Cannot delete payment with cleared cheque' };
  }
  
  return { canDelete: true, reason: null };
};
