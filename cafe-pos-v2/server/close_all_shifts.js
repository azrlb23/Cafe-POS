import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Closing All Open Cashier Shifts & Sessions ---');

  const openShifts = await prisma.shift.findMany({
    where: { closedAt: null },
    include: { user: true }
  });

  console.log(`Found ${openShifts.length} open shift(s).`);

  const now = new Date();
  let closedCount = 0;

  for (const shift of openShifts) {
    const expectedClosingCash =
      Number(shift.openingCash) +
      Number(shift.totalCashSales) -
      Number(shift.totalPettyCash);

    await prisma.shift.update({
      where: { id: shift.id },
      data: {
        closedAt: now,
        closingCash: expectedClosingCash,
        expectedClosingCash: expectedClosingCash,
        notes: 'Ditutup otomatis oleh Admin System'
      }
    });

    console.log(`✅ Closed Shift ID ${shift.id} for Kasir: ${shift.user?.name || 'Unknown'}`);
    closedCount++;
  }

  // Clear session table in Postgres if present
  try {
    const result = await prisma.$executeRawUnsafe(`TRUNCATE TABLE session CASCADE;`);
    console.log('✅ Cleared all active web session tokens in database.');
  } catch (err) {
    console.log('Info: session table truncate handled (session table in memory or not created yet).');
  }

  console.log(`\n🎉 Selesai! Total ${closedCount} shift kasir telah ditutup dan semua sesi dibersihkan.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
