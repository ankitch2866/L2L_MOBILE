import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon as PaperIcon } from 'react-native-paper';

// Collection Reports
import PaymentDashboardScreen from '../screens/reports/collection/PaymentDashboardScreen';
import DailyCollectionScreen from '../screens/reports/collection/DailyCollectionScreen';
import MonthlyCollectionScreen from '../screens/reports/collection/MonthlyCollectionScreen';
import TotalCollectionScreen from '../screens/reports/collection/TotalCollectionScreen';
import UnitWiseCollectionScreen from '../screens/reports/collection/UnitWiseCollectionScreen';
import CustomerWiseCollectionScreen from '../screens/reports/collection/CustomerWiseCollectionScreen';
import TransactionDetailsReportScreen from '../screens/reports/collection/TransactionDetailsReportScreen';

// Customer Reports
import CustomerDetailsReportScreen from '../screens/reports/customer/CustomerDetailsReportScreen';
import ProjectsByCustomerScreen from '../screens/reports/customer/ProjectsByCustomerScreen';
import StatementOfAccountScreen from '../screens/reports/customer/StatementOfAccountScreen';
import DemandLetterScreen from '../screens/reports/customer/DemandLetterScreen';
import ReminderLetterScreen from '../screens/reports/customer/ReminderLetterScreen';
import ProjectReportScreen from '../screens/reports/customer/ProjectReportScreen';
import CustomerProjectScreen from '../screens/reports/customer/CustomerProjectScreen';
import CustomerProjectDetailScreen from '../screens/reports/customer/CustomerProjectDetailScreen';
import CustomerProjectYearScreen from '../screens/reports/customer/CustomerProjectYearScreen';
import CustomerProjectYearDetailScreen from '../screens/reports/customer/CustomerProjectYearDetailScreen';
import CustomerDetailFromProjectScreen from '../screens/reports/customer/CustomerDetailFromProjectScreen';
import CustomerDetailFromYearScreen from '../screens/reports/customer/CustomerDetailFromYearScreen';

// Project Reports
import ProjectDashboardScreen from '../screens/reports/project/ProjectDashboardScreen';
import ProjectDetailsScreen from '../screens/reports/project/ProjectDetailsScreen';
import ProjectOverviewScreen from '../screens/reports/project/ProjectOverviewScreen';
import CustomerByProjectYearScreen from '../screens/reports/project/CustomerByProjectYearScreen';

// BBA Reports
import BBAAgreementReportScreen from '../screens/reports/bba/BBAAgreementReportScreen';
import BBAStatusReportScreen from '../screens/reports/bba/BBAStatusReportScreen';

// Dues Reports
import DueInstallmentsDashboardScreen from '../screens/reports/dues/DueInstallmentsDashboardScreen';

// Stock Reports
import StockDashboardScreen from '../screens/reports/stock/StockDashboardScreen';

// Unit Transfer Reports
import UnitTransferDashboardScreen from '../screens/reports/unitTransfer/UnitTransferDashboardScreen';

// Correspondence Reports
import CorrespondenceDashboardScreen from '../screens/reports/correspondence/CorrespondenceDashboardScreen';

// Calling Reports
import CallingFeedbackDashboardScreen from '../screens/reports/calling/CallingFeedbackDashboardScreen';

// Master Reports
import MasterReportScreen from '../screens/reports/master/MasterReportScreen';

// Outstanding Reports
import OutstandingReportScreen from '../screens/reports/outstanding/OutstandingReportScreen';

// Buy Back Reports
import BuyBackCancelCasesScreen from '../screens/reports/buyback/BuyBackCancelCasesScreen';
import ViewCallingHistoryScreen from '../screens/reports/calling/ViewCallingHistoryScreen';

const Stack = createNativeStackNavigator();

// Custom Back Button Component
const BackButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ marginLeft: 10, padding: 8 }}
  >
    <PaperIcon source="arrow-left" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

// Collection Reports Stack Navigator
const CollectionReportsStack = () => {
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
        name="PaymentDashboard" 
        component={PaymentDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Payment Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="DailyCollection" component={DailyCollectionScreen} options={{ title: 'Daily Collection' }} />
      <Stack.Screen name="MonthlyCollection" component={MonthlyCollectionScreen} options={{ title: 'Monthly Collection' }} />
      <Stack.Screen name="TotalCollection" component={TotalCollectionScreen} options={{ title: 'Total Collection' }} />
      <Stack.Screen name="UnitWiseCollection" component={UnitWiseCollectionScreen} options={{ title: 'Unit-Wise Collection' }} />
      <Stack.Screen name="CustomerWiseCollection" component={CustomerWiseCollectionScreen} options={{ title: 'Customer-Wise Collection' }} />
      <Stack.Screen name="TransactionDetailsReport" component={TransactionDetailsReportScreen} options={{ title: 'Transaction Details Report' }} />
    </Stack.Navigator>
  );
};

