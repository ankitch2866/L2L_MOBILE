# API Endpoints Reference

## Base Configuration

**Base URL:** `http://192.168.1.27:5002`  
**API Prefix:** `/api/master`  
**Full Base URL:** `http://192.168.1.27:5002/api/master`

**Backend Port:** `5002` (configured in `L2L_EPR_BACK_V2/.env`)

---

## Payment Plans & Installments

### Payment Plans
- **GET** `/api/master/plans` - Get all payment plans
- **GET** `/api/master/plans/:id` - Get payment plan by ID
- **POST** `/api/master/plans` - Create new payment plan
  - Body: `{ plan_name: string }`
- **PUT** `/api/master/plans/:id` - Update payment plan
  - Body: `{ plan_name: string }`
- **DELETE** `/api/master/plans/:id` - Delete payment plan
- **GET** `/api/master/plans/:id/usage` - Check if plan is being used

### Installments
- **POST** `/api/master/plans/:plan_id/installments` - Add installments to plan
  - Body: `{ installments: [{ installment_name, due_days, is_percentage, value }] }`
- **GET** `/api/master/plans/:plan_id/installments` - Get installments for a plan
- **GET** `/api/master/installments/:installment_id` - Get specific installment
- **PUT** `/api/master/installments/:installment_id` - Update installment
  - Body: `{ installment_name?, due_days?, is_percentage?, value? }`
- **DELETE** `/api/master/installments/:installment_id` - Delete installment

### Utility Routes
- **POST** `/api/master/plans/cleanup-auto-installments` - Clean up auto-created installments
- **DELETE** `/api/master/plans/:plan_id/force-clean-installments` - Force clean all installments

---

## Projects

- **GET** `/api/master/projects` - Get all projects
- **GET** `/api/master/projects/:id` - Get project by ID
- **POST** `/api/master/projects` - Create new project (with image upload)
- **PUT** `/api/master/projects/:id` - Update project (with image upload)
- **DELETE** `/api/master/projects/:id` - Delete project
- **GET** `/api/master/projects/:id/usage` - Check project usage

---

## Units/Properties

- **GET** `/api/master/units` - Get all units
- **GET** `/api/master/unit/:id` - Get unit by ID
- **POST** `/api/master/unit` - Create new unit
- **PUT** `/api/master/unit/:id` - Update unit
- **DELETE** `/api/master/unit/:id` - Delete unit
- **GET** `/api/master/project/:projectId/units` - Get units by project
- **GET** `/api/master/home/units/:projectId` - Get allotted units by project
- **GET** `/api/master/unit-types` - Get unit types

---

## Customers

- **GET** `/api/master/customers` - Get all customers (with pagination)
  - Query params: `page`, `limit`
- **GET** `/api/master/customers/:customer_id` - Get customer details
- **GET** `/api/master/customers/edit/:customer_id` - Get customer for editing
- **POST** `/api/master/customers` - Create new customer
- **PUT** `/api/master/customers/:customer_id` - Update customer
- **GET** `/api/master/customers/by-project/:project_id` - Get customers by project
- **GET** `/api/master/customers/project/:project_id` - Get customers by project with date
- **GET** `/api/master/filteredcustomers/project/:project_id` - Get filtered customers
- **GET** `/api/master/customers/detailed/:project_id` - Get detailed customers
- **GET** `/api/master/customers/production/:project_id` - Get production customers

---

## Co-Applicants

- **GET** `/api/master/co-applicants` - Get all co-applicants (with pagination)
  - Query params: `page`, `limit`
- **GET** `/api/master/co-applicants/:co_applicant_id` - Get co-applicant details
- **GET** `/api/master/co-applicants/:co_applicant_id/edit` - Get co-applicant for editing
- **POST** `/api/master/co-applicants` - Create new co-applicant
- **PUT** `/api/master/co-applicants/:co_applicant_id` - Update co-applicant
- **DELETE** `/api/master/co-applicants/:co_applicant_id` - Delete co-applicant
- **GET** `/api/master/co-applicants/search` - Search co-applicants
  - Query params: `query`

