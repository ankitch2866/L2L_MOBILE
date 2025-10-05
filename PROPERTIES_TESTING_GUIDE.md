# Properties Module - Testing Guide

## 🧪 Quick Test Scenarios

### ✅ Scenario 1: Filter by Project (No Freeze)

**Steps**:
1. Open app and navigate to Properties tab
2. Wait for properties to load
3. Tap the "All Projects" filter button
4. Select any project from the dropdown
5. **Expected**: Menu closes, list filters to that project
6. Tap filter button again
7. Select a different project
8. **Expected**: Menu closes, list switches smoothly (NO FREEZE)
9. Tap filter button again
10. Select "All Projects"
11. **Expected**: Filter clears, all properties show

**What to Check**:
- ✅ Menu closes after each selection
- ✅ No freeze or lag
- ✅ Can switch between projects multiple times
- ✅ "All Projects" option is at the top
- ✅ Button text changes between "All Projects" and "Filtered"

---

### ✅ Scenario 2: Add Property - Full Flow

**Steps**:
1. Navigate to Properties tab
2. Tap the "+" FAB button (bottom right)
3. **Section 1: Project Selection**
   - Tap "Select Project" dropdown
   - Choose a project (e.g., "Sunrise Apartments")
   - **Expected**: Project selected, "Select Unit Size" appears
   - Wait for sizes to load
   - Tap "Select Unit Size" dropdown
   - Choose a size (e.g., "1200 sq ft")
   - **Expected**: Size selected

4. **Section 2: Unit Details**
   - Enter "5" in "Number of Units to Add"
   - Tap "Unit Type" dropdown
   - Select "Medium"
   - Enter "5000000" in BSP field

5. **Section 3: Additional Information**
   - Tap "Unit Description" dropdown
   - Select "2BHK Flat"

6. Tap "Add 5 Units" button
7. **Expected**: 
   - Success alert: "5 units added successfully!"
   - Navigates back to list
   - List refreshes automatically
   - New units visible in the list

**What to Check**:
- ✅ All 3 sections visible
- ✅ Section headers with icons
- ✅ Dividers between sections
- ✅ Project sizes load after selecting project
- ✅ All dropdowns work smoothly
- ✅ Button text shows count: "Add 5 Units"
- ✅ Success alert appears
- ✅ List refreshes automatically

---

### ✅ Scenario 3: Form Validation

**Steps**:
1. Open Add Property screen
2. Tap "Add 1 Unit" without filling anything
3. **Expected**: Validation errors for all required fields
4. Fill only project
5. Tap submit
6. **Expected**: Errors for remaining fields
7. Enter "0" in "Number of Units"
8. **Expected**: Error "Must be greater than 0"
9. Enter "1000" in "Number of Units"
10. **Expected**: Error "Maximum 999 units at once"
11. Enter "-100" in BSP
12. **Expected**: Error "Must be zero or positive value"
13. Fill all fields correctly
14. Tap submit
15. **Expected**: Success!

**What to Check**:
- ✅ All required fields validated
- ✅ Number validation works
- ✅ Range validation works (1-999)
- ✅ Positive number validation works
- ✅ Error messages clear and helpful
- ✅ Errors disappear when user starts typing

---

### ✅ Scenario 4: Dynamic Project Sizes

**Steps**:
1. Open Add Property screen
2. Select "Project A"
3. **Expected**: Sizes for Project A load
4. Note the available sizes
5. Go back
6. Open Add Property again
7. Select "Project B"
8. **Expected**: Different sizes for Project B load
9. Sizes should be different from Project A

**What to Check**:
- ✅ Sizes load dynamically per project
- ✅ Shows "Loading sizes..." while fetching
- ✅ Different projects have different sizes
- ✅ If no sizes, shows "No sizes available"

---

### ✅ Scenario 5: Multiple Units Creation

