# Phase 2: Dashboard & Navigation - Requirements

## Introduction

This document outlines the requirements for implementing Phase 2 of the L2L EPR Mobile App, focusing on the Dashboard and Navigation features. The implementation will mirror the web application's functionality while being optimized for mobile devices.

## Requirements

### Requirement 1: Main Dashboard

**User Story:** As a user, I want to see a comprehensive dashboard when I log in, so that I can quickly access key information and actions.

#### Acceptance Criteria

1. WHEN the user logs in THEN the system SHALL display a dashboard home screen with a time-based greeting
2. WHEN the dashboard loads THEN the system SHALL display the user's name retrieved from AsyncStorage
3. WHEN the dashboard is displayed THEN the system SHALL show statistics cards with key metrics
4. WHEN the dashboard is displayed THEN the system SHALL provide quick action buttons for common tasks
5. WHEN the dashboard loads THEN the system SHALL display a list of recent activities
6. WHEN the dashboard is displayed THEN the system SHALL show a property grid view with categories

### Requirement 2: Statistics Cards

**User Story:** As a user, I want to see key statistics at a glance, so that I can monitor important metrics quickly.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display statistics cards for total properties, customers, bookings, and revenue
2. WHEN statistics are displayed THEN the system SHALL use appropriate icons for each metric
3. WHEN statistics cards are shown THEN the system SHALL use the brand color scheme (#EF4444, #1F2937)
4. WHEN statistics are loading THEN the system SHALL display loading indicators
5. WHEN statistics fail to load THEN the system SHALL display error messages

### Requirement 3: Quick Actions Menu

**User Story:** As a user, I want quick access to common actions, so that I can perform tasks efficiently.

#### Acceptance Criteria

1. WHEN the dashboard is displayed THEN the system SHALL show quick action buttons
2. WHEN quick actions are shown THEN the system SHALL include: Add Customer, New Booking, View Properties, Reports
3. WHEN a quick action is tapped THEN the system SHALL navigate to the appropriate screen
4. WHEN quick actions are displayed THEN the system SHALL use appropriate icons
5. WHEN quick actions are shown THEN the system SHALL be touch-friendly (minimum 44x44 points)

### Requirement 4: Recent Activities List

**User Story:** As a user, I want to see recent activities, so that I can stay updated on system changes.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a list of recent activities
2. WHEN activities are displayed THEN the system SHALL show activity type, description, and timestamp
3. WHEN activities are shown THEN the system SHALL display the most recent 10 activities
4. WHEN the user pulls down THEN the system SHALL refresh the activities list
5. WHEN no activities exist THEN the system SHALL display an empty state component

### Requirement 5: Property Grid View

**User Story:** As a user, I want to browse properties in a grid layout, so that I can view multiple properties at once.

#### Acceptance Criteria

1. WHEN the dashboard is displayed THEN the system SHALL show a property grid with categories
2. WHEN properties are displayed THEN the system SHALL group them by category (Lifestyle, City Living, Investment)
3. WHEN a property is tapped THEN the system SHALL navigate to property details
4. WHEN properties are loading THEN the system SHALL display loading indicators
5. WHEN no properties exist THEN the system SHALL display an empty state

### Requirement 6: Bottom Tab Navigation

**User Story:** As a user, I want easy navigation between main sections, so that I can access different parts of the app quickly.

#### Acceptance Criteria

1. WHEN the app is displayed THEN the system SHALL show bottom tab navigation
2. WHEN tabs are shown THEN the system SHALL include: Home, Properties, Customers, Profile
3. WHEN a tab is tapped THEN the system SHALL navigate to the corresponding screen
4. WHEN a tab is active THEN the system SHALL highlight it with the primary color (#EF4444)
5. WHEN tabs are displayed THEN the system SHALL show appropriate icons

### Requirement 7: Drawer Navigation (Side Menu)

**User Story:** As a user, I want access to all app sections via a side menu, so that I can navigate to any feature.

#### Acceptance Criteria

1. WHEN the user taps the menu icon THEN the system SHALL open a drawer navigation
2. WHEN the drawer is open THEN the system SHALL display menu sections: Masters, Transactions, Reports, Utilities
3. WHEN a menu item is tapped THEN the system SHALL navigate to the corresponding screen
4. WHEN the drawer is open THEN the system SHALL display the user's profile information
5. WHEN the user taps outside the drawer THEN the system SHALL close the drawer

### Requirement 8: Top Navigation Bar

**User Story:** As a user, I want a consistent top navigation bar, so that I can always access key functions.

#### Acceptance Criteria

1. WHEN any screen is displayed THEN the system SHALL show a top navigation bar
2. WHEN the top bar is shown THEN the system SHALL display the screen title
3. WHEN the top bar is shown THEN the system SHALL include a menu/back button
4. WHEN the top bar is shown THEN the system SHALL use the brand color (#EF4444)
5. WHEN the top bar is shown THEN the system SHALL display user profile icon

### Requirement 9: Back Navigation Handling

**User Story:** As a user, I want intuitive back navigation, so that I can easily return to previous screens.

#### Acceptance Criteria

1. WHEN the user taps the back button THEN the system SHALL navigate to the previous screen
2. WHEN the user is on the home screen AND taps back THEN the system SHALL show exit confirmation
3. WHEN the user navigates back THEN the system SHALL maintain the navigation stack
4. WHEN the user navigates back THEN the system SHALL preserve screen state where appropriate
5. WHEN the user double-taps back quickly THEN the system SHALL exit the app

### Requirement 10: Profile View Screen

**User Story:** As a user, I want to view my profile information, so that I can see my account details.

#### Acceptance Criteria

1. WHEN the user navigates to profile THEN the system SHALL display user information
2. WHEN the profile is displayed THEN the system SHALL show: name, email, user ID, role
3. WHEN the profile is displayed THEN the system SHALL show a profile avatar
4. WHEN the profile is displayed THEN the system SHALL provide action buttons
5. WHEN the profile is displayed THEN the system SHALL use consistent styling

### Requirement 11: Change Password

**User Story:** As a user, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN the user taps "Change Password" THEN the system SHALL display a password change form
2. WHEN the form is displayed THEN the system SHALL require current password and new password
3. WHEN passwords are entered THEN the system SHALL validate password strength
4. WHEN the form is submitted THEN the system SHALL call the backend API
5. WHEN password change succeeds THEN the system SHALL display a success toast
6. WHEN password change fails THEN the system SHALL display an error message

### Requirement 12: User Settings

**User Story:** As a user, I want to configure app settings, so that I can customize my experience.

#### Acceptance Criteria

1. WHEN the user navigates to settings THEN the system SHALL display available settings
2. WHEN settings are displayed THEN the system SHALL include: notifications, theme, language
3. WHEN a setting is changed THEN the system SHALL save it to AsyncStorage
4. WHEN settings are changed THEN the system SHALL apply them immediately
5. WHEN settings are displayed THEN the system SHALL show current values

### Requirement 13: Logout Confirmation

**User Story:** As a user, I want to confirm before logging out, so that I don't accidentally lose my session.

#### Acceptance Criteria

1. WHEN the user taps "Logout" THEN the system SHALL display a confirmation dialog
2. WHEN the confirmation is shown THEN the system SHALL ask "Are you sure you want to logout?"
3. WHEN the user confirms THEN the system SHALL clear authentication data
4. WHEN the user confirms THEN the system SHALL navigate to the login screen
5. WHEN the user cancels THEN the system SHALL close the dialog and remain logged in
