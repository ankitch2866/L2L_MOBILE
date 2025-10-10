import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { checkAuth } from '../store/slices/authSlice';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardNavigator from './DashboardNavigator';
import Chatbot from '../components/chatbot/Chatbot';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    // Check if user is already logged in
    dispatch(checkAuth()).finally(() => {
      setIsChecking(false);
    });
  }, [dispatch]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardNavigator} />
        )}
      </Stack.Navigator>
      <Chatbot />
    </NavigationContainer>
  );
};

export default AppNavigator;