**Steps**:
1. Open Add Property screen
2. Fill all fields
3. Enter "10" in "Number of Units"
4. **Expected**: Button shows "Add 10 Units"
5. Submit form
6. **Expected**: Success alert "10 units added successfully!"
7. Go to properties list
8. Filter by the project you selected
9. **Expected**: 10 new units visible

**What to Check**:
- ✅ Can add multiple units at once
- ✅ Button text updates dynamically
- ✅ Success message shows correct count
- ✅ All units appear in the list
- ✅ Units have correct properties

---

### ✅ Scenario 6: Unit Description Options

**Steps**:
1. Open Add Property screen
2. Scroll to "Additional Information" section
3. Tap "Unit Description" dropdown
4. **Expected**: See all 16 options:
   - 2BHK Flat
   - 3BHK Apartment
   - 4BHK Penthouse
   - Villa
   - Row House
   - Duplex
   - Studio
   - Shop Complex
   - Office
   - Co-working Space
   - Warehouse
   - Farmhouse
   - Resort
   - Service Apartment
   - Showroom
   - Other

**What to Check**:
- ✅ All 16 options visible
- ✅ Dropdown scrollable
- ✅ Can select any option
- ✅ Selected option displays correctly

---

### ✅ Scenario 7: Cancel and Back Navigation

**Steps**:
1. Open Add Property screen
2. Fill some fields
3. Tap "Cancel" button
4. **Expected**: Navigates back without saving
5. Open Add Property again
6. Fill some fields
7. Tap device back button
8. **Expected**: Navigates back without saving
9. Open properties list
10. **Expected**: No new units added

**What to Check**:
- ✅ Cancel button works
- ✅ Back button works
- ✅ No data saved when canceling
- ✅ Form doesn't crash

---

### ✅ Scenario 8: Filter + Search Combination

**Steps**:
1. Open Properties tab
2. Tap filter button
3. Select a specific project
4. **Expected**: List filters to that project
5. Type in search bar (e.g., "A-101")
6. **Expected**: Further filters within selected project
7. Clear search
8. **Expected**: Shows all units from selected project
9. Tap filter button
10. Select "All Projects"
11. **Expected**: Shows all properties again

**What to Check**:
- ✅ Filter and search work together
- ✅ Search filters within filtered project
- ✅ Clearing search shows filtered project
- ✅ Clearing filter shows all properties

---

## 🎯 Success Checklist

After testing all scenarios, verify:

### PropertiesListScreen
- [ ] Filter button doesn't freeze
- [ ] Can switch between projects smoothly
- [ ] "All Projects" option available
- [ ] Menu closes after selection
- [ ] Filter + search work together
- [ ] Pull-to-refresh works
- [ ] Auto-refresh on focus works

### AddPropertyScreen
- [ ] All 3 sections visible
- [ ] Section headers with icons
- [ ] Dividers between sections
- [ ] Project dropdown works
- [ ] Project sizes load dynamically
- [ ] Unit type dropdown works
- [ ] Unit description dropdown (16 options)
- [ ] Number of units field works (1-999)
- [ ] BSP field works
- [ ] All validation works
- [ ] Button text updates dynamically
- [ ] Success alert appears
- [ ] List refreshes after adding
- [ ] Cancel button works
- [ ] Can add multiple units

---

## 🐛 Known Issues (None!)

All reported bugs have been fixed:
- ✅ Filter freeze - FIXED
- ✅ Missing "All Projects" option - FIXED
- ✅ Form not matching web version - FIXED

---

## 📱 Test on Different Devices

Test on:
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iOS device
- [ ] Physical Android device
- [ ] Different screen sizes

---

## 🎉 Expected Results

After all tests:
- ✅ No crashes
- ✅ No freezes
- ✅ All features work smoothly
- ✅ Matches web version functionality
- ✅ Professional user experience
- ✅ Clear error messages
- ✅ Good performance

---

**Happy Testing!** 🚀
