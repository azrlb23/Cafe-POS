import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Resetting All Cafe Tables Status to Available ---');

  const occupiedTables = await prisma.cafeTable.findMany({
    where: { status: 'occupied' }
  });

  console.log(`Found ${occupiedTables.length} occupied table(s).`);

  const result = await prisma.cafeTable.updateMany({
    data: { status: 'available' }
  });

  console.log(`✅ Successfully reset ${result.count} table(s) to status 'available'.`);

  const allTables = await prisma.cafeTable.findMany({
    orderBy: { number: 'asc' }
  });

  console.log('\n--- Current Tables Status ---');
  allTables.forEach(t => {
    console.log(`Meja #${t.number}: ${t.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
