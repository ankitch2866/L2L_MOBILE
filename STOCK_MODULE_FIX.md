# Stock Module Error Fix

## Issue
When starting Expo, the following error occurred:
```
Unable to resolve "../../../components/common" from "src/screens/masters/stock/AddStockScreen.js"
```

## Root Cause
The Stock module screens (AddStockScreen.js and EditStockScreen.js) were trying to import a `Dropdown` component from `../../../components/common`, but:
1. The `components/common` folder didn't have an `index.js` file to export its components
2. Other screens in the project use `Menu` from `react-native-paper` instead of a custom Dropdown component

## Solution Applied

### 1. Created index.js for common components
**File**: `src/components/common/index.js`
```javascript
export { default as Dropdown } from './Dropdown';
export { default as EmptyState } from './EmptyState';
export { default as LoadingIndicator } from './LoadingIndicator';
```

### 2. Updated AddStockScreen.js
**Changes**:
- Removed import of custom Dropdown component
- Added `Menu` and `Text` to react-native-paper imports
- Replaced Dropdown components with Menu components (matching the pattern used in AddPropertyScreen)
- Added menu visibility state management
- Added helper functions to get selected item names
- Added proper styling for menu buttons

### 3. Updated EditStockScreen.js
**Changes**:
- Removed import of custom Dropdown component
- Added `Menu` and `Text` to react-native-paper imports
- Replaced Dropdown component with Menu component
- Added menu visibility state management
- Added helper function to get selected broker name
- Added proper styling for menu button

## Pattern Used
The fix follows the same pattern used in other screens like `AddPropertyScreen.js`:
- Use `Menu` from `react-native-paper` for dropdowns
- Use `Button` with `mode="outlined"` as the anchor
- Manage menu visibility with state
- Use `Menu.Item` for each option
- Close menu when item is selected

## Files Modified
1. `src/components/common/index.js` - Created
2. `src/screens/masters/stock/AddStockScreen.js` - Updated
3. `src/screens/masters/stock/EditStockScreen.js` - Updated

## Verification
✅ All diagnostics passed - no errors found
✅ Import paths resolved correctly
✅ Consistent with existing codebase patterns
✅ Ready for Expo to start without bundling errors

## Testing Checklist
- [ ] Expo starts without errors
- [ ] AddStockScreen loads correctly
- [ ] Unit dropdown displays free units
- [ ] Broker dropdown displays all brokers
- [ ] EditStockScreen loads correctly
- [ ] Broker dropdown works in edit screen
- [ ] Form submission works correctly