---

## Brokers

- **GET** `/api/master/brokers` - Get all brokers
- **GET** `/api/master/brokers/project/:project_id` - Get brokers by project
- **GET** `/api/master/brokers/:broker_id` - Get broker details
- **GET** `/api/master/brokers/:broker_id/edit` - Get broker for editing
- **GET** `/api/master/brokers/:broker_id/usage` - Check broker usage
- **POST** `/api/master/brokers` - Create new broker
- **PUT** `/api/master/brokers/:broker_id` - Update broker
- **DELETE** `/api/master/brokers/:broker_id` - Delete broker

---

## Banks

- **GET** `/api/master/banks` - Get all banks
- **GET** `/api/master/banks/:id` - Get bank by ID
- **GET** `/api/master/banks/search` - Search banks
  - Query params: `query`
- **POST** `/api/master/banks` - Create new bank
- **PUT** `/api/master/banks/:id` - Update bank
- **DELETE** `/api/master/banks/:id` - Delete bank

---

## PLC (Preferential Location Charges)

- **GET** `/api/master/plcs` - Get all PLCs
- **GET** `/api/master/plcs/:id` - Get PLC by ID
- **POST** `/api/master/plcs` - Create new PLC
- **PUT** `/api/master/plcs/:id` - Update PLC
- **DELETE** `/api/master/plcs/:id` - Delete PLC

---

## Project Sizes

- **GET** `/api/master/project-sizes` - Get all project sizes
- **GET** `/api/master/project-sizes/:id` - Get project size by ID
- **GET** `/api/master/project-sizes/project/:project_id` - Get sizes by project
- **GET** `/api/master/get-projects-for-dropdown` - Get projects for dropdown
- **POST** `/api/master/project-sizes` - Create new project size
- **PUT** `/api/master/project-sizes/:id` - Update project size
- **DELETE** `/api/master/project-sizes/:id` - Delete project size

---

## Stock

- **GET** `/api/master/stocks` - Get all stocks
- **GET** `/api/master/stocks/:stock_id` - Get stock by ID
- **GET** `/api/master/stock/stocklist` - Get stock list
- **GET** `/api/master/stock/stocklist/get` - Get stock by unit details
- **POST** `/api/master/stocks` - Create new stock
- **PUT** `/api/master/stocks/:stock_id` - Update stock
- **DELETE** `/api/master/stocks/:stock_id` - Delete stock

---

## Configuration Files

### Mobile Frontend
- **Config File:** `L2L_EPR_MOBILE_FRONT_V2/src/config/api.js`
- **Base URL Export:** `export const API_BASE_URL = 'http://192.168.1.27:5002'`

### Backend
- **Environment File:** `L2L_EPR_BACK_V2/.env`
- **Port:** `5002`
- **Routes File:** `L2L_EPR_BACK_V2/src/routes/masterRoutes.js`

---

## Important Notes

1. **Local IP Address:** The base URL uses the local IP address `192.168.1.27` instead of `localhost` because mobile devices cannot access `localhost` on the development machine.

2. **Finding Your IP:**
   - **Mac/Linux:** Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** Run `ipconfig`

3. **Authentication:** All API requests should include the JWT token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

4. **Response Format:** All API responses follow this format:
   ```json
   {
     "success": true/false,
     "data": {...},
     "message": "Success/Error message"
   }
   ```

5. **Pagination:** List endpoints support pagination with query parameters:
   - `page` - Page number (default: 1)
   - `limit` - Items per page (default: 20)

---

## Testing Endpoints

You can test endpoints using curl:

```bash
# Get all payment plans
curl http://192.168.1.27:5002/api/master/plans

# Get all customers
curl http://192.168.1.27:5002/api/master/customers

# Get all brokers
curl http://192.168.1.27:5002/api/master/brokers
```

---

**Last Updated:** January 2025  
**Version:** 1.0
