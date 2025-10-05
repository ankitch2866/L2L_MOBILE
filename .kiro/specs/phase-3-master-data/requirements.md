# Phase 3: Master Data Modules - Requirements

## Introduction

This document outlines the requirements for implementing Phase 3 of the L2L EPR Mobile App, focusing on Master Data Management modules. The implementation will mirror the web application's functionality exactly, maintaining the same business logic and API integration while optimizing for mobile UX.

## Scope

Phase 3 includes **10 major modules** with **54 sub-modules**:
- Project Management (5 modules)
- Property/Unit Management (6 modules)
- Customer Management (6 modules)
- Co-Applicant Management (5 modules)
- Broker Management (5 modules)
- Payment Plans (8 modules)
- PLC Management (4 modules)
- Project Size Management (3 modules)
- Bank Management (4 modules)
- Stock Management (4 modules)

## Core Principles

1. **Web Parity**: Match web frontend functionality exactly
2. **No Backend Changes**: Use existing APIs without modification
3. **Mobile Optimization**: Adapt UI for mobile while keeping logic identical
4. **Consistent UX**: Follow Phase 1 & 2 patterns

---

## Module 7: Project Management

### Requirement 7.1: Projects List Screen

**User Story:** As a user, I want to view all projects in a list, so that I can browse and manage projects.

#### Acceptance Criteria
1. WHEN the user navigates to Projects THEN the system SHALL display a list of all projects
2. WHEN projects are displayed THEN the system SHALL show project name, location, and status
3. WHEN the user taps a project THEN the system SHALL navigate to project details
4. WHEN the user pulls down THEN the system SHALL refresh the project list
5. WHEN no projects exist THEN the system SHALL display an empty state

### Requirement 7.2: Add New Project

**User Story:** As a user, I want to add a new project, so that I can manage project information.

#### Acceptance Criteria
1. WHEN the user taps "Add Project" THEN the system SHALL display a project form
2. WHEN the form is displayed THEN the system SHALL include all required fields
3. WHEN the user submits THEN the system SHALL validate all fields
4. WHEN validation passes THEN the system SHALL call POST /api/master/projects
5. WHEN creation succeeds THEN the system SHALL show success message and navigate back

### Requirement 7.3-7.5: View, Edit, Search & Filter

Similar patterns for viewing details, editing, and searching projects.

---

## Module 8: Property/Unit Management

### Requirement 8.1: Property List Screen

**User Story:** As a user, I want to view all properties, so that I can manage units.

#### Acceptance Criteria
1. WHEN the user navigates to Properties THEN the system SHALL display a list of properties
2. WHEN properties are displayed THEN the system SHALL show unit number, project, status
3. WHEN the user taps a property THEN the system SHALL navigate to property details
4. WHEN the user filters THEN the system SHALL show filtered results
5. WHEN no properties exist THEN the system SHALL display an empty state

### Requirements 8.2-8.6: Add, View, Edit, Status, Search & Filter

Similar patterns for property management operations.

---

## Module 9: Customer Management

### Requirement 9.1: Customer Dashboard/List

**User Story:** As a user, I want to view all customers, so that I can manage customer information.

#### Acceptance Criteria
1. WHEN the user navigates to Customers THEN the system SHALL display customer list
2. WHEN customers are displayed THEN the system SHALL show name, phone, email
3. WHEN the user taps a customer THEN the system SHALL navigate to customer details
4. WHEN the user searches THEN the system SHALL filter customers
5. WHEN no customers exist THEN the system SHALL display an empty state

### Requirement 9.2: Customer Registration Form

**User Story:** As a user, I want to register a new customer, so that I can track customer information.

#### Acceptance Criteria
1. WHEN the user taps "Add Customer" THEN the system SHALL display registration form
2. WHEN the form is displayed THEN the system SHALL include all customer fields
3. WHEN the user submits THEN the system SHALL validate all fields
4. WHEN validation passes THEN the system SHALL call POST /api/master/customers
5. WHEN registration succeeds THEN the system SHALL show success and navigate to customer details

### Requirements 9.3-9.6: View, Edit, Search, Info Tabs

Similar patterns for customer management operations.

---

## Module 10: Co-Applicant Management

### Requirements 10.1-10.5

Similar patterns to customer management but for co-applicants with linking functionality.

---

## Module 11: Broker Management

### Requirements 11.1-11.5

Similar patterns with additional commission tracking functionality.

---

## Module 12: Payment Plans

### Requirements 12.1-12.8

Complex module with payment plans and installments management.

---

## Module 13-16: PLC, Project Size, Bank, Stock Management

Similar CRUD patterns for each master data type.

---

## Common Requirements (All Modules)

### Data Display
1. WHEN any list is displayed THEN the system SHALL show loading indicator while fetching
2. WHEN data loads THEN the system SHALL display items in a scrollable list
3. WHEN an error occurs THEN the system SHALL display error message with retry option
4. WHEN no data exists THEN the system SHALL display appropriate empty state

### Forms
1. WHEN any form is displayed THEN the system SHALL validate required fields
2. WHEN validation fails THEN the system SHALL show field-specific error messages
3. WHEN the user submits THEN the system SHALL disable the submit button
4. WHEN submission succeeds THEN the system SHALL show success toast
5. WHEN submission fails THEN the system SHALL show error toast

### Search & Filter
1. WHEN search is available THEN the system SHALL provide a search input
2. WHEN the user types THEN the system SHALL filter results in real-time
3. WHEN filters are available THEN the system SHALL provide filter options
4. WHEN filters are applied THEN the system SHALL update the list
5. WHEN filters are cleared THEN the system SHALL show all results

### Navigation
1. WHEN the user taps back THEN the system SHALL navigate to previous screen
2. WHEN the user taps a list item THEN the system SHALL navigate to details
3. WHEN the user taps edit THEN the system SHALL navigate to edit form
4. WHEN the user saves THEN the system SHALL navigate back to details/list

---

## Technical Requirements

### API Integration
- Use existing API endpoints without modification
- Handle all HTTP methods (GET, POST, PUT, DELETE)
- Implement proper error handling
- Show loading states during API calls

### State Management
- Use Redux for global state where appropriate
- Use local state for form data
- Persist filters and search in navigation state

### Performance
- Implement pagination for large lists
- Use FlatList for efficient rendering
- Cache data appropriately
- Optimize images

### Accessibility
- Minimum touch targets (44x44)
- Screen reader support
- Proper labels
- Color contrast

---

**Total Requirements:** 54 sub-modules across 10 major modules
**Estimated Effort:** 2-3 weeks
**Dependencies:** Phase 1 & 2 complete
