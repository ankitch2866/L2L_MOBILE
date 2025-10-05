import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardHomeScreen from '../screens/dashboard/DashboardHomeScreen';
import { 
  ProfileScreen, 
  ResetPasswordScreen, 
  SettingsScreen, 
  AboutScreen 
} from '../screens/profile';
import {
  ProjectsListScreen,
  AddProjectScreen,
  EditProjectScreen,
  ProjectDetailsScreen,
} from '../screens/projects';
import {
  PropertiesListScreen,
  AddPropertyScreen,
  EditPropertyScreen,
  PropertyDetailsScreen,
} from '../screens/properties';
import {
  CustomersListScreen,
  AddCustomerScreen,
  EditCustomerScreen,
  CustomerDetailsScreen,
} from '../screens/customers';
import {
  CoApplicantsListScreen,
  AddCoApplicantScreen,
  EditCoApplicantScreen,
  CoApplicantDetailsScreen,
} from '../screens/masters/coApplicants';
import {
  BrokersListScreen,
  AddBrokerScreen,
  EditBrokerScreen,
  BrokerDetailsScreen,
} from '../screens/masters/brokers';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Projects Stack Navigator
const ProjectsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} options={{ title: 'Projects' }} />
      <Stack.Screen name="AddProject" component={AddProjectScreen} options={{ title: 'Add Project' }} />
      <Stack.Screen name="EditProject" component={EditProjectScreen} options={{ title: 'Edit Project' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Project Details' }} />
    </Stack.Navigator>
  );
};

// Properties Stack Navigator
const PropertiesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="PropertiesList" component={PropertiesListScreen} options={{ title: 'Properties' }} />
      <Stack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: 'Add Property' }} />
      <Stack.Screen name="EditProperty" component={EditPropertyScreen} options={{ title: 'Edit Property' }} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} options={{ title: 'Property Details' }} />
    </Stack.Navigator>
  );
};

// Customers Stack Navigator
const CustomersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="CustomersList" component={CustomersListScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
      <Stack.Screen name="EditCustomer" component={EditCustomerScreen} options={{ title: 'Edit Customer' }} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} options={{ title: 'Customer Details' }} />
    </Stack.Navigator>
  );
};

// Co-Applicants Stack Navigator
const CoApplicantsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="CoApplicantsList" component={CoApplicantsListScreen} options={{ title: 'Co-Applicants' }} />
      <Stack.Screen name="AddCoApplicant" component={AddCoApplicantScreen} options={{ title: 'Add Co-Applicant' }} />
      <Stack.Screen name="EditCoApplicant" component={EditCoApplicantScreen} options={{ title: 'Edit Co-Applicant' }} />
      <Stack.Screen name="CoApplicantDetails" component={CoApplicantDetailsScreen} options={{ title: 'Co-Applicant Details' }} />
    </Stack.Navigator>
  );
};

// Brokers Stack Navigator
const BrokersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="BrokersList" component={BrokersListScreen} options={{ title: 'Brokers' }} />
      <Stack.Screen name="AddBroker" component={AddBrokerScreen} options={{ title: 'Add Broker' }} />
      <Stack.Screen name="EditBroker" component={EditBrokerScreen} options={{ title: 'Edit Broker' }} />
      <Stack.Screen name="BrokerDetails" component={BrokerDetailsScreen} options={{ title: 'Broker Details' }} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Projects') {
            iconName = focused ? 'office-building' : 'office-building-outline';
          } else if (route.name === 'Properties') {
            iconName = focused ? 'home-city' : 'home-city-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardHomeScreen}
        options={{
          title: 'Dashboard',
          headerShown: true,
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsStack}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen 
        name="Properties" 
        component={PropertiesStack}
        options={{ title: 'Properties' }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersStack}
        options={{ title: 'Customers' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator with Tabs and Modal Screens
const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="CoApplicants" 
        component={CoApplicantsStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Brokers" 
        component={BrokersStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
