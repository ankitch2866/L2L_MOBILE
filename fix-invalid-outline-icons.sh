#!/bin/bash

echo "🔧 Fixing invalid outline icons..."

# Fix chart-bar-outline to chart-line
find src -name "*.js" -type f -exec sed -i '' 's/chart-bar-outline/chart-line/g' {} \;

# Fix database-outline to database (if it doesn't exist)
find src -name "*.js" -type f -exec sed -i '' 's/database-outline/database/g' {} \;

# Fix home-outline to home (if it doesn't exist)
find src -name "*.js" -type f -exec sed -i '' 's/home-outline/home/g' {} \;

# Fix account-outline to account (if it doesn't exist)
find src -name "*.js" -type f -exec sed -i '' 's/account-outline/account/g' {} \;

# Fix file-document-outline to file-document
find src -name "*.js" -type f -exec sed -i '' 's/file-document-outline/file-document/g' {} \;

# Fix email-outline to email
find src -name "*.js" -type f -exec sed -i '' 's/email-outline/email/g' {} \;

# Fix clock-outline to clock
find src -name "*.js" -type f -exec sed -i '' 's/clock-outline/clock/g' {} \;

# Fix calendar-check-outline to calendar-check
find src -name "*.js" -type f -exec sed -i '' 's/calendar-check-outline/calendar-check/g' {} \;

# Fix check-circle-outline to check-circle
find src -name "*.js" -type f -exec sed -i '' 's/check-circle-outline/check-circle/g' {} \;

# Fix card-account-details-outline to card-account-details
find src -name "*.js" -type f -exec sed -i '' 's/card-account-details-outline/card-account-details/g' {} \;

echo "✅ Fixed invalid outline icons!"
echo "📱 Icons should now load without warnings"
