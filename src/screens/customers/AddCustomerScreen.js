import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  Text,
  Searchbar,
  ActivityIndicator,
  IconButton,
  Surface
} from 'react-native-paper';
import { useTheme } from '../../context';
import api from '../../config/api';

const { height } = Dimensions.get('window');

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Compact Popup Modal Component
const CompactPickerModal = ({ visible, onClose, items, onSelect, title, searchKey }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  const filteredItems = items.filter(item => {
    const searchText = typeof item === 'string' ? item : item[searchKey];
    return searchText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <Surface style={[styles.pickerSurface, { backgroundColor: theme.colors.surface }]} elevation={5}>
            {/* Header */}
            <View style={styles.pickerHeader}>
              <Text variant="titleLarge" style={styles.pickerTitle}>{title}</Text>
              <IconButton icon="close" size={24} onPress={onClose} />
            </View>

            {/* Search */}
            <Searchbar
              placeholder={`Search...`}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.compactSearch}
              inputStyle={{ fontSize: 14 }}
            />

            {/* Scrollable List */}
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={true}>
              {filteredItems.map((item, index) => {
                const displayText = typeof item === 'string' ? item : item[searchKey];
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.pickerItem}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                      setSearchQuery('');
                    }}
                  >
                    <Text variant="bodyLarge">{displayText}</Text>
                  </TouchableOpacity>
                );
              })}
              {filteredItems.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </Surface>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const AddCustomerScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    project_id: '', broker_id: '', booking_receipt: '', name: '', father_name: '',
    grandfather_name: '', allottee_dob: '', permanent_address: '', mailing_address: '',
    city: '', state: '', district: '', pincode: '', email: '', phone_no: '', fax: '',
    std_isd_code: '', income_tax_ward_no: '', dist_no: '', pan_no: '', aadhar_no: '',
    gstin: '', nominee_name: '', nominee_address: '',
  });

  const [projects, setProjects] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState({ projects: true, brokers: true, submit: false });
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState({ project: false, broker: false, state: false });
  const [expandedSections, setExpandedSections] = useState({
    project: true, personal: true, contact: true, address: true, tax: false, nominee: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, brokersRes] = await Promise.all([
        api.get('/api/master/projects'),
        api.get('/api/master/brokers'),
      ]);
      if (projectsRes.data?.success) setProjects(projectsRes.data.data || []);
      if (brokersRes.data?.success) setBrokers(brokersRes.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading({ projects: false, brokers: false, submit: false });
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.project_id) newErrors.project_id = 'Required';
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.father_name.trim()) newErrors.father_name = 'Required';
    if (!formData.permanent_address.trim()) newErrors.permanent_address = 'Required';
    if (!formData.phone_no.trim()) newErrors.phone_no = 'Required';
    else if (!/^\d{10}$/.test(formData.phone_no)) newErrors.phone_no = '10 digits required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.state.trim()) newErrors.state = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = '6 digits required';
    if (!formData.booking_receipt.trim()) newErrors.booking_receipt = 'Required';
    if (!formData.aadhar_no.trim()) newErrors.aadhar_no = 'Required';
    else if (!/^\d{12}$/.test(formData.aadhar_no)) newErrors.aadhar_no = '12 digits required';
    if (formData.pan_no && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no)) {
      newErrors.pan_no = 'Invalid PAN';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }
    setLoading(prev => ({ ...prev, submit: true }));
    try {
      const payload = { ...formData, allottee_dob: formData.allottee_dob || null, country: 'India' };
      const response = await api.post('/api/master/customers', payload);
      if (response.data?.success) {
        Alert.alert('Success', 'Customer registered successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register customer');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const selectedProject = projects.find(p => p.project_id === formData.project_id);
  const selectedBroker = brokers.find(b => b.broker_id === formData.broker_id);

  if (loading.projects || loading.brokers) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: '#F5F7FA' }]}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Modern Header */}
          <View style={styles.modernHeader}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>👤</Text>
            </View>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              New Customer
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Complete the form to register a new customer
            </Text>
          </View>

          {/* Project & Broker Section */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('project')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={{ fontSize: 18 }}>🏢</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Project & Broker</Text>
              </View>
              <IconButton icon={expandedSections.project ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.project && (
              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={[styles.modernSelect, errors.project_id && styles.errorBorder]}
                  onPress={() => setModalVisible({ ...modalVisible, project: true })}
                >
                  <Text style={selectedProject ? styles.selectText : styles.selectPlaceholder}>
                    {selectedProject ? selectedProject.project_name : 'Select Project *'}
                  </Text>
                  <IconButton icon="chevron-down" size={20} style={styles.selectIcon} />
                </TouchableOpacity>
                {errors.project_id && <HelperText type="error">{errors.project_id}</HelperText>}

                <TouchableOpacity
                  style={styles.modernSelect}
                  onPress={() => setModalVisible({ ...modalVisible, broker: true })}
                >
                  <Text style={selectedBroker ? styles.selectText : styles.selectPlaceholder}>
                    {selectedBroker ? selectedBroker.name : 'Select Broker (Optional)'}
                  </Text>
                  <IconButton icon="chevron-down" size={20} style={styles.selectIcon} />
                </TouchableOpacity>

                <TextInput
                  label="Booking Receipt *"
                  value={formData.booking_receipt}
                  onChangeText={(text) => updateField('booking_receipt', text)}
                  error={!!errors.booking_receipt}
                  mode="outlined"
                  style={styles.modernInput}
                  outlineStyle={styles.inputOutline}
                />
                {errors.booking_receipt && <HelperText type="error">{errors.booking_receipt}</HelperText>}
              </View>
            )}
          </Surface>

          {/* Personal Information */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('personal')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#F3E5F5' }]}>
                  <Text style={{ fontSize: 18 }}>👨</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Personal Info</Text>
              </View>
              <IconButton icon={expandedSections.personal ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.personal && (
              <View style={styles.cardContent}>
                <TextInput label="Name *" value={formData.name} onChangeText={(text) => updateField('name', text)} error={!!errors.name} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.name && <HelperText type="error">{errors.name}</HelperText>}
                <TextInput label="Father Name *" value={formData.father_name} onChangeText={(text) => updateField('father_name', text)} error={!!errors.father_name} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.father_name && <HelperText type="error">{errors.father_name}</HelperText>}
                <TextInput label="Grandfather Name" value={formData.grandfather_name} onChangeText={(text) => updateField('grandfather_name', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Date of Birth (YYYY-MM-DD)" value={formData.allottee_dob} onChangeText={(text) => updateField('allottee_dob', text)} mode="outlined" placeholder="1990-01-15" style={styles.modernInput} outlineStyle={styles.inputOutline} />
              </View>
            )}
          </Surface>

          {/* Contact Information */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('contact')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={{ fontSize: 18 }}>📞</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Contact Info</Text>
              </View>
              <IconButton icon={expandedSections.contact ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.contact && (
              <View style={styles.cardContent}>
                <TextInput label="Phone Number *" value={formData.phone_no} onChangeText={(text) => updateField('phone_no', text.replace(/\D/g, '').slice(0, 10))} error={!!errors.phone_no} mode="outlined" keyboardType="phone-pad" maxLength={10} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.phone_no && <HelperText type="error">{errors.phone_no}</HelperText>}
                <TextInput label="Email *" value={formData.email} onChangeText={(text) => updateField('email', text)} error={!!errors.email} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.email && <HelperText type="error">{errors.email}</HelperText>}
                <TextInput label="STD/ISD Code" value={formData.std_isd_code} onChangeText={(text) => updateField('std_isd_code', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Fax" value={formData.fax} onChangeText={(text) => updateField('fax', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
              </View>
            )}
          </Surface>

          {/* Address Information */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('address')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Address Info</Text>
              </View>
              <IconButton icon={expandedSections.address ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.address && (
              <View style={styles.cardContent}>
                <TextInput label="Permanent Address *" value={formData.permanent_address} onChangeText={(text) => updateField('permanent_address', text)} error={!!errors.permanent_address} mode="outlined" multiline numberOfLines={3} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.permanent_address && <HelperText type="error">{errors.permanent_address}</HelperText>}
                <TextInput label="Mailing Address" value={formData.mailing_address} onChangeText={(text) => updateField('mailing_address', text)} mode="outlined" multiline numberOfLines={3} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="City *" value={formData.city} onChangeText={(text) => updateField('city', text)} error={!!errors.city} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.city && <HelperText type="error">{errors.city}</HelperText>}
                <TouchableOpacity style={[styles.modernSelect, errors.state && styles.errorBorder]} onPress={() => setModalVisible({ ...modalVisible, state: true })}>
                  <Text style={formData.state ? styles.selectText : styles.selectPlaceholder}>{formData.state || 'Select State *'}</Text>
                  <IconButton icon="chevron-down" size={20} style={styles.selectIcon} />
                </TouchableOpacity>
                {errors.state && <HelperText type="error">{errors.state}</HelperText>}
                <TextInput label="District" value={formData.district} onChangeText={(text) => updateField('district', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Pincode *" value={formData.pincode} onChangeText={(text) => updateField('pincode', text.replace(/\D/g, '').slice(0, 6))} error={!!errors.pincode} mode="outlined" keyboardType="number-pad" maxLength={6} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.pincode && <HelperText type="error">{errors.pincode}</HelperText>}
              </View>
            )}
          </Surface>

          {/* Tax & Legal */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('tax')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#FCE4EC' }]}>
                  <Text style={{ fontSize: 18 }}>📄</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Tax & Legal</Text>
              </View>
              <IconButton icon={expandedSections.tax ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.tax && (
              <View style={styles.cardContent}>
                <TextInput label="PAN Number" value={formData.pan_no} onChangeText={(text) => updateField('pan_no', text.toUpperCase().slice(0, 10))} error={!!errors.pan_no} mode="outlined" autoCapitalize="characters" maxLength={10} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.pan_no && <HelperText type="error">{errors.pan_no}</HelperText>}
                <TextInput label="Aadhar Number *" value={formData.aadhar_no} onChangeText={(text) => updateField('aadhar_no', text.replace(/\D/g, '').slice(0, 12))} error={!!errors.aadhar_no} mode="outlined" keyboardType="number-pad" maxLength={12} style={styles.modernInput} outlineStyle={styles.inputOutline} />
                {errors.aadhar_no && <HelperText type="error">{errors.aadhar_no}</HelperText>}
                <TextInput label="GSTIN" value={formData.gstin} onChangeText={(text) => updateField('gstin', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Income Tax Ward No" value={formData.income_tax_ward_no} onChangeText={(text) => updateField('income_tax_ward_no', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Dist No" value={formData.dist_no} onChangeText={(text) => updateField('dist_no', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
              </View>
            )}
          </Surface>

          {/* Nominee */}
          <Surface style={styles.modernCard} elevation={1}>
            <TouchableOpacity onPress={() => toggleSection('nominee')} style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: '#E0F2F1' }]}>
                  <Text style={{ fontSize: 18 }}>👥</Text>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>Nominee Info</Text>
              </View>
              <IconButton icon={expandedSections.nominee ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {expandedSections.nominee && (
              <View style={styles.cardContent}>
                <TextInput label="Nominee Name" value={formData.nominee_name} onChangeText={(text) => updateField('nominee_name', text)} mode="outlined" style={styles.modernInput} outlineStyle={styles.inputOutline} />
                <TextInput label="Nominee Address" value={formData.nominee_address} onChangeText={(text) => updateField('nominee_address', text)} mode="outlined" multiline numberOfLines={3} style={styles.modernInput} outlineStyle={styles.inputOutline} />
              </View>
            )}
          </Surface>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton} labelStyle={styles.cancelButtonLabel} disabled={loading.submit}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSubmit} loading={loading.submit} disabled={loading.submit} style={styles.submitButton} labelStyle={styles.submitButtonLabel}>
              Register
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Compact Modals */}
      <CompactPickerModal visible={modalVisible.project} onClose={() => setModalVisible({ ...modalVisible, project: false })} items={projects} onSelect={(project) => updateField('project_id', project.project_id)} title="Select Project" searchKey="project_name" />
      <CompactPickerModal visible={modalVisible.broker} onClose={() => setModalVisible({ ...modalVisible, broker: false })} items={brokers} onSelect={(broker) => updateField('broker_id', broker.broker_id)} title="Select Broker" searchKey="name" />
      <CompactPickerModal visible={modalVisible.state} onClose={() => setModalVisible({ ...modalVisible, state: false })} items={INDIAN_STATES} onSelect={(state) => updateField('state', state)} title="Select State" searchKey={null} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  form: { padding: 16, paddingBottom: 32 },
  modernHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerIconText: { fontSize: 32 },
  headerTitle: { fontWeight: '700', color: '#1A202C', marginBottom: 4 },
  headerSubtitle: { color: '#718096', textAlign: 'center' },
  modernCard: { marginBottom: 16, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingRight: 8 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontWeight: '600', color: '#2D3748' },
  cardContent: { padding: 16, paddingTop: 0 },
  modernInput: { marginBottom: 12, backgroundColor: '#FFFFFF' },
  inputOutline: { borderRadius: 12, borderWidth: 1.5 },
  modernSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#CBD5E0', borderRadius: 12, paddingLeft: 16, paddingRight: 4, marginBottom: 12, backgroundColor: '#FFFFFF', minHeight: 56 },
  errorBorder: { borderColor: '#F56565' },
  selectText: { flex: 1, fontSize: 16, color: '#2D3748' },
  selectPlaceholder: { flex: 1, fontSize: 16, color: '#A0AEC0' },
  selectIcon: { margin: 0 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0' },
  cancelButtonLabel: { paddingVertical: 8, fontSize: 16, fontWeight: '600' },
  submitButton: { flex: 1, borderRadius: 12, backgroundColor: '#667EEA' },
  submitButtonLabel: { paddingVertical: 8, fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400 },
  pickerSurface: { borderRadius: 20, maxHeight: height * 0.6, overflow: 'hidden' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pickerTitle: { fontWeight: '700', color: '#2D3748' },
  compactSearch: { margin: 12, borderRadius: 12, elevation: 0 },
  pickerList: { maxHeight: height * 0.4 },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#A0AEC0', fontSize: 14 },
});

export default AddCustomerScreen;
