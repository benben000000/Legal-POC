import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@legal.com' },
    update: {},
    create: {
      email: 'admin@legal.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Attorney',
      role: 'LEAD_ATTORNEY',
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@legal.com' },
    update: {},
    create: {
      email: 'staff@legal.com',
      passwordHash,
      firstName: 'Staff',
      lastName: 'Member',
      role: 'STAFF',
      isActive: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Admin:', admin.email);
  console.log('Staff:', staff.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
