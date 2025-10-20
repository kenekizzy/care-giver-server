import {
  PrismaClient,
  UserRole,
  ServiceCategory,
  BookingStatus,
  DayOfWeek,
} from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - be careful in production)
  console.log('🧹 Cleaning existing data...');
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatRoomParticipant.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.caregiverService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Create Services
  console.log('📋 Creating services...');
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Personal Care Assistance',
        description:
          'Help with daily personal care activities including bathing, dressing, and grooming',
        category: ServiceCategory.PERSONAL_CARE,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Medication Management',
        description: 'Assistance with medication reminders and administration',
        category: ServiceCategory.MEDICAL_CARE,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Companionship',
        description: 'Social interaction, conversation, and emotional support',
        category: ServiceCategory.COMPANIONSHIP,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Light Housekeeping',
        description:
          'Basic household tasks including cleaning, laundry, and organization',
        category: ServiceCategory.HOUSEHOLD_TASKS,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Transportation Services',
        description:
          'Safe transportation to appointments, shopping, and social activities',
        category: ServiceCategory.TRANSPORTATION,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Dementia Care',
        description:
          "Specialized care for individuals with dementia and Alzheimer's disease",
        category: ServiceCategory.SPECIALIZED_CARE,
      },
    }),
  ]);

  // 2. Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@carehomes.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0001',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // 3. Create Client Users
  console.log('👥 Creating client users...');
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        role: UserRole.CLIENT,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mary.smith@email.com',
        passwordHash: hashedPassword,
        firstName: 'Mary',
        lastName: 'Smith',
        phone: '+1-555-0102',
        role: UserRole.CLIENT,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.johnson@email.com',
        passwordHash: hashedPassword,
        firstName: 'Robert',
        lastName: 'Johnson',
        phone: '+1-555-0103',
        role: UserRole.CLIENT,
        isVerified: true,
      },
    }),
  ]);

  // 4. Create Caregiver Users
  console.log('🩺 Creating caregiver users...');
  const caregivers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.wilson@email.com',
        passwordHash: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '+1-555-0201',
        role: UserRole.CAREGIVER,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'michael.brown@email.com',
        passwordHash: hashedPassword,
        firstName: 'Michael',
        lastName: 'Brown',
        phone: '+1-555-0202',
        role: UserRole.CAREGIVER,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.davis@email.com',
        passwordHash: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Davis',
        phone: '+1-555-0203',
        role: UserRole.CAREGIVER,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.miller@email.com',
        passwordHash: hashedPassword,
        firstName: 'David',
        lastName: 'Miller',
        phone: '+1-555-0204',
        role: UserRole.CAREGIVER,
        isVerified: true,
      },
    }),
  ]);

  // 5. Create Caregiver Profiles
  console.log('📝 Creating caregiver profiles...');
  const caregiverProfiles = await Promise.all([
    prisma.caregiverProfile.create({
      data: {
        userId: caregivers[0].id,
        bio: 'Experienced caregiver with 5 years of experience in elderly care. Specializes in personal care and companionship.',
        experience: 5,
        hourlyRate: 25.0,
        rating: 4.9,
        reviewCount: 127,
        isVerified: true,
      },
    }),
    prisma.caregiverProfile.create({
      data: {
        userId: caregivers[1].id,
        bio: 'Dedicated caregiver specializing in mobility assistance and transportation services.',
        experience: 3,
        hourlyRate: 22.0,
        rating: 4.8,
        reviewCount: 89,
        isVerified: true,
      },
    }),
    prisma.caregiverProfile.create({
      data: {
        userId: caregivers[2].id,
        bio: 'Certified nursing assistant with expertise in medication management and medical care.',
        experience: 7,
        hourlyRate: 30.0,
        rating: 4.95,
        reviewCount: 203,
        isVerified: true,
      },
    }),
    prisma.caregiverProfile.create({
      data: {
        userId: caregivers[3].id,
        bio: "Compassionate caregiver specializing in dementia and Alzheimer's care.",
        experience: 4,
        hourlyRate: 28.0,
        rating: 4.7,
        reviewCount: 156,
        isVerified: true,
      },
    }),
  ]);

  // 6. Create Caregiver Services (Link caregivers to services)
  console.log('🔗 Linking caregivers to services...');
  await Promise.all([
    // Sarah Wilson - Personal Care & Companionship
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[0].id,
        serviceId: services[0].id, // Personal Care
      },
    }),
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[0].id,
        serviceId: services[2].id, // Companionship
      },
    }),
    // Michael Brown - Transportation & Light Housekeeping
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[1].id,
        serviceId: services[4].id, // Transportation
      },
    }),
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[1].id,
        serviceId: services[3].id, // Light Housekeeping
      },
    }),
    // Lisa Davis - Medical Care & Medication Management
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[2].id,
        serviceId: services[1].id, // Medication Management
      },
    }),
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[2].id,
        serviceId: services[0].id, // Personal Care
      },
    }),
    // David Miller - Dementia Care & Companionship
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[3].id,
        serviceId: services[5].id, // Dementia Care
      },
    }),
    prisma.caregiverService.create({
      data: {
        caregiverId: caregiverProfiles[3].id,
        serviceId: services[2].id, // Companionship
      },
    }),
  ]);

  // 7. Create Certifications
  console.log('🏆 Creating certifications...');
  await Promise.all([
    prisma.certification.create({
      data: {
        caregiverId: caregiverProfiles[0].id,
        name: 'CPR Certified',
        issuedBy: 'American Red Cross',
        issuedDate: new Date('2023-01-15'),
        expiryDate: new Date('2025-01-15'),
        isVerified: true,
      },
    }),
    prisma.certification.create({
      data: {
        caregiverId: caregiverProfiles[0].id,
        name: 'First Aid Certified',
        issuedBy: 'American Red Cross',
        issuedDate: new Date('2023-01-15'),
        expiryDate: new Date('2025-01-15'),
        isVerified: true,
      },
    }),
    prisma.certification.create({
      data: {
        caregiverId: caregiverProfiles[2].id,
        name: 'CNA License',
        issuedBy: 'State Board of Nursing',
        issuedDate: new Date('2020-06-01'),
        expiryDate: new Date('2025-06-01'),
        isVerified: true,
      },
    }),
    prisma.certification.create({
      data: {
        caregiverId: caregiverProfiles[3].id,
        name: 'Dementia Care Specialist',
        issuedBy: "Alzheimer's Association",
        issuedDate: new Date('2022-03-10'),
        expiryDate: new Date('2025-03-10'),
        isVerified: true,
      },
    }),
  ]);

  // 8. Create Availability Slots
  console.log('📅 Creating availability slots...');
  const availabilityData = [
    // Sarah Wilson - Monday to Friday, 8 AM to 6 PM
    {
      caregiverId: caregiverProfiles[0].id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '08:00',
      endTime: '18:00',
    },
    {
      caregiverId: caregiverProfiles[0].id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: '08:00',
      endTime: '18:00',
    },
    {
      caregiverId: caregiverProfiles[0].id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: '08:00',
      endTime: '18:00',
    },
    {
      caregiverId: caregiverProfiles[0].id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: '08:00',
      endTime: '18:00',
    },
    {
      caregiverId: caregiverProfiles[0].id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: '08:00',
      endTime: '18:00',
    },

    // Michael Brown - Tuesday to Saturday, 9 AM to 5 PM
    {
      caregiverId: caregiverProfiles[1].id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      caregiverId: caregiverProfiles[1].id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      caregiverId: caregiverProfiles[1].id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      caregiverId: caregiverProfiles[1].id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      caregiverId: caregiverProfiles[1].id,
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: '09:00',
      endTime: '17:00',
    },
  ];

  await Promise.all(
    availabilityData.map((slot) =>
      prisma.availabilitySlot.create({ data: slot }),
    ),
  );

  // 9. Create Sample Bookings
  console.log('📅 Creating sample bookings...');
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        clientId: clients[0].id,
        caregiverId: caregivers[0].id,
        serviceId: services[0].id,
        scheduledDate: new Date('2024-12-20'),
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        hourlyRate: 25.0,
        totalAmount: 75.0,
        location: '123 Main St, New York, NY',
        notes: 'Client needs assistance with morning routine',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0199',
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    }),
    prisma.booking.create({
      data: {
        clientId: clients[1].id,
        caregiverId: caregivers[2].id,
        serviceId: services[1].id,
        scheduledDate: new Date('2024-12-21'),
        startTime: '14:00',
        endTime: '16:00',
        duration: 120,
        hourlyRate: 30.0,
        totalAmount: 60.0,
        location: '456 Oak Ave, Brooklyn, NY',
        notes: 'Medication management and health monitoring',
        status: BookingStatus.PENDING,
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:
  - ${services.length} services
  - 1 admin user
  - ${clients.length} client users  
  - ${caregivers.length} caregiver users
  - ${caregiverProfiles.length} caregiver profiles
  - ${bookings.length} sample bookings
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
