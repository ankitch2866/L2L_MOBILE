# Testing Guide - Properties Module

## Quick Test Scenarios

### Scenario 1: View Properties List
**Steps**:
1. Open the app
2. Navigate to Properties tab
3. Wait for data to load

**Expected Result**:
- ✅ Loading indicator appears
- ✅ Properties load grouped by project
- ✅ Each project shows as a section with header
- ✅ Project name displayed with icon
- ✅ Count of properties shown (e.g., "5 properties available")
- ✅ Property cards display with all details
- ✅ Status badges show correct colors

**What to Check**:
- No blank screen
- No error messages
- All projects visible
- All units visible under correct project

---

### Scenario 2: Search Properties
**Steps**:
1. Open Properties list
2. Tap search bar
3. Type project name (e.g., "Sunrise")
4. Observe results

**Expected Result**:
- ✅ Results filter in real-time
- ✅ Only matching projects/units shown
- ✅ Search works for project name
- ✅ Search works for unit name
- ✅ Search works for unit type

**Test Cases**:
- Search by project name: "Sunrise"
- Search by unit name: "A-101"
- Search by unit type: "2BHK"
- Search with no results: "XYZ123"

---

### Scenario 3: Filter by Project
**Steps**:
1. Open Properties list
2. Tap "All Projects" button
3. Select a specific project from dropdown
4. Observe filtered results

**Expected Result**:
- ✅ Dropdown shows all projects
- ✅ Selecting project filters the list
- ✅ Only selected project's units shown
- ✅ Button text changes to "Filtered"
- ✅ Can select "All Projects" to clear filter

---

### Scenario 4: View Property Details
**Steps**:
1. Open Properties list
2. Tap "View" button on any property card
3. Observe navigation

**Expected Result**:
- ✅ Navigates to Property Details screen
- ✅ Shows full property information
- ✅ No errors

---

### Scenario 5: Edit Property
**Steps**:
1. Open Properties list
2. Tap "Edit" button on any property card
3. Observe navigation

**Expected Result**:
- ✅ Navigates to Edit Property screen
- ✅ Form loads with current data
- ✅ No errors

---

### Scenario 6: Add New Property
**Steps**:
1. Open Properties list
2. Tap floating "+" button (bottom right)
3. Observe navigation

**Expected Result**:
- ✅ Navigates to Add Property screen
- ✅ Empty form displayed
- ✅ No errors

---

### Scenario 7: Pull to Refresh
**Steps**:
1. Open Properties list
2. Pull down from top of list
3. Release to refresh

**Expected Result**:
- ✅ Refresh indicator appears
- ✅ Data reloads
- ✅ List updates with latest data
- ✅ Refresh indicator disappears

---

### Scenario 8: Auto-Refresh on Focus
**Steps**:
1. Open Properties list
2. Navigate to another tab
3. Come back to Properties tab

**Expected Result**:
- ✅ Data automatically refreshes
- ✅ Shows latest information
- ✅ No manual refresh needed

---

### Scenario 9: Status Badge Colors
**Steps**:
1. Open Properties list
2. Look at status badges on property cards

**Expected Colors**:
- ✅ Available/Free: Green background
- ✅ Booked: Blue background
- ✅ Sold: Red background
- ✅ Reserved: Yellow background

---

### Scenario 10: Empty State
**Steps**:
1. Search for something that doesn't exist
2. Or view when no properties added

**Expected Result**:
- ✅ Shows empty state icon
- ✅ Shows appropriate message
- ✅ Shows "Add Property" button
- ✅ Button works when tapped

---

### Scenario 11: Error Handling
**Steps**:
1. Turn off backend server
2. Open Properties list
3. Observe error handling

**Expected Result**:
- ✅ Error message displayed
- ✅ Retry button shown
- ✅ Tapping retry attempts to reload
- ✅ App doesn't crash

---

### Scenario 12: Multiple Projects
**Steps**:
1. Ensure database has multiple projects with units
2. Open Properties list
3. Scroll through list

**Expected Result**:
- ✅ All projects displayed
- ✅ Each project in separate section
- ✅ Smooth scrolling
- ✅ No performance issues

