# Booking Module Business Logic

This document outlines the business logic that should be implemented on the backend API for the Booking module.

## Backend Requirements

### 1. Customer and Property Validation

**Endpoint**: `POST /api/transactions/bookings`

**Validations**:
- Verify customer exists and is active
- Verify property exists
- Check property availability status (must be "available" or "Available")
- Prevent booking if property is already booked, sold, or reserved
- Validate booking amount is positive and reasonable

**Response**:
- Success: Return created booking with booking_number
- Error: Return appropriate error message

### 2. Property Status Update on Booking Creation

**Endpoint**: `POST /api/transactions/bookings`

**Business Logic**:
- When a booking is created with status "confirmed":
  - Update property status to "Booked" or "booked"
  - Record the booking_id in the property record
  - Create audit trail entry

**Database Transaction**:
```sql
BEGIN TRANSACTION;
  INSERT INTO bookings (...) VALUES (...);
  UPDATE properties SET status = 'Booked', booking_id = ? WHERE id = ?;
  INSERT INTO audit_log (...) VALUES (...);
COMMIT;
```

### 3. Booking Status Change Handling

**Endpoint**: `PATCH /api/transactions/bookings/:id/status`

**Business Logic**:

#### When status changes to "confirmed":
- Update property status to "Booked"
- Send confirmation notification to customer
- Create audit trail entry

#### When status changes to "cancelled":
- Release property back to "Available" status
- Clear booking_id from property record
- Send cancellation notification to customer
- Create audit trail entry
- Handle any payment reversals if applicable

#### When status changes to "pending":
- Keep property in current status
- Create audit trail entry

**Database Transaction**:
```sql
BEGIN TRANSACTION;
  UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?;
  
  IF new_status = 'cancelled' THEN
    UPDATE properties SET status = 'Available', booking_id = NULL WHERE booking_id = ?;
  END IF;
  
  IF new_status = 'confirmed' THEN
    UPDATE properties SET status = 'Booked', booking_id = ? WHERE id = ?;
  END IF;
  
  INSERT INTO audit_log (...) VALUES (...);
COMMIT;
```

### 4. Booking Deletion

**Endpoint**: `DELETE /api/transactions/bookings/:id`

**Business Logic**:
- Verify booking can be deleted (check business rules)
- Release property back to "Available" status
- Clear booking_id from property record
- Soft delete or hard delete based on business requirements
- Create audit trail entry

### 5. Booking Update

**Endpoint**: `PUT /api/transactions/bookings/:id`

**Business Logic**:
- If property_id is changed:
  - Release old property back to "Available"
  - Check new property availability
  - Update new property status to "Booked" if booking is confirmed
- Validate all changes
- Create audit trail entry

## Error Handling

### Common Error Scenarios:

1. **Property Not Available**
   - Status Code: 400
   - Message: "Property is not available for booking"

2. **Customer Not Found**
   - Status Code: 404
   - Message: "Customer not found"

3. **Property Not Found**
   - Status Code: 404
   - Message: "Property not found"

4. **Booking Already Exists**
   - Status Code: 409
   - Message: "Property is already booked"

5. **Invalid Status Transition**
   - Status Code: 400
   - Message: "Invalid status transition from {old} to {new}"

## Notifications

### Email/SMS Notifications:

1. **Booking Created**
   - Send to: Customer
   - Content: Booking confirmation with details

2. **Booking Confirmed**
   - Send to: Customer, Sales Team
   - Content: Booking confirmation with payment details

3. **Booking Cancelled**
   - Send to: Customer, Sales Team
   - Content: Cancellation confirmation

## Audit Trail

All booking operations should be logged with:
- User who performed the action
- Timestamp
- Old values (for updates)
- New values
- Action type (create, update, delete, status_change)

## Integration Points

### With Other Modules:

1. **Payment Module**
   - Link payments to bookings
   - Track payment status
   - Calculate outstanding amounts

2. **Allotment Module**
   - Create allotment from confirmed booking
   - Transfer booking data to allotment

3. **Customer Module**
   - Fetch customer details
   - Update customer booking history

4. **Property Module**
   - Update property status
   - Track property booking history

## Testing Checklist

- [ ] Create booking with available property
- [ ] Attempt to book unavailable property (should fail)
- [ ] Confirm booking (property status should change to "Booked")
- [ ] Cancel booking (property status should change to "Available")
- [ ] Update booking with different property
- [ ] Delete booking (property should be released)
- [ ] Concurrent booking attempts on same property
- [ ] Invalid customer/property IDs
- [ ] Negative or zero booking amounts
- [ ] Status transition validations
