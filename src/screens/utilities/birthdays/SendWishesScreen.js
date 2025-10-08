import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, HelperText, Text, Card, Title, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import api from '../../../config/api';

const SendWishesScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { person } = route.params;
  
  const [formData, setFormData] = useState({
    senderName: 'Land 2 Lavish Team',
    senderEmail: 'skr841442@gmail.com',
    recipientEmail: person?.email || '',
    recipientName: person?.name || '',
    subject: `🎉 Happy Birthday ${person?.name}! 🎉`,
    message: `Dear ${person?.name},

Warmest birthday greetings from all of us at Land2Lavish! 

On your special day, we want to take a moment to appreciate your dedication and the positive energy you bring to our team. May this year bring you:
✨ Joy that sparkles like diamonds
✨ Success that grows like our premium properties
✨ Health as solid as our constructions
✨ Happiness as expansive as our land holdings

Enjoy your day to the fullest! We've arranged a small celebration in the office to honor you.

With warm regards,
Land2Lavish Team`,
    cc: '',
    bcc: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 10, padding: 8, marginTop: -12 }}
          >
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    }, [navigation])
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Sender name is required';
    }

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Sender email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Sender email is invalid';
    }

    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = 'Recipient email is invalid';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSendWishes = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/send-birthday-wishes', formData);
      
      if (response.data?.success) {
        Alert.alert('Success', 'Birthday wishes sent successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.data?.message || 'Failed to send birthday wishes');
      }
    } catch (error) {
      console.error('Error sending birthday wishes:', error);
      Alert.alert('Error', error.message || 'Failed to send birthday wishes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.title, { color: theme.colors.onSurface }]}>
              Send Birthday Wishes
            </Title>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Send birthday wishes to {person?.name}
            </Text>
            
            <TextInput
              label="Sender Name *"
              value={formData.senderName}
              onChangeText={(value) => handleInputChange('senderName', value)}
              error={!!errors.senderName}
              style={styles.input}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.senderName}>
              {errors.senderName}
            </HelperText>

            <TextInput
              label="Sender Email *"
              value={formData.senderEmail}
              onChangeText={(value) => handleInputChange('senderEmail', value)}
              error={!!errors.senderEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <HelperText type="error" visible={!!errors.senderEmail}>
              {errors.senderEmail}
            </HelperText>

            <TextInput
              label="Recipient Name *"
              value={formData.recipientName}
              onChangeText={(value) => handleInputChange('recipientName', value)}
              error={!!errors.recipientName}
              style={styles.input}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.recipientName}>
              {errors.recipientName}
            </HelperText>

            <TextInput
              label="Recipient Email *"
              value={formData.recipientEmail}
              onChangeText={(value) => handleInputChange('recipientEmail', value)}
              error={!!errors.recipientEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <HelperText type="error" visible={!!errors.recipientEmail}>
              {errors.recipientEmail}
            </HelperText>

            <TextInput
              label="Subject *"
              value={formData.subject}
              onChangeText={(value) => handleInputChange('subject', value)}
              error={!!errors.subject}
              style={styles.input}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.subject}>
              {errors.subject}
            </HelperText>

            <TextInput
              label="Message *"
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              error={!!errors.message}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={8}
            />
            <HelperText type="error" visible={!!errors.message}>
              {errors.message}
            </HelperText>

            <TextInput
              label="CC (Optional)"
              value={formData.cc}
              onChangeText={(value) => handleInputChange('cc', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="BCC (Optional)"
              value={formData.bcc}
              onChangeText={(value) => handleInputChange('bcc', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSendWishes}
                style={styles.button}
                loading={loading}
                disabled={loading}
                icon="send"
              >
                Send Wishes
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  button: {
    flex: 1,
  },
});

export default SendWishesScreen;
