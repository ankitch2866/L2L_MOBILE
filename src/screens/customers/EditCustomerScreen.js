import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context';
import { LoadingIndicator } from '../../components';
import { fetchCustomerById, updateCustomer, clearCurrentCustomer } from '../../store/slices/customersSlice';

const EditCustomerScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { currentCustomer, loading } = useSelector(state => state.customers);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
    return () => dispatch(clearCurrentCustomer());
  }, [dispatch, customerId]);

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        customer_name: currentCustomer.customer_name || '',
        mobile_number: currentCustomer.mobile_number || '',
        email: currentCustomer.email || '',
        address: currentCustomer.address || '',
      });
    }
  }, [currentCustomer]);

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required';
    if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile_number)) newErrors.mobile_number = 'Invalid mobile number';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      await dispatch(updateCustomer({ id: customerId, data: formData })).unwrap();
      navigation.goBack();
    } catch (error) {
      setErrors({ form: error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <TextInput
            label="Customer Name *"
            value={formData.customer_name}
            onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
            error={!!errors.customer_name}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.customer_name}>
            {errors.customer_name}
          </HelperText>

          <TextInput
            label="Mobile Number *"
            value={formData.mobile_number}
            onChangeText={(text) => setFormData({ ...formData, mobile_number: text })}
            error={!!errors.mobile_number}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.mobile_number}>
            {errors.mobile_number}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={!!errors.email}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.buttons}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Update
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: { padding: 16 },
  input: { marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default EditCustomerScreen;
