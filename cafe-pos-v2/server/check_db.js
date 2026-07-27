import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.count();
  const menus = await prisma.menu.findMany({
    include: {
      category: true,
      menuOptionGroups: {
        include: {
          menuOptionItems: true
        }
      }
    }
  });

  console.log(`Total Categories: ${cats}`);
  console.log(`Total Main Menus: ${menus.length}`);
  console.log('\n--- Sample Menus with Option Groups ---');
  const sample = menus.filter(m => m.menuOptionGroups.length > 0);
  sample.forEach(m => {
    console.log(`\n📌 ${m.name} (Base Price: Rp ${m.basePrice}) [Kategori: ${m.category.name}]`);
    m.menuOptionGroups.forEach(g => {
      console.log(`   Group: ${g.name} (Min: ${g.minSelect}, Max: ${g.maxSelect})`);
      g.menuOptionItems.forEach(i => {
        console.log(`    - ${i.name} (Modifier: Rp ${i.priceModifier})`);
      });
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