// Customer Reports Stack Navigator
const CustomerReportsStack = () => {
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
        name="CustomerDetailsReport" 
        component={CustomerDetailsReportScreen} 
        options={({ navigation }) => ({ 
          title: 'Customer Details Report',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="ProjectsByCustomer" component={ProjectsByCustomerScreen} options={{ title: 'Projects by Customer' }} />
      <Stack.Screen name="StatementOfAccount" component={StatementOfAccountScreen} options={{ title: 'Statement of Account' }} />
      <Stack.Screen name="DemandLetter" component={DemandLetterScreen} options={{ title: 'Demand Letter' }} />
      <Stack.Screen name="ReminderLetter" component={ReminderLetterScreen} options={{ title: 'Reminder Letter' }} />
      <Stack.Screen name="ProjectReport" component={ProjectReportScreen} options={{ title: 'Project Report' }} />
      <Stack.Screen 
        name="CustomerProject" 
        component={CustomerProjectScreen} 
        options={({ navigation }) => ({ 
          title: 'Customer Projects',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="CustomerProjectDetail" 
        component={CustomerProjectDetailScreen} 
        options={({ navigation }) => ({ 
          title: 'Project Customers',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="CustomerProjectYear" 
        component={CustomerProjectYearScreen} 
        options={({ navigation }) => ({ 
          title: 'Projects (Fin. Year)',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="CustomerProjectYearDetail" 
        component={CustomerProjectYearDetailScreen} 
        options={({ navigation }) => ({ 
          title: 'Financial Year Report',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="CustomerDetailFromProject" 
        component={CustomerDetailFromProjectScreen} 
        options={({ navigation }) => ({ 
          title: 'Customer Details',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="CustomerDetailFromYear" 
        component={CustomerDetailFromYearScreen} 
        options={({ navigation }) => ({ 
          title: 'Customer Financial Details',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Project Reports Stack Navigator
const ProjectReportsStack = () => {
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
        name="ProjectDashboard" 
        component={ProjectDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Project Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Project Details' }} />
      <Stack.Screen name="ProjectOverview" component={ProjectOverviewScreen} options={{ title: 'Project Overview' }} />
      <Stack.Screen name="CustomerByProjectYear" component={CustomerByProjectYearScreen} options={{ title: 'Customer by Project Year' }} />
    </Stack.Navigator>
  );
};

// BBA Reports Stack Navigator
const BBAReportsStack = () => {
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
        name="BBAAgreementReport" 
        component={BBAAgreementReportScreen} 
        options={({ navigation }) => ({ 
          title: 'BBA Agreement Report',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen 
        name="BBAStatusReport" 
        component={BBAStatusReportScreen} 
        options={({ navigation }) => ({ 
          title: 'BBA Status Report',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Dues Reports Stack Navigator
const DuesReportsStack = () => {
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
        name="DueInstallmentsDashboard" 
        component={DueInstallmentsDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Due Installments Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Stock Reports Stack Navigator
const StockReportsStack = () => {
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
        name="StockDashboard" 
        component={StockDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Stock Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Unit Transfer Reports Stack Navigator
const UnitTransferReportsStack = () => {
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
        name="UnitTransferDashboard" 
        component={UnitTransferDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Unit Transfer Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Correspondence Reports Stack Navigator
const CorrespondenceReportsStack = () => {
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
        name="CorrespondenceDashboard" 
        component={CorrespondenceDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Correspondence Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Calling Reports Stack Navigator
const CallingReportsStack = () => {
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
        name="CallingFeedbackDashboard" 
        component={CallingFeedbackDashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Calling Feedback Dashboard',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
      <Stack.Screen name="ViewCallingHistory" component={ViewCallingHistoryScreen} options={{ title: 'View Calling History' }} />
    </Stack.Navigator>
  );
};

// Master Reports Stack Navigator
const MasterReportsStack = () => {
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
        name="MasterReport" 
        component={MasterReportScreen} 
        options={({ navigation }) => ({ 
          title: 'Master Reports',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Outstanding Reports Stack Navigator
const OutstandingReportsStack = () => {
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
        name="OutstandingReport" 
        component={OutstandingReportScreen} 
        options={({ navigation }) => ({ 
          title: 'Outstanding Report',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

// Buy Back Reports Stack Navigator
const BuyBackReportsStack = () => {
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
        name="BuyBackCancelCases" 
        component={BuyBackCancelCasesScreen} 
        options={({ navigation }) => ({ 
          title: 'Buy Back/Cancel Cases',
          headerLeft: () => <BackButton navigation={navigation} />
        })} 
      />
    </Stack.Navigator>
  );
};

export {
  CollectionReportsStack,
  CustomerReportsStack,
  ProjectReportsStack,
  BBAReportsStack,
  DuesReportsStack,
  StockReportsStack,
  UnitTransferReportsStack,
  CorrespondenceReportsStack,
  CallingReportsStack,
  MasterReportsStack,
  OutstandingReportsStack,
  BuyBackReportsStack,
};
