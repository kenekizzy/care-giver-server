# Database Setup Guide

This guide covers the database schema, migration, and seeding process for the caregiving platform.

## Database Schema Overview

The database uses PostgreSQL with Prisma ORM and includes the following main entities:

### Core Entities
- **Users**: Base user accounts (CLIENT, CAREGIVER, ADMIN)
- **CaregiverProfile**: Extended profile for caregivers
- **Services**: Available care services
- **Bookings**: Service appointments between clients and caregivers

### Supporting Entities
- **Certifications**: Caregiver qualifications
- **AvailabilitySlots**: Caregiver schedule availability
- **Reviews**: Booking feedback and ratings
- **ChatRooms & Messages**: Communication system
- **Payments**: Payment processing records

## Environment Setup

Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
JWT_SECRET="your-jwt-secret-key"
BCRYPT_SALT_ROUNDS=12
```

## Available Commands

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Push schema changes without migration
npm run db:push

# Reset database (⚠️ destructive)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

### Seeding
```bash
# Seed database with sample data
npm run db:seed

# Check database status
npm run db:status
```

## Migration Process

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Create Migration**:
   ```bash
   npm run db:migrate
   ```
   - Enter a descriptive migration name when prompted
   - This creates a new migration file and applies it

3. **Seed Database**:
   ```bash
   npm run db:seed
   ```

## Seeded Data

The seed script creates:

### Users
- **1 Admin**: `admin@carehomes.com` (password: `password123`)
- **3 Clients**: 
  - `john.doe@email.com`
  - `mary.smith@email.com`
  - `robert.johnson@email.com`
- **4 Caregivers**:
  - `sarah.wilson@email.com` - Personal Care & Companionship
  - `michael.brown@email.com` - Transportation & Housekeeping
  - `lisa.davis@email.com` - Medical Care & Medication Management
  - `david.miller@email.com` - Dementia Care & Companionship

### Services
1. **Personal Care Assistance** (PERSONAL_CARE)
2. **Medication Management** (MEDICAL_CARE)
3. **Companionship** (COMPANIONSHIP)
4. **Light Housekeeping** (HOUSEHOLD_TASKS)
5. **Transportation Services** (TRANSPORTATION)
6. **Dementia Care** (SPECIALIZED_CARE)

### Sample Data
- Caregiver profiles with ratings and experience
- Certifications (CPR, First Aid, CNA, etc.)
- Availability schedules
- Sample bookings
- Service-caregiver associations

## Database Schema Highlights

### User Roles
```typescript
enum UserRole {
  CLIENT      // Service recipients
  CAREGIVER   // Service providers
  ADMIN       // Platform administrators
}
```

### Booking Statuses
```typescript
enum BookingStatus {
  PENDING     // Awaiting confirmation
  CONFIRMED   // Accepted by caregiver
  IN_PROGRESS // Currently active
  COMPLETED   // Finished successfully
  CANCELLED   // Cancelled by either party
}
```

### Service Categories
```typescript
enum ServiceCategory {
  PERSONAL_CARE      // Bathing, dressing, grooming
  MEDICAL_CARE       // Health monitoring, medication
  COMPANIONSHIP      // Social interaction, emotional support
  HOUSEHOLD_TASKS    // Cleaning, laundry, organization
  TRANSPORTATION     // Appointments, shopping, errands
  SPECIALIZED_CARE   // Dementia, disability-specific care
}
```

## Key Relationships

- **User → CaregiverProfile**: One-to-one for caregivers
- **CaregiverProfile → Services**: Many-to-many through CaregiverService
- **User → Bookings**: One-to-many (as client or caregiver)
- **Booking → Reviews**: One-to-many (bidirectional reviews)
- **Booking → ChatRoom**: One-to-one for communication

## Testing Database Connection

Run the status check to verify everything is working:

```bash
npm run db:status
```

This will show:
- Record counts for all tables
- User distribution by role
- Sample data preview
- Connection status

## Production Deployment

For production deployment:

1. **Set Production Environment Variables**:
   ```env
   DATABASE_URL="your-production-database-url"
   NODE_ENV="production"
   ```

2. **Deploy Migrations**:
   ```bash
   npm run db:migrate:deploy
   ```

3. **Seed Production Data** (optional):
   ```bash
   npm run db:seed
   ```

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Verify DATABASE_URL in .env
   - Check database server is running
   - Ensure network connectivity

2. **Migration Errors**:
   - Check for schema conflicts
   - Ensure database is accessible
   - Review migration files for syntax errors

3. **Seed Errors**:
   - Verify Prisma client is generated
   - Check for unique constraint violations
   - Ensure all required fields are provided

### Reset Database
If you need to start fresh:

```bash
npm run db:reset
npm run db:seed
```

⚠️ **Warning**: This will delete all data!

## Next Steps

1. **Backup Strategy**: Implement regular database backups
2. **Monitoring**: Set up database performance monitoring
3. **Indexing**: Add indexes for frequently queried fields
4. **Archiving**: Implement data archiving for old records
5. **Security**: Regular security audits and updates