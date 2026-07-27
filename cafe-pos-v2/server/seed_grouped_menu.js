import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const groupedMenuData = [
  {
    category: 'Coffee & Espresso',
    slug: 'coffee-espresso',
    items: [
      { name: 'Butterscotch', price: 25000, desc: 'Kopi latte rasa butterscotch manis gurih dingin' },
      {
        name: 'Cappucino',
        price: 15000,
        desc: 'Espresso dengan susu dan foam lembut disajikan hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 3000 }
            ]
          }
        ]
      },
      {
        name: 'Choco Latte',
        price: 15000,
        desc: 'Perpaduan kopi espresso dan coklat nikmat hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 3000 }
            ]
          }
        ]
      },
      {
        name: 'Creamy Latte',
        price: 15000,
        desc: 'Kopi susu dengan rasa ekstra creamy hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 3000 }
            ]
          }
        ]
      },
      { name: 'Coffe Pandan', price: 25000, desc: 'Kopi susu dipadu sirup pandan wangi dingin' },
      { name: 'Hazelnut Caramel', price: 25000, desc: 'Kopi dengan paduan sirup hazelnut dan karamel' },
      {
        name: 'Kopi Hitam Aladen',
        price: 16000,
        desc: 'Kopi hitam khas Aladen disajikan hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 4000 }
            ]
          }
        ]
      },
      {
        name: 'Kopi Susu Aladen',
        price: 18000,
        desc: 'Kopi susu khas Aladen yang nikmat hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 7000 }
            ]
          }
        ]
      },
      { name: 'Kopi Gula Aren', price: 23000, desc: 'Kopi susu gula aren asli manis alami' },
      {
        name: 'Mocha',
        price: 15000,
        desc: 'Kopi espresso dengan rasa coklat hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 3000 }
            ]
          }
        ]
      },
      { name: 'Vietnam Drip (V60)', price: 25000, desc: 'Kopi manual brew dripper hangat' },
      {
        name: 'White Coffe',
        price: 15000,
        desc: 'White coffee lembut disajikan hot/ice',
        optionGroups: [
          {
            name: 'Penyajian',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Hot', priceModifier: 0 },
              { name: 'Ice', priceModifier: 3000 }
            ]
          }
        ]
      }
    ]
  },
  {
    category: 'Cold Drink',
    slug: 'cold-drink',
    items: [
      { name: 'Air Mineral', price: 7000, desc: 'Air mineral segar' },
      { name: 'Es Teh', price: 8000, desc: 'Es teh manis segar' },
      { name: 'Es Jeruk', price: 10000, desc: 'Es jeruk peras manis' },
      { name: 'Caramel Matcha Latte', price: 25000, desc: 'Matcha green tea dengan topping karamel' },
      { name: 'Bubble Gum', price: 20000, desc: 'Minuman manis perisa bubble gum' },
      { name: 'Fansus (Fanta Susu)', price: 20000, desc: 'Kombinasi fanta merah dan susu kental manis' },
      { name: 'Green Tea', price: 20000, desc: 'Es green tea milky & creamy' },
      { name: 'Lemon Tea', price: 18000, desc: 'Es teh dengan perasan lemon segar' },
      { name: 'Leci Tea', price: 20000, desc: 'Es teh dengan aroma leci manis' },
      { name: 'Milo', price: 20000, desc: 'Minuman coklat malt milo dingin' },
      { name: 'Ocean Blue', price: 20000, desc: 'Minuman mocktail bersoda rasa biru segar' },
      { name: 'Orange Sparkle', price: 20000, desc: 'Minuman jeruk bersoda segar' },
      { name: 'Oreo', price: 20000, desc: 'Minuman susu blended rasa biskuit oreo' },
      { name: 'Rainbow Squash', price: 20000, desc: 'Squash bersoda dengan sirup berwarna-warni' },
      { name: 'Red Velvet', price: 22000, desc: 'Minuman rasa red velvet manis gurih' },
      { name: 'Royal Chocolate', price: 20000, desc: 'Coklat pekat nikmat khas cafe' },
      { name: 'Sogem', price: 20000, desc: 'Soda gembira manis menyegarkan' },
      { name: 'Suka Jando', price: 20000, desc: 'Minuman rasa spesial Denjavas' },
      { name: 'Strawberry', price: 20000, desc: 'Minuman susu rasa buah strawberry' },
      { name: 'Taro', price: 20000, desc: 'Minuman rasa taro manis creamy' },
      { name: 'Thai Tea', price: 20000, desc: 'Es teh khas thailand beraroma rempah manis' },
      { name: 'Wedang Jahe', price: 16000, desc: 'Minuman jahe hangat tradisional' },
      {
        name: 'Yakult Series',
        price: 20000,
        desc: 'Minuman kesegaran yakult dengan pilihan varian rasa buah',
        optionGroups: [
          {
            name: 'Varian Rasa',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Manggo', priceModifier: 0 },
              { name: 'Cocopan', priceModifier: 0 },
              { name: 'Melon', priceModifier: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    category: 'Juice',
    slug: 'juice',
    items: [
      { name: 'Juice Apel', price: 20000, desc: 'Jus buah apel segar' },
      { name: 'Juice Alpukat', price: 20000, desc: 'Jus buah alpukat kental nikmat' },
      { name: 'Juice Buah Naga', price: 20000, desc: 'Jus buah naga merah kaya vitamin' },
      { name: 'Juice Melon', price: 20000, desc: 'Jus buah melon manis segar' },
      { name: 'Juice Mangga', price: 20000, desc: 'Jus buah mangga arumanis' },
      { name: 'Juice Semangka', price: 20000, desc: 'Jus buah semangka merah melepas dahaga' },
      { name: 'Juice Tomat', price: 20000, desc: 'Jus tomat segar kaya nutrisi' },
      { name: 'Juice Wortel', price: 20000, desc: 'Jus wortel murni bagus untuk kesehatan' },
      { name: 'Juice Mix', price: 25000, desc: 'Jus kombinasi buah pilihan' }
    ]
  },
  {
    category: 'Float',
    slug: 'float',
    items: [
      { name: 'Cappucino Float', price: 27000, desc: 'Kopi cappucino dengan topping es krim' },
      { name: 'Cocopandan Float', price: 27000, desc: 'Minuman cocopandan topping es krim' },
      { name: 'Kopsu Float', price: 27000, desc: 'Kopi susu manis dengan topping es krim' },
      { name: 'Lemon Float', price: 27000, desc: 'Lemonade segar dengan topping es krim lembut' },
      { name: 'Mocca Float', price: 27000, desc: 'Kopi mocca manis dengan topping es krim' }
    ]
  },
  {
    category: 'Double Drink Topping',
    slug: 'double-drink-topping',
    items: [
      { name: 'Cappucino Top Mix', price: 28000, desc: 'Cappucino dengan double topping melimpah' },
      { name: 'Chocolate Top Mix', price: 28000, desc: 'Minuman coklat dengan double topping' },
      { name: 'Mocca Top Mix', price: 28000, desc: 'Kopi mocca dengan double topping pilihan' },
      { name: 'Milo Top Mix', price: 28000, desc: 'Milo manis dengan double topping nikmat' },
      { name: 'Oreo Top Mix', price: 28000, desc: 'Oreo drink dengan double topping biskuit' },
      { name: 'Strawberry Top Mix', price: 28000, desc: 'Strawberry drink dengan double topping' }
    ]
  },
  {
    category: 'Snack',
    slug: 'snack',
    items: [
      { name: 'Beef Burger', price: 26000, desc: 'Burger daging sapi empuk dengan saus' },
      { name: 'Beef Cheese Burger', price: 28000, desc: 'Burger daging sapi dengan keju lumer' },
      { name: 'Burger Chiken', price: 23000, desc: 'Burger daging ayam crispy' },
      { name: 'Burger Chiken Cheese', price: 26000, desc: 'Burger ayam crispy dengan keju' },
      { name: 'Big Sosis', price: 20000, desc: 'Sosis ukuran besar dipanggang/goreng' },
      { name: 'Bakso Bakar', price: 18000, desc: 'Bakso sapi bakar dengan bumbu kecap manis pedas' },
      { name: 'Chiken Nugget', price: 16000, desc: 'Nugget ayam goreng renyah' },
      { name: 'Empek-empek', price: 27000, desc: 'Pempek khas Palembang dengan kuah cuko manis asam pedas' },
      { name: 'Kentang Ori', price: 20000, desc: 'Kentang goreng original renyah' },
      { name: 'Kentang Aladen', price: 22000, desc: 'Kentang goreng bumbu rahasia khas Aladen' },
      { name: 'Oreo Goreng', price: 16000, desc: 'Oreo dibalut adonan crispy goreng manis' },
      { name: 'Onion Ring', price: 20000, desc: 'Bawang bombay goreng tepung renyah' },
      { name: 'Pisang Keju', price: 16000, desc: 'Pisang manis dengan parutan keju melimpah' },
      { name: 'Pisang Krispy', price: 18000, desc: 'Pisang goreng balut tepung krispi' },
      { name: 'Singkong Goreng', price: 22000, desc: 'Singkong goreng gurih dan empuk' },
      { name: 'Siomay Goreng', price: 16000, desc: 'Siomay ayam/ikan goreng krispi' },
      { name: 'Snack Platter', price: 27000, desc: 'Kombinasi kentang, sosis, dan nugget goreng' },
      { name: 'Sosis Goreng', price: 16000, desc: 'Sosis potong goreng mekar' },
      { name: 'Tahu Bakso', price: 16000, desc: 'Tahu isian adonan bakso olahan daging' },
      { name: 'Tempe Mendoan', price: 18000, desc: 'Tempe mendoan hangat dengan cocolan kecap cabai' },
      { name: 'Mini Sosis', price: 20000, desc: 'Porsi sosis mini bites gurih' }
    ]
  },
  {
    category: 'Varian Roti',
    slug: 'varian-roti',
    items: [
      {
        name: 'Roti Panggang',
        price: 15000,
        desc: 'Roti bakar lezat dengan aneka pilihan isian/topping',
        optionGroups: [
          {
            name: 'Varian Topping',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Coklat', priceModifier: 0 },
              { name: 'Keju Coklat', priceModifier: 0 },
              { name: 'Keju Susu', priceModifier: 0 }
            ]
          }
        ]
      },
      {
        name: 'Roti Goreng',
        price: 18000,
        desc: 'Roti goreng krispi dengan aneka pilihan isian lumer',
        optionGroups: [
          {
            name: 'Varian Topping',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Coklat', priceModifier: 0 },
              { name: 'Keju Coklat', priceModifier: 0 },
              { name: 'Keju Susu', priceModifier: 0 }
            ]
          }
        ]
      },
      { name: 'Sandwich', price: 22000, desc: 'Sandwich roti tawar isi telur dan sayur' },
      { name: 'Cheese Sandwich', price: 25000, desc: 'Sandwich dengan keju leleh ekstra' },
      { name: 'Club Sandwich', price: 28000, desc: 'Sandwich komplit berlapis daging dan keju' },
      { name: 'Sosis Gulung', price: 20000, desc: 'Roti/pastry gulung isian sosis gurih' },
      { name: 'Banana Rolls', price: 20000, desc: 'Roti gulung isian pisang dan coklat' }
    ]
  },
  {
    category: 'Makanan Berat',
    slug: 'makanan-berat',
    items: [
      {
        name: 'Ayam Panggang Madu',
        price: 37000,
        desc: 'Ayam panggang bumbu madu disajikan dengan pilihan sambal khas',
        optionGroups: [
          {
            name: 'Pilihan Sambal',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Sambal Terasi', priceModifier: 0 },
              { name: 'Sambal Hijau', priceModifier: 0 },
              { name: 'Sambal Matah', priceModifier: 0 }
            ]
          }
        ]
      },
      {
        name: 'Ayam Panggang Rempah',
        price: 37000,
        desc: 'Ayam panggang bumbu rempah kaya rasa disajikan dengan pilihan sambal',
        optionGroups: [
          {
            name: 'Pilihan Sambal',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Sambal Terasi', priceModifier: 0 },
              { name: 'Sambal Hijau', priceModifier: 0 },
              { name: 'Sambal Matah', priceModifier: 0 }
            ]
          }
        ]
      },
      {
        name: 'Ayam Penyet Aladen',
        price: 35000,
        desc: 'Ayam penyet khas Aladen disajikan dengan pilihan sambal khas',
        optionGroups: [
          {
            name: 'Pilihan Sambal',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Sambal Terasi', priceModifier: 0 },
              { name: 'Sambal Hijau', priceModifier: 0 },
              { name: 'Sambal Matah', priceModifier: 0 }
            ]
          }
        ]
      },
      { name: 'Nasi Goreng Original', price: 23000, desc: 'Nasi goreng khas cafe dengan telur dan acar' },
      { name: 'Nasi Goreng Iwake', price: 27000, desc: 'Nasi goreng dengan campuran ikan teri/iwake gurih' },
      { name: 'Nasi Goreng Pattaya', price: 30000, desc: 'Nasi goreng dibungkus dadar telur tipis lezat' },
      {
        name: 'Mie Goreng Pedas',
        price: 18000,
        desc: 'Mie goreng dengan pilihan tingkat kepedasan',
        optionGroups: [
          {
            name: 'Level Pedas',
            minSelect: 1,
            maxSelect: 1,
            options: [
              { name: 'Level 1 (1 Cabai)', priceModifier: 0 },
              { name: 'Level 2 (2 Cabai)', priceModifier: 2000 },
              { name: 'Level 3 (3 Cabai)', priceModifier: 4000 }
            ]
          }
        ]
      },
      { name: 'Mie Kuah', price: 17000, desc: 'Mie kuah gurih hangat dengan telur dan sayuran' },
      { name: 'Mie Goreng', price: 17000, desc: 'Mie goreng reguler rasa spesial' }
    ]
  },
  {
    category: 'Desserts',
    slug: 'desserts',
    items: [
      { name: 'Ice Cream Regal Caramel', price: 25000, desc: 'Es krim manis topping biskuit regal & saus karamel' },
      { name: 'Ice Cream Oreo', price: 25000, desc: 'Es krim vanila topping remahan oreo lezat' },
      { name: 'Ice Cream Matcha', price: 25000, desc: 'Es krim rasa matcha green tea jepang' }
    ]
  }
];

