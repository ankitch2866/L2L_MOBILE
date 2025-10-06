#!/bin/bash

echo "🔧 Fixing all module icons to use react-native-paper..."

# List of files to fix (excluding the common Icon.js file)
files=(
  "src/components/transactions/ChequeCard.js"
  "src/components/transactions/PaymentCard.js"
  "src/components/transactions/AllotmentCard.js"
  "src/screens/transactions/allotments/AllotmentLetterScreen.js"
  "src/screens/transactions/allotments/AllotmentDetailsScreen.js"
  "src/components/transactions/BookingCard.js"
  "src/components/common/Dropdown.js"
  "src/screens/projects/ProjectDetailsScreen.js"
  "src/screens/customers/CustomerDetailsScreen.js"
  "src/components/customers/CustomerCard.js"
  "src/screens/properties/PropertiesListScreen.js"
  "src/screens/properties/AddPropertyScreen.js"
  "src/screens/projects/AddProjectScreen.js"
  "src/screens/projects/EditProjectScreen.js"
  "src/components/common/EmptyState.js"
  "src/screens/properties/PropertyDetailsScreen.js"
  "src/components/properties/PropertyCard.js"
  "src/components/projects/ProjectCard.js"
  "src/screens/profile/AboutScreen.js"
  "src/components/BreadcrumbNavigation.js"
  "src/components/ActivityItem.js"
  "src/components/QuickActionButton.js"
  "src/components/StatCard.js"
  "src/components/EmptyState.js"
  "src/components/Toast.js"
  "src/components/ErrorBoundary.js"
)

echo "📝 Files to fix: ${#files[@]}"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "🔨 Fixing $file..."
    
    # Replace import statement
    sed -i '' 's/import Icon from '\''react-native-vector-icons\/MaterialCommunityIcons'\'';/import { Icon as PaperIcon } from '\''react-native-paper'\'';/g' "$file"
    
    # Replace Icon usage with PaperIcon and name with source
    sed -i '' 's/<Icon name=\([^>]*\)/<PaperIcon source=\1/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 All module icons fixed!"
echo "📱 Icons should now load properly on Android devices"
