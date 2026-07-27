import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const menuData = [
  {
    category: 'Coffee & Espresso',
    slug: 'coffee-espresso',
    items: [
      { name: 'Butterscotch (Ice)', price: 25000, desc: 'Kopi latte rasa butterscotch manis gurih dingin' },
      { name: 'Cappucino (Ice)', price: 18000, desc: 'Espresso dengan susu dan foam dingin' },
      { name: 'Cappucino (Hot)', price: 15000, desc: 'Espresso dengan susu hangat dan foam' },
      { name: 'Choco Latte (Ice)', price: 18000, desc: 'Perpaduan kopi espresso dan coklat nikmat dingin' },
      { name: 'Choco Latte (Hot)', price: 15000, desc: 'Perpaduan kopi espresso dan coklat nikmat hangat' },
      { name: 'Creamy Latte (Ice)', price: 18000, desc: 'Kopi susu dengan rasa ekstra creamy dingin' },
      { name: 'Creamy Latte (Hot)', price: 15000, desc: 'Kopi susu dengan rasa ekstra creamy hangat' },
      { name: 'Coffe Pandan (Ice)', price: 25000, desc: 'Kopi susu dipadu sirup pandan wangi dingin' },
      { name: 'Hazelnut Caramel (Ice)', price: 25000, desc: 'Kopi dengan paduan sirup hazelnut dan karamel' },
      { name: 'Kopi Hitam Aladen (Ice)', price: 20000, desc: 'Kopi hitam khas Aladen disajikan dingin' },
      { name: 'Kopi Hitam Aladen (Hot)', price: 16000, desc: 'Kopi hitam khas Aladen disajikan hangat' },
      { name: 'Kopi Susu Aladen (Ice)', price: 25000, desc: 'Kopi susu khas Aladen dingin yang creamy' },
      { name: 'Kopi Susu Aladen (Hot)', price: 18000, desc: 'Kopi susu khas Aladen hangat' },
      { name: 'Kopi Gula Aren (Ice)', price: 23000, desc: 'Kopi susu gula aren asli manis alami' },
      { name: 'Mocha (Ice)', price: 18000, desc: 'Kopi espresso dengan rasa coklat dingin' },
      { name: 'Mocha (Hot)', price: 15000, desc: 'Kopi espresso dengan rasa coklat hangat' },
      { name: 'Vietnam Drip (V60) (Hot)', price: 25000, desc: 'Kopi manual brew dripper hangat' },
      { name: 'White Coffe (Ice)', price: 18000, desc: 'White coffee lembut disajikan dingin' },
      { name: 'White Coffe (Hot)', price: 15000, desc: 'White coffee lembut disajikan hangat' }
    ]
  },
  {
    category: 'Cold Drink',
    slug: 'cold-drink',
    items: [
      { name: 'Air Mineral', price: 7000, desc: 'Air mineral dingin/normal' },
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
      { name: 'Red Velvet', price: 22000, desc: 'Minuman rasa red velvet manis dan gurih' },
      { name: 'Royal Chocolate', price: 20000, desc: 'Coklat pekat nikmat khas cafe' },
      { name: 'Sogem', price: 20000, desc: 'Soda gembira manis menyegarkan' },
      { name: 'Suka Jando', price: 20000, desc: 'Minuman rasa spesial Denjavas' },
      { name: 'Strawberry', price: 20000, desc: 'Minuman susu rasa buah strawberry' },
      { name: 'Taro', price: 20000, desc: 'Minuman rasa taro manis creamy' },
      { name: 'Thai Tea', price: 20000, desc: 'Es teh khas thailand beraroma rempah manis' },
      { name: 'Wedang Jahe', price: 16000, desc: 'Minuman jahe hangat tradisional' },
      { name: 'Yakult Manggo', price: 20000, desc: 'Perpaduan yakult dan sirup mangga segar' },
      { name: 'Yakult Cocopan', price: 20000, desc: 'Perpaduan yakult dan cocopandan' },
      { name: 'Yakult Melon', price: 20000, desc: 'Perpaduan yakult dan sirup melon' }
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
      { name: 'Roti Panggang Coklat', price: 15000, desc: 'Roti bakar isi coklat leleh' },
      { name: 'Roti Panggang Keju Coklat', price: 15000, desc: 'Roti bakar isi keju dan coklat leleh' },
      { name: 'Roti Panggang Keju Susu', price: 15000, desc: 'Roti bakar isi keju dan susu kental manis' },
      { name: 'Roti Goreng Coklat', price: 18000, desc: 'Roti goreng krispi isian coklat lumer' },
      { name: 'Roti Goreng Keju Coklat', price: 18000, desc: 'Roti goreng krispi isian keju coklat' },
      { name: 'Roti Goreng Keju Susu', price: 18000, desc: 'Roti goreng krispi isian keju susu' },
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
      { name: 'Ayam Panggang Madu Terasi', price: 37000, desc: 'Ayam panggang bumbu madu disajikan dengan Sambal Terasi khas' },
      { name: 'Ayam Panggang Madu Hijau', price: 37000, desc: 'Ayam panggang bumbu madu disajikan dengan Sambal Hijau pedas manis' },
      { name: 'Ayam Panggang Madu Matah', price: 37000, desc: 'Ayam panggang bumbu madu disajikan dengan Sambal Matah segar' },
      { name: 'Ayam Panggang Rempah Terasi', price: 37000, desc: 'Ayam panggang bumbu rempah kaya rasa dengan Sambal Terasi' },
      { name: 'Ayam Panggang Rempah Hijau', price: 37000, desc: 'Ayam panggang bumbu rempah dengan Sambal Hijau' },
      { name: 'Ayam Panggang Rempah Matah', price: 37000, desc: 'Ayam panggang bumbu rempah dengan Sambal Matah' },
      { name: 'Ayam Penyet Aladen Terasi', price: 35000, desc: 'Ayam penyet khas Aladen disajikan dengan Sambal Terasi' },
      { name: 'Ayam Penyet Aladen Hijau', price: 35000, desc: 'Ayam penyet khas Aladen disajikan dengan Sambal Hijau' },
      { name: 'Ayam Penyet Aladen Matah', price: 35000, desc: 'Ayam penyet khas Aladen disajikan dengan Sambal Matah' },
      { name: 'Nasi Goreng Original', price: 23000, desc: 'Nasi goreng khas cafe dengan telur dan acar' },
      { name: 'Nasi Goreng Iwake', price: 27000, desc: 'Nasi goreng dengan campuran ikan teri/iwake gurih' },
      { name: 'Nasi Goreng Pattaya', price: 30000, desc: 'Nasi goreng dibungkus dadar telur tipis lezat' },
      { name: 'Mie Goreng Level 1', price: 18000, desc: 'Mie goreng pedas (1 Cabai)' },
      { name: 'Mie Goreng Level 2', price: 20000, desc: 'Mie goreng pedas (2 Cabai)' },
      { name: 'Mie Goreng Level 3', price: 22000, desc: 'Mie goreng ekstra pedas (3 Cabai)' },
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
  console.log('--- Starting Denjavas Menu Database Seeding ---');

  // Option: delete dummy menus first
  console.log('Cleaning up placeholder data...');
  await prisma.orderItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.menuOptionGroup.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();

  let totalCategories = 0;
  let totalMenus = 0;

  for (const catGroup of menuData) {
    const category = await prisma.category.create({
      data: {
        name: catGroup.category,
        slug: catGroup.slug
      }
    });
    totalCategories++;
    console.log(`Created Category [ID ${category.id}]: ${category.name}`);

    for (const item of catGroup.items) {
      await prisma.menu.create({
        data: {
          categoryId: category.id,
          name: item.name,
          description: item.desc,
          basePrice: item.price,
          isActive: true,
          imagePath: null // No image initially as requested by user
        }
      });
      totalMenus++;
    }
  }

  console.log(`\n✅ SUCCESSFULLY SEEDED TO SUPABASE DB!`);
  console.log(`Total Categories: ${totalCategories}`);
  console.log(`Total Menu Items: ${totalMenus}`);
}

main().catch(err => {
  console.error('Seeding error:', err);
}).finally(() => prisma.$disconnect());
