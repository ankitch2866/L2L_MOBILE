// Enhanced Customer Details Screen - Comprehensive customer information view
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { Text, Card, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  fetchCustomerDetails,
  fetchPaymentHistory,
  fetchCoApplicants,
  fetchBrokerInfo,
  fetchDocuments,
  fetchCustomerFeedback,
  fetchDispatchData,
  fetchTransferHistory,
  clearCustomerDetails
} from '../../store/slices/customersSlice';

const EnhancedCustomerDetailsScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const {
    customerDetails,
    paymentHistory,
    coApplicants,
    brokers,
    documents,
    customerFeedback,
    dispatchData,
    transferHistory,
    loadingDetails,
    loadingPayments,
    loadingCoApplicants,
    loadingDocuments,
    loadingFeedback,
    loadingDispatches,
    loadingTransfers,
    detailsError
  } = useSelector(state => state.customers);

  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    property: false,
    receiptDetails: false,
    coApplicants: false,
    broker: false,
    documents: false,
    feedback: false,
    dispatches: false,
    transfers: false
  });

  const customer = customerDetails[customerId];
  const payments = paymentHistory[customerId] || [];
  const customerCoApplicants = coApplicants[customerId] || [];
  const broker = customer?.broker_id ? brokers[customer.broker_id] : null;
  const customerDocuments = documents[customerId] || [];
  const feedback = customerFeedback[customerId] || [];
  const dispatches = dispatchData[customerId] || [];
  const transfers = transferHistory[customerId] || [];

  const loadCustomerData = useCallback(async () => {
    console.log('Loading customer data for ID:', customerId);
    await dispatch(fetchCustomerDetails(customerId));
    dispatch(fetchPaymentHistory(customerId));
    dispatch(fetchCoApplicants(customerId));
    dispatch(fetchDocuments(customerId));
    dispatch(fetchCustomerFeedback(customerId));
    dispatch(fetchDispatchData(customerId));
    dispatch(fetchTransferHistory(customerId));
  }, [customerId, dispatch]);

  // Reload data when customerId changes
  useEffect(() => {
    console.log('Customer ID changed to:', customerId);
    // Clear previous customer data first to avoid showing stale data
    dispatch(clearCustomerDetails(customerId));
    // Then load new customer data
    loadCustomerData();
    
    return () => {
      dispatch(clearCustomerDetails(customerId));
    };
  }, [customerId, dispatch, loadCustomerData]);

  // Also reload when screen comes into focus (for navigation back)
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, reloading customer:', customerId);
      loadCustomerData();
    }, [customerId, loadCustomerData])
  );

  useEffect(() => {
    if (customer?.broker_id && !brokers[customer.broker_id]) {
      dispatch(fetchBrokerInfo(customer.broker_id));
    }
  }, [customer?.broker_id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomerData();
    setRefreshing(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return null;
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return null;
      
      // Format as DD-MMM-YYYY (e.g., 01-Dec-2016)
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = dateObj.toLocaleString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return null;
    }
  };

  const styles = getStyles(theme);

  if (loadingDetails && !customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading customer details...</Text>
      </View>
    );
  }

  if (detailsError) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{detailsError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCustomerData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!customer) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant="headlineSmall" style={styles.customerName}>
            {customer.name || 'N/A'}
          </Text>
          <Text variant="bodyMedium" style={styles.customerId}>
            ID: {customer.manual_application_id || customer.customer_id}
          </Text>
        </View>
        <Chip 
          mode="flat" 
          style={[styles.statusChip, { backgroundColor: theme.colors.primaryContainer }]}
        >
          Active
        </Chip>
      </View>

      {/* Personal Information Section */}
      <CollapsibleSection
        title="Personal Information"
        icon="account"
        expanded={expandedSections.personal}
        onToggle={() => toggleSection('personal')}
        theme={theme}
      >
        <DetailRow icon="account" label="Name" value={customer.name} theme={theme} />
        <DetailRow icon="account-supervisor" label="Father/Guardian" value={customer.father_name} theme={theme} />
        <DetailRow icon="account-multiple" label="Grandfather" value={customer.grandfather_name} theme={theme} />
        <DetailRow 
          icon="phone" 
          label="Phone" 
          value={customer.phone_no} 
          onPress={() => handleCall(customer.phone_no)}
          theme={theme}
        />
        <DetailRow 
          icon="email" 
          label="Email" 
          value={customer.email?.trim()}
          onPress={customer.email?.trim() ? () => handleEmail(customer.email) : null}
          theme={theme}
        />
        <DetailRow icon="card-account-details" label="PAN" value={customer.pan_no} theme={theme} />
        <DetailRow icon="card-account-details-outline" label="Aadhar" value={customer.aadhar_no} theme={theme} />
        <DetailRow icon="map-marker" label="Address" value={customer.permanent_address} theme={theme} />
        <DetailRow icon="city" label="City" value={customer.city} theme={theme} />
        <DetailRow icon="map" label="State" value={customer.state} theme={theme} />
        <DetailRow icon="mailbox" label="Pincode" value={customer.pincode} theme={theme} />
        <DetailRow icon="calendar" label="Date of Birth" value={formatDate(customer.allottee_dob)} theme={theme} />
        <DetailRow icon="account-heart" label="Nominee" value={customer.nominee_name} theme={theme} />
      </CollapsibleSection>

      {/* Property Details Section */}
      <CollapsibleSection
        title="Property Details"
        icon="home"
        expanded={expandedSections.property}
        onToggle={() => toggleSection('property')}
        theme={theme}
      >
        <DetailRow icon="office-building" label="Project" value={customer.project_name} theme={theme} />
        <DetailRow icon="home-city" label="Unit No" value={customer.unit_name} theme={theme} />
        <DetailRow icon="floor-plan" label="Unit Type" value={customer.unit_type} theme={theme} />
        <DetailRow icon="ruler-square" label="Unit Size" value={customer.unit_size ? `${customer.unit_size} sq.ft.` : null} theme={theme} />
        <DetailRow icon="text-box" label="Description" value={customer.unit_desc_name} theme={theme} />
        <DetailRow icon="currency-inr" label="BSP (Rate)" value={customer.bsp ? `${formatCurrency(customer.bsp)}/sq.ft.` : null} theme={theme} />
        <DetailRow 
          icon="cash" 
          label="Total Cost" 
          value={customer.bsp && customer.unit_size ? formatCurrency(parseFloat(customer.bsp) * parseFloat(customer.unit_size)) : null} 
          theme={theme} 
        />
        <DetailRow icon="calendar-check" label="Booking Date" value={formatDate(customer.booking_date)} theme={theme} />
        <DetailRow icon="check-circle" label="Status" value={customer.unit_status} theme={theme} />
        <DetailRow icon="file-document" label="Payment Plan" value={customer.plan_name} theme={theme} />
      </CollapsibleSection>

      {/* Receipt Details Section */}
      <CollapsibleSection
        title="Receipt Details"
        icon="receipt"
        expanded={expandedSections.receiptDetails}
        onToggle={() => toggleSection('receiptDetails')}
        loading={loadingPayments}
        theme={theme}
      >
        {payments.length > 0 ? (
          payments.map((receipt, index) => (
            <View key={receipt.payment_id || index} style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptNumber}>
                  Receipt #{receipt.receipt_number} ({receipt.status || 'C'})
                </Text>
                <Chip mode="flat" style={styles.receiptStatus}>
                  {receipt.status || 'C'}
                </Chip>
              </View>
              
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Receipt Date:</Text>
                <Text style={styles.receiptValue}>
                  {receipt.payment_date || 'Not available'}
                </Text>
              </View>
              
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Amount:</Text>
                <Text style={[styles.receiptValue, styles.receiptAmount]}>
                  {receipt.amount ? `₹${parseFloat(receipt.amount).toLocaleString('en-IN')}` : '₹0'}
                </Text>
              </View>
              
              {receipt.cheque_no && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cheque No:</Text>
                  <Text style={styles.receiptValue}>{receipt.cheque_no}</Text>
                </View>
              )}
              
              {receipt.cheque_date && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cheque Date:</Text>
                  <Text style={styles.receiptValue}>
                    {receipt.cheque_date || 'Not available'}
                  </Text>
                </View>
              )}
              
              {receipt.drawn_on && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Drawn On:</Text>
                  <Text style={[styles.receiptValue, styles.receiptBank]}>
                    {receipt.drawn_on}
                  </Text>
                </View>
              )}
              
              <Divider style={styles.receiptDivider} />
              
              <Text style={styles.receiptBreakdownTitle}>Amount Breakdown</Text>
              
              {receipt.basic !== undefined && receipt.basic !== null && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Basic:</Text>
                  <Text style={styles.receiptValue}>₹{parseFloat(receipt.basic || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              
              {receipt.edc !== undefined && receipt.edc !== null && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>EDC:</Text>
                  <Text style={styles.receiptValue}>₹{parseFloat(receipt.edc || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              
              {receipt.plc !== undefined && receipt.plc !== null && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>PLC:</Text>
                  <Text style={styles.receiptValue}>₹{parseFloat(receipt.plc || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              
              {receipt.gst !== undefined && receipt.gst !== null && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>GST:</Text>
                  <Text style={styles.receiptValue}>₹{parseFloat(receipt.gst || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              
              {receipt.others !== undefined && receipt.others !== null && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Others:</Text>
                  <Text style={styles.receiptValue}>₹{parseFloat(receipt.others || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              
              {index < payments.length - 1 && <Divider style={styles.receiptCardDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No receipt details available</Text>
        )}
      </CollapsibleSection>

      {/* Co-Applicants Section */}
      <CollapsibleSection
        title="Co-Applicants"
        icon="account-multiple"
        expanded={expandedSections.coApplicants}
        onToggle={() => toggleSection('coApplicants')}
        loading={loadingCoApplicants}
        theme={theme}
      >
        {customerCoApplicants.length > 0 ? (
          customerCoApplicants.map((coApplicant, index) => (
            <View key={coApplicant.co_applicant_id} style={styles.coApplicantItem}>
              <Text style={styles.coApplicantName}>{coApplicant.name}</Text>
              <DetailRow 
                icon="phone" 
                label="Mobile" 
                value={coApplicant.mobile}
                onPress={() => handleCall(coApplicant.mobile)}
                theme={theme}
                compact
              />
              <DetailRow 
                icon="email" 
                label="Email" 
                value={coApplicant.email}
                onPress={() => handleEmail(coApplicant.email)}
                theme={theme}
                compact
              />
              {index < customerCoApplicants.length - 1 && <Divider style={styles.coApplicantDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No co-applicants</Text>
        )}
      </CollapsibleSection>

      {/* Broker Information Section */}
      {customer.broker_id && (
        <CollapsibleSection
          title="Broker Information"
          icon="account-tie"
          expanded={expandedSections.broker}
          onToggle={() => toggleSection('broker')}
          theme={theme}
        >
          {broker ? (
            <>
              <DetailRow icon="account" label="Name" value={broker.name} theme={theme} />
              <DetailRow 
                icon="phone" 
                label="Mobile" 
                value={broker.mobile}
                onPress={() => handleCall(broker.mobile)}
                theme={theme}
              />
              <DetailRow 
                icon="email" 
                label="Email" 
                value={broker.email}
                onPress={() => handleEmail(broker.email)}
                theme={theme}
              />
              <DetailRow icon="percent" label="Commission Rate" value={broker.commission_rate ? `${broker.commission_rate}%` : 'N/A'} theme={theme} />
            </>
          ) : (
            <Text style={styles.emptyText}>Loading broker information...</Text>
          )}
        </CollapsibleSection>
      )}

      {/* Documents Section */}
      <CollapsibleSection
        title="Documents"
        icon="file-document-multiple"
        expanded={expandedSections.documents}
        onToggle={() => toggleSection('documents')}
        loading={loadingDocuments}
        theme={theme}
      >
        {customerDocuments.length > 0 ? (
          customerDocuments.map((doc, index) => (
            <View key={doc.document_id || index} style={styles.documentItem}>
              <View style={styles.documentHeader}>
                <Icon name="file-document" size={24} color={theme.colors.primary} />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.document_name}</Text>
                  <Text style={styles.documentType}>{doc.document_type}</Text>
                </View>
                <Chip 
                  mode="flat" 
                  style={[
                    styles.documentStatus,
                    doc.status === 'approved' && { backgroundColor: theme.colors.successContainer },
                    doc.status === 'rejected' && { backgroundColor: theme.colors.errorContainer },
                  ]}
                  textStyle={{ fontSize: 12 }}
                >
                  {doc.status || 'pending'}
                </Chip>
              </View>
              {index < customerDocuments.length - 1 && <Divider style={styles.documentDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No documents available</Text>
        )}
      </CollapsibleSection>

      {/* Customer Feedback/Calling History Section */}
      <CollapsibleSection
        title="Calling History"
        icon="phone-log"
        expanded={expandedSections.feedback}
        onToggle={() => toggleSection('feedback')}
        loading={loadingFeedback}
        theme={theme}
      >
        {feedback.length > 0 ? (
          feedback.map((call, index) => (
            <View key={call.feedback_id || index} style={styles.feedbackItem}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackDate}>{formatDate(call.feedback_date || call.created_at)}</Text>
                <Chip 
                  mode="flat" 
                  style={styles.feedbackType}
                  textStyle={{ fontSize: 11 }}
                >
                  {call.call_type || call.type || 'Outgoing'}
                </Chip>
              </View>
              <Text style={styles.feedbackInteracted}>
                Interacted with: {call.interacted_with || call.contacted_by || 'N/A'}
              </Text>
              <Text style={styles.feedbackResponse}>
                Response: {call.response || call.feedback || 'N/A'}
              </Text>
              {index < feedback.length - 1 && <Divider style={styles.feedbackDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No calling history available</Text>
        )}
      </CollapsibleSection>

      {/* Dispatch History Section */}
      <CollapsibleSection
        title="Dispatch History"
        icon="truck-delivery"
        expanded={expandedSections.dispatches}
        onToggle={() => toggleSection('dispatches')}
        loading={loadingDispatches}
        theme={theme}
      >
        {dispatches.length > 0 ? (
          dispatches.map((dispatch, index) => (
            <View key={dispatch.dispatch_id || index} style={styles.dispatchItem}>
              <View style={styles.dispatchHeader}>
                <Text style={styles.dispatchDate}>{formatDate(dispatch.dispatch_date)}</Text>
                <Chip 
                  mode="flat" 
                  style={styles.dispatchStatus}
                  textStyle={{ fontSize: 11 }}
                >
                  {dispatch.status || 'Dispatched'}
                </Chip>
              </View>
              {dispatch.document_type && (
                <Text style={styles.dispatchType}>Type: {dispatch.document_type}</Text>
              )}
              {dispatch.courier_name && (
                <Text style={styles.dispatchCourier}>Courier: {dispatch.courier_name}</Text>
              )}
              {dispatch.tracking_number && (
                <Text style={styles.dispatchTracking}>Tracking: {dispatch.tracking_number}</Text>
              )}
              {index < dispatches.length - 1 && <Divider style={styles.dispatchDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No dispatch history available</Text>
        )}
      </CollapsibleSection>

      {/* Transfer History Section */}
      <CollapsibleSection
        title="Transfer History"
        icon="swap-horizontal"
        expanded={expandedSections.transfers}
        onToggle={() => toggleSection('transfers')}
        loading={loadingTransfers}
        theme={theme}
      >
        {transfers.length > 0 ? (
          transfers.map((transfer, index) => (
            <View key={transfer.transfer_id || index} style={styles.transferItem}>
              <View style={styles.transferHeader}>
                <Text style={styles.transferDate}>{formatDate(transfer.transfer_date)}</Text>
                <Text style={styles.transferAmount}>{formatCurrency(transfer.transfer_charge)}</Text>
              </View>
              <Text style={styles.transferFrom}>
                From: {transfer.from_customer_name || 'N/A'}
              </Text>
              <Text style={styles.transferTo}>
                To: {transfer.to_customer_name || transfer.name || 'N/A'}
              </Text>
              {transfer.broker_name && (
                <Text style={styles.transferBroker}>Broker: {transfer.broker_name}</Text>
              )}
              {index < transfers.length - 1 && <Divider style={styles.transferDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No transfer history available</Text>
        )}
      </CollapsibleSection>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, expanded, onToggle, loading, children, theme }) => {
  const styles = getSectionStyles(theme);
  
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onToggle} style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name={icon} size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
        </View>
        <View style={styles.headerRight}>
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />}
          <Icon 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={theme.colors.onSurface} 
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Card>
  );
};

// Detail Row Component
const DetailRow = ({ icon, label, value, onPress, theme, compact }) => {
  // Don't render if value is empty, null, or undefined
  // Exception: for email field, show "Not provided" instead of hiding
  if (!value || (typeof value === 'string' && !value.trim())) {
    // Special case for email - show "Not provided"
    if (label === 'Email') {
      value = 'Not provided';
    } else {
      return null;
    }
  }
  
  const styles = getDetailRowStyles(theme);
  const content = (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <View style={styles.rowContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, onPress && styles.valueLink]}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (onPress && value && value !== 'Not provided') {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.onSurface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: theme.colors.error,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  headerContent: {
    flex: 1,
  },
  customerName: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  customerId: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  // Receipt Details Styles
  receiptCard: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  receiptStatus: {
    backgroundColor: theme.colors.primaryContainer,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.onSurface,
    flex: 1,
    textAlign: 'right',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  receiptBank: {
    fontSize: 11,
  },
  receiptDivider: {
    marginVertical: 12,
    backgroundColor: theme.colors.outline,
    height: 1,
  },
  receiptBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  receiptCardDivider: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#000000',
    height: 2,
    opacity: 0.3,
  },
  coApplicantItem: {
    paddingVertical: 12,
  },
  coApplicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  coApplicantDivider: {
    marginTop: 12,
  },
  documentItem: {
    paddingVertical: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  documentType: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  documentStatus: {
    marginLeft: 8,
  },
  documentDivider: {
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    padding: 20,
  },
  // Feedback styles
  feedbackItem: {
    paddingVertical: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  feedbackType: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  feedbackInteracted: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  feedbackResponse: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  feedbackDivider: {
    marginTop: 12,
  },
  // Dispatch styles
  dispatchItem: {
    paddingVertical: 12,
  },
  dispatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dispatchDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  dispatchStatus: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  dispatchType: {
    fontSize: 13,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  dispatchCourier: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dispatchTracking: {
    fontSize: 13,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  dispatchDivider: {
    marginTop: 12,
  },
  // Transfer styles
  transferItem: {
    paddingVertical: 12,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  transferAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  transferFrom: {
    fontSize: 13,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  transferTo: {
    fontSize: 13,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  transferBroker: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  transferDivider: {
    marginTop: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});

const getSectionStyles = (theme) => StyleSheet.create({
  card: {
    margin: 8,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});

const getDetailRowStyles = (theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  rowCompact: {
    paddingVertical: 4,
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  valueLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});

export default EnhancedCustomerDetailsScreen;
