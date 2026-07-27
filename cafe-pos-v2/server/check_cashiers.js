import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Daftar User & PIN Kasir ---');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      pin: true,
      role: true
    },
    orderBy: { id: 'asc' }
  });

  console.log(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
