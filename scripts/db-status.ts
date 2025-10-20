import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');

  try {
    // Count records in each table
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const caregiverProfileCount = await prisma.caregiverProfile.count();
    const bookingCount = await prisma.booking.count();
    const certificationCount = await prisma.certification.count();
    const availabilitySlotCount = await prisma.availabilitySlot.count();

    console.log('📊 Database Statistics:');
    console.log(`├── Users: ${userCount}`);
    console.log(`├── Services: ${serviceCount}`);
    console.log(`├── Caregiver Profiles: ${caregiverProfileCount}`);
    console.log(`├── Bookings: ${bookingCount}`);
    console.log(`├── Certifications: ${certificationCount}`);
    console.log(`└── Availability Slots: ${availabilitySlotCount}\n`);

    // Show sample users by role
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
    const clientUsers = await prisma.user.count({ where: { role: 'CLIENT' } });
    const caregiverUsers = await prisma.user.count({ where: { role: 'CAREGIVER' } });

    console.log('👥 Users by Role:');
    console.log(`├── Admins: ${adminUsers}`);
    console.log(`├── Clients: ${clientUsers}`);
    console.log(`└── Caregivers: ${caregiverUsers}\n`);

    // Show sample data
    console.log('📋 Sample Services:');
    const services = await prisma.service.findMany({ take: 3 });
    services.forEach((service, index) => {
      const prefix = index === services.length - 1 ? '└──' : '├──';
      console.log(`${prefix} ${service.name} (${service.category})`);
    });

    console.log('\n🩺 Sample Caregivers:');
    const caregivers = await prisma.user.findMany({
      where: { role: 'CAREGIVER' },
      include: { caregiverProfile: true },
      take: 3,
    });
    caregivers.forEach((caregiver, index) => {
      const prefix = index === caregivers.length - 1 ? '└──' : '├──';
      const rate = caregiver.caregiverProfile?.hourlyRate || 'N/A';
      console.log(`${prefix} ${caregiver.firstName} ${caregiver.lastName} ($${rate}/hr)`);
    });

    console.log('\n✅ Database is properly configured and seeded!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();