# Implementation Checklist

## Important: When Implementing New Modules

When implementing a new module, **ALWAYS** remember to update the following locations to remove "Coming Soon" alerts and enable the module:

### 1. Masters Screen (for Master Data Modules)
**File**: `src/screens/categories/MastersScreen.js`

**Action**: Update the `masterModules` array entry:
```javascript
// BEFORE (Coming Soon):
{ name: 'Module Name', icon: 'icon-name', route: null, screen: null, implemented: false }

// AFTER (Implemented):
{ name: 'Module Name', icon: 'icon-name', route: 'ModuleRoute', screen: 'ModuleScreen', implemented: true }
```

### 2. Transactions Screen (for Transaction Modules)
**File**: `src/screens/categories/TransactionsScreen.js`

**Action**: Update the `transactionModules` array entry similarly.

### 3. Dashboard Home Screen (if applicable)
**File**: `src/screens/dashboard/DashboardHomeScreen.js`

**Action**: Add quick access cards or links if the module should be featured on the dashboard.

### 4. Related Detail Screens
**Action**: Add navigation buttons to access the new module from related screens.

**Example**: When implementing Project Sizes, add a "View Project Sizes" button in `ProjectDetailsScreen.js`

---

## Module Implementation Checklist

Use this checklist when implementing any new module:

### Phase 1: Redux Setup
- [ ] Create Redux slice in `src/store/slices/`
- [ ] Implement all CRUD async thunks
- [ ] Define initial state
- [ ] Add reducers and actions
- [ ] Register slice in `src/store/index.js`

### Phase 2: Components
- [ ] Create card component in `src/components/masters/` or `src/components/transactions/`
- [ ] Implement proper styling matching existing cards
- [ ] Add edit/delete actions if applicable

### Phase 3: Screens
- [ ] Create screen folder in appropriate location
- [ ] Implement List screen with search/filter
- [ ] Implement Add screen with validation
- [ ] Implement Edit screen with delete option
- [ ] Implement Details screen (if needed)
- [ ] Create index.js for exports

### Phase 4: Navigation
- [ ] Import screens in `DashboardNavigator.js`
- [ ] Create Stack Navigator for the module
- [ ] Add stack to root navigator
- [ ] Configure header styling

### Phase 5: Integration & Access Points
- [ ] **Update MastersScreen.js or TransactionsScreen.js**
  - Change `implemented: false` to `implemented: true`
  - Add proper route and screen names
  - Verify icon is appropriate
- [ ] Add access from related detail screens
- [ ] Add to dashboard if it's a primary module
- [ ] Update any filter/dropdown lists that should include this data

### Phase 6: Testing
- [ ] Run diagnostics to check for errors
- [ ] Test all CRUD operations
- [ ] Test navigation flow
- [ ] Test validation rules
- [ ] Test error handling
- [ ] Test empty states
- [ ] Test loading states

### Phase 7: Documentation
- [ ] Create implementation summary document
- [ ] Update task list to mark as completed
- [ ] Document any special considerations

---

## Common Mistakes to Avoid

1. ❌ **Forgetting to update `implemented: false` to `true`**
   - This leaves the "Coming Soon" alert active even after implementation

2. ❌ **Not registering the Redux slice in store**
   - Module won't have state management

3. ❌ **Missing navigation stack registration**
   - Module screens won't be accessible

4. ❌ **Inconsistent naming conventions**
   - Use consistent naming: `ModuleNameStack`, `ModuleNameList`, etc.

5. ❌ **Not adding access from related screens**
   - Users should be able to navigate naturally between related modules

6. ❌ **Skipping validation**
   - Always validate user input before API calls

7. ❌ **Not handling loading/error states**
   - Users need feedback during async operations

---

## Quick Reference: Module Locations

### Master Data Modules
- **Screens**: `src/screens/masters/moduleName/`
- **Components**: `src/components/masters/`
- **Redux**: `src/store/slices/moduleNameSlice.js`
- **Access Point**: `src/screens/categories/MastersScreen.js`

### Transaction Modules
- **Screens**: `src/screens/transactions/moduleName/`
- **Components**: `src/components/transactions/`
- **Redux**: `src/store/slices/moduleNameSlice.js`
- **Access Point**: `src/screens/categories/TransactionsScreen.js`

### Core Modules (Projects, Properties, Customers)
- **Screens**: `src/screens/moduleName/`
- **Components**: `src/components/moduleName/`
- **Redux**: `src/store/slices/moduleNameSlice.js`
- **Access Point**: Bottom tab navigation + Dashboard

---

## Example: Project Sizes Implementation

✅ **Correctly Implemented**:

1. Created Redux slice: `projectSizesSlice.js`
2. Created component: `ProjectSizeCard.js`
3. Created screens: `ProjectSizesListScreen.js`, `AddProjectSizeScreen.js`, `EditProjectSizeScreen.js`
4. Added navigation: `ProjectSizesStack` in `DashboardNavigator.js`
5. **Updated MastersScreen.js**:
   ```javascript
   { name: 'Project Sizes', icon: 'ruler', route: 'ProjectSizes', screen: 'ProjectSizesList', implemented: true }
   ```
6. Added access from `ProjectDetailsScreen.js`
7. Registered in Redux store
8. All diagnostics passed

---

**Last Updated**: January 10, 2025
**Modules Implemented**: 10/15 (Sprint 1 Complete)
