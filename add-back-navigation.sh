#!/bin/bash

echo "🔧 Adding back navigation to all screens..."

# List of screens that should have back navigation (excluding main dashboard screens)
screens=(
  "src/screens/transactions/bookings/BookingDetailsScreen.js"
  "src/screens/transactions/bookings/CreateBookingScreen.js"
  "src/screens/transactions/bookings/EditBookingScreen.js"
  "src/screens/transactions/bookings/BookingStatusScreen.js"
  "src/screens/transactions/allotments/AllotmentDetailsScreen.js"
  "src/screens/transactions/allotments/EditAllotmentScreen.js"
  "src/screens/transactions/allotments/AllotmentLetterScreen.js"
  "src/screens/transactions/payments/PaymentDetailsScreen.js"
  "src/screens/transactions/payments/EditPaymentScreen.js"
  "src/screens/transactions/payments/PaymentEntryScreen.js"
  "src/screens/transactions/payments/CreditPaymentScreen.js"
  "src/screens/transactions/cheques/ChequeDepositScreen.js"
  "src/screens/transactions/cheques/ChequeFeedbackScreen.js"
  "src/screens/transactions/paymentQueries/EditPaymentQueryScreen.js"
  "src/screens/transactions/paymentQueries/GeneratePaymentQueryScreen.js"
  "src/screens/transactions/paymentQueries/PaymentQueryDetailsScreen.js"
  "src/screens/transactions/paymentRaises/CreatePaymentRaiseScreen.js"
  "src/screens/transactions/paymentRaises/EditPaymentRaiseScreen.js"
  "src/screens/transactions/paymentRaises/PaymentRaiseDetailsScreen.js"
  "src/screens/transactions/unitTransfers/CreateUnitTransferScreen.js"
  "src/screens/transactions/unitTransfers/EditUnitTransferScreen.js"
  "src/screens/transactions/unitTransfers/TransferTransactionScreen.js"
  "src/screens/transactions/unitTransfers/UnitTransferDetailsScreen.js"
  "src/screens/transactions/dispatches/CreateDispatchScreen.js"
  "src/screens/transactions/dispatches/EditDispatchScreen.js"
  "src/screens/transactions/dispatches/DispatchDetailsScreen.js"
  "src/screens/transactions/dispatches/DispatchItemsScreen.js"
  "src/screens/transactions/bba/AddBBAScreen.js"
  "src/screens/transactions/bba/EditBBAScreen.js"
  "src/screens/transactions/bba/BBAStatusScreen.js"
  "src/screens/transactions/bba/VerifyBBAScreen.js"
  "src/screens/masters/banks/AddBankScreen.js"
  "src/screens/masters/banks/EditBankScreen.js"
  "src/screens/masters/stock/AddStockScreen.js"
  "src/screens/masters/stock/EditStockScreen.js"
  "src/screens/masters/projectSizes/AddProjectSizeScreen.js"
  "src/screens/masters/projectSizes/EditProjectSizeScreen.js"
  "src/screens/masters/installments/AddInstallmentScreen.js"
  "src/screens/masters/installments/EditInstallmentScreen.js"
  "src/screens/masters/installments/InstallmentDetailsScreen.js"
  "src/screens/masters/plc/AddPLCScreen.js"
  "src/screens/masters/plc/EditPLCScreen.js"
  "src/screens/masters/plc/PLCDetailsScreen.js"
  "src/screens/masters/brokers/AddBrokerScreen.js"
  "src/screens/masters/brokers/EditBrokerScreen.js"
  "src/screens/masters/coApplicants/AddCoApplicantScreen.js"
  "src/screens/masters/coApplicants/EditCoApplicantScreen.js"
  "src/screens/properties/AddPropertyScreen.js"
  "src/screens/properties/EditPropertyScreen.js"
  "src/screens/properties/PropertyDetailsScreen.js"
  "src/screens/projects/AddProjectScreen.js"
  "src/screens/projects/EditProjectScreen.js"
  "src/screens/projects/ProjectDetailsScreen.js"
  "src/screens/customers/AddCustomerScreen.js"
  "src/screens/customers/EditCustomerScreen.js"
  "src/screens/customers/CustomerDetailsScreen.js"
  "src/screens/profile/ResetPasswordScreen.js"
)

for screen in "${screens[@]}"; do
  if [ -f "$screen" ]; then
    echo "🔨 Adding back navigation to $screen..."

    # Check if useFocusEffect is already imported
    if ! grep -q "useFocusEffect" "$screen"; then
      # Add useFocusEffect import
      sed -i '' 's/import { useFocusEffect } from '\''@react-navigation\/native'\'';/import { useFocusEffect } from '\''@react-navigation\/native'\'';/g' "$screen"
      if ! grep -q "useFocusEffect" "$screen"; then
        # Add import if not exists
        sed -i '' 's/import React.*$/import React, { useEffect, useState } from '\''react'\'';/g' "$screen"
        sed -i '' 's/import { useFocusEffect } from '\''@react-navigation\/native'\'';//g' "$screen"
        sed -i '' 's/import React, { useEffect, useState } from '\''react'\'';/import React, { useEffect, useState } from '\''react'\'';\nimport { useFocusEffect } from '\''@react-navigation\/native'\'';/g' "$screen"
      fi
    fi

    # Check if back navigation already exists
    if ! grep -q "headerLeft" "$screen"; then
      # Add back navigation after useEffect hooks
      sed -i '' '/useEffect(() => {/,/}, \[.*\]);/a\
\
  // Set navigation options with back button\
  useFocusEffect(\
    React.useCallback(() => {\
      navigation.setOptions({\
        headerLeft: () => (\
          <Button\
            mode="text"\
            onPress={() => navigation.goBack()}\
            style={{ marginLeft: -8 }}\
            textColor="#007AFF"\
          >\
            Back\
          </Button>\
        ),\
      });\
    }, [navigation])\
  );\
' "$screen"
    fi

    echo "✅ Added back navigation to $screen"
  else
    echo "⚠️  Screen not found: $screen"
  fi
done

echo "🎉 Back navigation added to all screens!"
echo "📱 All screens now have proper back navigation"