---

## Data Verification

### Check Property Card Shows:
- ✅ Unit name (e.g., "A-101")
- ✅ Status badge with color
- ✅ Unit type (e.g., "2BHK")
- ✅ Floor number (e.g., "Floor 1")
- ✅ Unit size (e.g., "1,200 sq ft")
- ✅ Price (e.g., "₹45,00,000")
- ✅ View button
- ✅ Edit button

### Check Formatting:
- ✅ Currency shows ₹ symbol
- ✅ Numbers have comma separators
- ✅ Size shows "sq ft" suffix
- ✅ Floor shows "Floor" prefix
- ✅ N/A shown for missing data

---

## Backend Verification

### Check API Calls:
1. Open React Native Debugger
2. Watch network requests
3. Verify correct endpoints called:
   - ✅ GET `/api/master/projects`
   - ✅ GET `/api/master/project/:projectId/units`

### Check Response Data:
- ✅ Projects array returned
- ✅ Units array returned for each project
- ✅ Success flag is true
- ✅ Data structure matches expected format

---

## Common Issues & Solutions

### Issue 1: Blank Screen
**Possible Causes**:
- Backend not running
- Wrong API base URL
- Network error

**Solution**:
1. Check backend is running on port 5002
2. Verify API_BASE_URL in `src/config/api.js`
3. Check network connectivity

### Issue 2: No Properties Showing
**Possible Causes**:
- No data in database
- API returning empty arrays
- Wrong project IDs

**Solution**:
1. Check database has projects and units
2. Verify units have correct project_id
3. Check API responses in debugger

### Issue 3: Search Not Working
**Possible Causes**:
- Case sensitivity issue
- Wrong field names
- Redux state not updating

**Solution**:
1. Check search is case-insensitive
2. Verify field names match backend
3. Check Redux DevTools

### Issue 4: Status Colors Wrong
**Possible Causes**:
- Status values don't match expected
- Case sensitivity issue

**Solution**:
1. Check status values in database
2. Verify getStatusColor function
3. Check for typos in status names

---

## Performance Testing

### Load Time:
- ✅ Initial load < 2 seconds
- ✅ Refresh < 1 second
- ✅ Search results instant

### Scroll Performance:
- ✅ Smooth scrolling
- ✅ No lag or stuttering
- ✅ Cards render quickly

### Memory Usage:
- ✅ No memory leaks
- ✅ App remains responsive
- ✅ No crashes

---

## Database Setup for Testing

### Minimum Test Data:
```sql
-- At least 2 projects
INSERT INTO project (project_name, company_name, address) VALUES
('Sunrise Apartments', 'ABC Builders', '123 Main St'),
('Sunset Villas', 'XYZ Developers', '456 Park Ave');

-- At least 5 units per project with different statuses
INSERT INTO unit (project_id, unit_name, unit_type, floor, unit_size, bsp, status) VALUES
(1, 'A-101', '2BHK', 1, 1200, 4500000, 'Available'),
(1, 'A-102', '3BHK', 1, 1500, 5500000, 'Booked'),
(1, 'A-201', '2BHK', 2, 1200, 4600000, 'Sold'),
(1, 'A-202', '3BHK', 2, 1500, 5600000, 'Reserved'),
(1, 'A-301', '2BHK', 3, 1200, 4700000, 'Available'),
(2, 'B-101', '4BHK', 1, 2000, 7500000, 'Available'),
(2, 'B-102', '4BHK', 1, 2000, 7500000, 'Booked');
```

---

## Success Criteria

### All Tests Pass When:
- ✅ Properties display correctly
- ✅ Search works as expected
- ✅ Filter works as expected
- ✅ Navigation works
- ✅ Refresh works
- ✅ Status colors correct
- ✅ Formatting correct
- ✅ No crashes or errors
- ✅ Performance acceptable
- ✅ Empty states handled
- ✅ Error states handled

---

## Regression Testing

After fixing properties, verify:
- ✅ Projects module still works
- ✅ Customers module still works
- ✅ Dashboard still works
- ✅ Navigation still works
- ✅ No new errors introduced
