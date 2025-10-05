import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Provider as PaperProvider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { lightTheme } from '../../config/theme';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async () => {
    if (!formData.userId || !formData.password) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // Navigation will be handled by the navigation container
    } catch (err) {
      // Error is handled by Redux
      console.error('Login error:', err);
    }
  };

  return (
    <PaperProvider theme={lightTheme}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>L2L EPR</Text>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.helloText}>Hello!</Text>
          <Text style={styles.greetingText}>
            {greeting.split(' ')[0]}{' '}
            <Text style={styles.greetingTime}>{greeting.split(' ')[1]}</Text>
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.titleText}>
            <Text style={styles.titleRed}>Login </Text>
            <Text style={styles.titleBlack}>to Your Account</Text>
          </Text>

          {/* Error Message */}
          {error && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          {/* User ID Input */}
          <TextInput
            label="User ID"
            value={formData.userId}
            onChangeText={(text) =>
              setFormData({ ...formData, userId: text })
            }
            mode="outlined"
            style={styles.input}
            disabled={loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Input */}
          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            disabled={loading || !formData.userId || !formData.password}
            loading={loading}
          >
            {loading ? 'Signing in...' : 'SUBMIT'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    color: '#272727',
    fontWeight: '600',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 8,
  },
  greetingContainer: {
    marginBottom: 32,
  },
  helloText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#EF4444',
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  greetingTime: {
    color: '#000000',
  },
  formContainer: {
    width: '100%',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  titleRed: {
    color: '#EF4444',
  },
  titleBlack: {
    color: '#333333',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#1F2937',
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
});

export default LoginScreen;
