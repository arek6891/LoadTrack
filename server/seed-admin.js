const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('logwin', 10);
  try {
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword, role: 'ADMIN' },
      create: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created/updated successfully:', user.username);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
