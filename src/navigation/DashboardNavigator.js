import React from 'react';
import { TouchableOpacity } from 'react-native';
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
import {
  PaymentPlansListScreen,
  AddPaymentPlanScreen,
  PaymentPlanDetailsScreen,
} from '../screens/masters/paymentPlans';
import {
  InstallmentsListScreen,
  AddInstallmentScreen,
  InstallmentDetailsScreen,
  EditInstallmentScreen,
} from '../screens/masters/installments';
import {
  PLCListScreen,
  AddPLCScreen,
  PLCDetailsScreen,
  EditPLCScreen,
} from '../screens/masters/plc';
import {
  BanksListScreen,
  AddBankScreen,
  BankDetailsScreen,
  EditBankScreen,
} from '../screens/masters/banks';
import {
  StockListScreen,
  AddStockScreen,
  StockDetailsScreen,
  EditStockScreen,
} from '../screens/masters/stock';
import {
  ProjectSizesListScreen,
  AddProjectSizeScreen,
  EditProjectSizeScreen,
} from '../screens/masters/projectSizes';
import {
  MastersScreen,
  TransactionsScreen,
  ReportsScreen,
  UtilitiesScreen,
} from '../screens/categories';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Back Button Component
const BackButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ marginLeft: 10, padding: 8 }}
  >
    <Icon name="arrow-left" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

// Projects Stack Navigator
const ProjectsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="ProjectsList" 
        component={ProjectsListScreen} 
        options={({ navigation }) => ({ 
          title: 'Projects',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="PropertiesList" 
        component={PropertiesListScreen} 
        options={({ navigation }) => ({ 
          title: 'Properties',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CustomersList" 
        component={CustomersListScreen} 
        options={({ navigation }) => ({ 
          title: 'Customers',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CoApplicantsList" 
        component={CoApplicantsListScreen} 
        options={({ navigation }) => ({ 
          title: 'Co-Applicants',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="BrokersList" 
        component={BrokersListScreen} 
        options={({ navigation }) => ({ 
          title: 'Brokers',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddBroker" component={AddBrokerScreen} options={{ title: 'Add Broker' }} />
      <Stack.Screen name="EditBroker" component={EditBrokerScreen} options={{ title: 'Edit Broker' }} />
      <Stack.Screen name="BrokerDetails" component={BrokerDetailsScreen} options={{ title: 'Broker Details' }} />
    </Stack.Navigator>
  );
};

// Payment Plans Stack Navigator
const PaymentPlansStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="PaymentPlansList" 
        component={PaymentPlansListScreen} 
        options={({ navigation }) => ({ 
          title: 'Payment Plans',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddPaymentPlan" component={AddPaymentPlanScreen} options={{ title: 'Add Payment Plan' }} />
      <Stack.Screen name="PaymentPlanDetails" component={PaymentPlanDetailsScreen} options={{ title: 'Payment Plan Details' }} />
      <Stack.Screen name="InstallmentsList" component={InstallmentsListScreen} options={{ title: 'Installments' }} />
      <Stack.Screen name="AddInstallment" component={AddInstallmentScreen} options={{ title: 'Add Installment' }} />
      <Stack.Screen name="InstallmentDetails" component={InstallmentDetailsScreen} options={{ title: 'Installment Details' }} />
      <Stack.Screen name="EditInstallment" component={EditInstallmentScreen} options={{ title: 'Edit Installment' }} />
    </Stack.Navigator>
  );
};

// PLC Stack Navigator
const PLCStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="PLCList" 
        component={PLCListScreen} 
        options={({ navigation }) => ({ 
          title: 'PLC',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddPLC" component={AddPLCScreen} options={{ title: 'Add PLC' }} />
      <Stack.Screen name="PLCDetails" component={PLCDetailsScreen} options={{ title: 'PLC Details' }} />
      <Stack.Screen name="EditPLC" component={EditPLCScreen} options={{ title: 'Edit PLC' }} />
    </Stack.Navigator>
  );
};

// Banks Stack Navigator
const BanksStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="BanksList" 
        component={BanksListScreen} 
        options={({ navigation }) => ({ 
          title: 'Banks',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddBank" component={AddBankScreen} options={{ title: 'Add Bank' }} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} options={{ title: 'Bank Details' }} />
      <Stack.Screen name="EditBank" component={EditBankScreen} options={{ title: 'Edit Bank' }} />
    </Stack.Navigator>
  );
};

// Stock Stack Navigator
const StockStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="StockList" 
        component={StockListScreen} 
        options={({ navigation }) => ({ 
          title: 'Stock',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddStock" component={AddStockScreen} options={{ title: 'Add Stock' }} />
      <Stack.Screen name="StockDetails" component={StockDetailsScreen} options={{ title: 'Stock Details' }} />
      <Stack.Screen name="EditStock" component={EditStockScreen} options={{ title: 'Edit Stock' }} />
    </Stack.Navigator>
  );
};

// Project Sizes Stack Navigator
const ProjectSizesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#EF4444' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="ProjectSizesList" 
        component={ProjectSizesListScreen} 
        options={({ navigation }) => ({ 
          title: 'Project Sizes',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="AddProjectSize" component={AddProjectSizeScreen} options={{ title: 'Add Project Size' }} />
      <Stack.Screen name="EditProjectSize" component={EditProjectSizeScreen} options={{ title: 'Edit Project Size' }} />
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
        headerBackTitleVisible: false,
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
          } else if (route.name === 'Masters') {
            iconName = focused ? 'database' : 'database-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'chart-bar' : 'chart-bar-outline';
          } else if (route.name === 'Utilities') {
            iconName = focused ? 'tools' : 'tools';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 8 },
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
        name="Masters" 
        component={MastersScreen}
        options={{
          title: 'Masters',
          headerShown: true,
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          headerShown: true,
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports',
          headerShown: true,
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen 
        name="Utilities" 
        component={UtilitiesScreen}
        options={{
          title: 'Utilities',
          headerShown: true,
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
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
      <Stack.Screen 
        name="PaymentPlans" 
        component={PaymentPlansStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="PLC" 
        component={PLCStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Banks" 
        component={BanksStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Stock" 
        component={StockStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="ProjectSizes" 
        component={ProjectSizesStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="ProjectsStack" 
        component={ProjectsStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="PropertiesStack" 
        component={PropertiesStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="CustomersStack" 
        component={CustomersStack}
        options={{ 
          presentation: 'card',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
