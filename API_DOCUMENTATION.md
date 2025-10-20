# Caregiving Platform API Documentation

## Overview

The Caregiving Platform API is a comprehensive REST API that facilitates connections between clients seeking care services and professional caregivers. The platform includes user management, caregiver profiles, administrative functions, booking systems, and service management.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.caregiving-platform.com`

## Interactive Documentation

Visit `/api` endpoint for interactive Swagger documentation:
- **Development**: http://localhost:3001/api
- **Production**: https://api.caregiving-platform.com/api

## Authentication

The API uses Bearer token authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints Overview

### 1. Users Module (`/users`)

Manages user accounts for clients, caregivers, and administrators.

#### Key Endpoints:
- `POST /users` - Register a new user
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account

#### User Roles:
- `CLIENT` - End users seeking care services
- `CAREGIVER` - Professional caregivers providing services
- `ADMIN` - Platform administrators

### 2. Caregivers Module (`/caregivers`)

Manages caregiver profiles, services, and availability.

#### Key Endpoints:
- `POST /caregivers` - Create caregiver profile
- `GET /caregivers` - Get all caregivers
- `GET /caregivers/search` - Search caregivers with filters
- `GET /caregivers/:id` - Get caregiver by ID
- `GET /caregivers/user/:userId` - Get caregiver by user ID
- `PATCH /caregivers/:id` - Update caregiver profile
- `PATCH /caregivers/:id/availability` - Update availability
- `PATCH /caregivers/:id/rating` - Update rating
- `DELETE /caregivers/:id` - Delete caregiver profile

#### Search Filters:
- Location
- Services offered
- Hourly rate range (min/max)
- Minimum rating
- Minimum experience
- Pagination (page, limit)

#### Service Categories:
- `PERSONAL_CARE` - Personal hygiene and daily living assistance
- `MEDICAL_CARE` - Medical support and medication management
- `COMPANIONSHIP` - Social interaction and emotional support
- `HOUSEHOLD_TASKS` - Cleaning, cooking, and household management
- `TRANSPORTATION` - Transportation to appointments and errands
- `SPECIALIZED_CARE` - Specialized care for specific conditions

### 3. Admin Module (`/admin`)

Administrative functions for platform management and caregiver approval.

#### Key Endpoints:
- `POST /admin` - Create admin user
- `GET /admin` - Get all admins
- `GET /admin/:id` - Get admin by ID
- `PATCH /admin/:id` - Update admin profile
- `DELETE /admin/:id` - Delete admin user

#### Caregiver Management:
- `POST /admin/:adminId/approve-caregiver` - Approve/reject caregiver
- `GET /admin/:adminId/pending-caregivers` - Get pending approvals
- `GET /admin/:adminId/approved-caregivers` - Get approved caregivers

#### Permission Management:
- `GET /admin/:adminId/permissions` - Get admin permissions
- `POST /admin/:adminId/permissions` - Add permission
- `DELETE /admin/:adminId/permissions/:permission` - Remove permission
- `GET /admin/:adminId/has-permission` - Check permission

#### Admin Roles:
- `SUPER_ADMIN` - Full system access
- `ADMIN` - User and caregiver management
- `MODERATOR` - Caregiver approval only

### 4. Bookings Module (`/bookings`)

Manages appointment scheduling and booking operations.

#### Key Endpoints:
- `POST /bookings` - Create new booking
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get booking by ID
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### 5. Services Module (`/services`)

Manages service categories and definitions.

#### Key Endpoints:
- `POST /services` - Create new service
- `GET /services` - Get all services
- `GET /services/:id` - Get service by ID
- `PATCH /services/:id` - Update service
- `DELETE /services/:id` - Delete service

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "CLIENT | CAREGIVER | ADMIN",
  "isVerified": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Caregiver
```json
{
  "id": "string",
  "userId": "string",
  "bio": "string",
  "experience": "number",
  "hourlyRate": "number",
  "rating": "number",
  "reviewCount": "number",
  "isVerified": "boolean",
  "services": ["string"],
  "certifications": [
    {
      "name": "string",
      "issuingBody": "string",
      "issueDate": "string",
      "expiryDate": "string",
      "isVerified": "boolean"
    }
  ],
  "availability": [
    {
      "dayOfWeek": "string",
      "startTime": "string",
      "endTime": "string",
      "isActive": "boolean"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Admin
```json
{
  "id": "string",
  "userId": "string",
  "role": "SUPER_ADMIN | ADMIN | MODERATOR",
  "permissions": ["string"],
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Development**: 1000 requests per hour per IP
- **Production**: 100 requests per minute per authenticated user

## Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

Response format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## Validation

All request bodies are validated using class-validator decorators. Invalid requests return detailed validation errors:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Data
The API includes seed data for testing:
- Default super admin: `admin_1`
- Sample caregivers with various services
- Test users for different roles

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run start:dev
   ```

4. **Access Documentation**
   Visit http://localhost:3001/api

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build and Start
```bash
npm run build
npm run start:prod
```

## API Versioning

The API follows semantic versioning. Future versions will be available at:
- `/api/v1/` - Current version
- `/api/v2/` - Future version

## Support and Contributing

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Contribute to API documentation
- **Code**: Submit pull requests for improvements

## License

This API is licensed under the MIT License. See LICENSE file for details.

---

*Last updated: $(date)*
*API Version: 1.0.0*