async function main() {
  console.log('--- Starting Grouped Denjavas Menu Database Seeding ---');

  console.log('Cleaning up existing menu and category tables...');
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.menuOptionItem.deleteMany();
  await prisma.menuOptionGroup.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();

  let totalCategories = 0;
  let totalMenus = 0;
  let totalGroups = 0;
  let totalOptions = 0;

  for (const catGroup of groupedMenuData) {
    const category = await prisma.category.create({
      data: {
        name: catGroup.category,
        slug: catGroup.slug
      }
    });
    totalCategories++;
    console.log(`Created Category [ID ${category.id}]: ${category.name}`);

    for (const item of catGroup.items) {
      const menu = await prisma.menu.create({
        data: {
          categoryId: category.id,
          name: item.name,
          description: item.desc,
          basePrice: item.price,
          isActive: true,
          imagePath: null
        }
      });
      totalMenus++;

      if (item.optionGroups && item.optionGroups.length > 0) {
        for (const grp of item.optionGroups) {
          const groupRecord = await prisma.menuOptionGroup.create({
            data: {
              menuId: menu.id,
              name: grp.name,
              minSelect: grp.minSelect,
              maxSelect: grp.maxSelect
            }
          });
          totalGroups++;

          for (const opt of grp.options) {
            await prisma.menuOptionItem.create({
              data: {
                menuOptionGroupId: groupRecord.id,
                name: opt.name,
                priceModifier: opt.priceModifier,
                isAvailable: true
              }
            });
            totalOptions++;
          }
        }
      }
    }
  }

  console.log(`\n✅ SUCCESSFULLY RE-STRUCTURED AND SEEDED TO SUPABASE DB!`);
  console.log(`Total Categories: ${totalCategories}`);
  console.log(`Total Main Menu Items: ${totalMenus}`);
  console.log(`Total Option Groups: ${totalGroups}`);
  console.log(`Total Option Items (Variants): ${totalOptions}`);
}

main().catch(err => {
  console.error('Seeding error:', err);
}).finally(() => prisma.$disconnect());
