import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const brainDir = `C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\d080199f-b93f-46b9-ad2f-306ea4254f1f`;
const localStorageDir = path.join(process.cwd(), 'storage', 'menus');

// Source PNG files mapped to friendly names
const imageMap = {
  'cappuccino.webp': 'cappuccino_drink_1785118446413.png',
  'hot_cappuccino.webp': 'hot_cappuccino_latte_art_1785117434399.png',
  'matcha_latte.webp': 'iced_matcha_latte_1785117447085.png',
  'choco_latte.webp': 'choco_latte_drink_1785118462863.png',
  'pandan_coffee.webp': 'pandan_coffee_drink_1785118476202.png',
  'kopi_hitam.webp': 'kopi_hitam_americanov60_1785118491077.png',
  'kopi_susu_aren.webp': 'kopi_susu_aren_1785118504033.png',
  'iced_tea.webp': 'iced_tea_lemon_lychee_1785118519728.png',
  'burger.webp': 'beef_cheese_burger_1785118531867.png',
  'ayam_panggang.webp': 'indonesian_grilled_chicken_1785118546627.png',
  'nasi_goreng.webp': 'nasi_goreng_pattaya_1785118559082.png',
  'roti_bakar.webp': 'chocolate_cheese_toast_1785118573745.png'
};

// Logic to assign appropriate webp photo to each menu item based on name & category
function selectWebpImage(menuName, categoryName) {
  const name = menuName.toLowerCase();
  const cat = categoryName.toLowerCase();

  // Coffee & Espresso
  if (cat.includes('coffee') || cat.includes('espresso')) {
    if (name.includes('hitam') || name.includes('vietnam') || name.includes('v60')) return 'kopi_hitam.webp';
    if (name.includes('pandan')) return 'pandan_coffee.webp';
    if (name.includes('choco') || name.includes('mocha')) return 'choco_latte.webp';
    if (name.includes('susu') || name.includes('aren') || name.includes('hazelnut') || name.includes('butterscotch')) return 'kopi_susu_aren.webp';
    if (name.includes('hot')) return 'hot_cappuccino.webp';
    return 'cappuccino.webp';
  }

  // Cold Drinks
  if (cat.includes('cold drink') || cat.includes('drink')) {
    if (name.includes('matcha') || name.includes('green tea')) return 'matcha_latte.webp';
    if (name.includes('tea') || name.includes('teh') || name.includes('mineral')) return 'iced_tea.webp';
    if (name.includes('milo') || name.includes('chocolate') || name.includes('royal')) return 'choco_latte.webp';
    return 'iced_tea.webp';
  }

  // Juice & Float
  if (cat.includes('juice') || cat.includes('float') || cat.includes('topping')) {
    if (name.includes('cappucino') || name.includes('kopsu') || name.includes('mocca')) return 'cappuccino.webp';
    return 'iced_tea.webp';
  }

  // Snack
  if (cat.includes('snack')) {
    if (name.includes('burger')) return 'burger.webp';
    if (name.includes('roti') || name.includes('pisang') || name.includes('oreo')) return 'roti_bakar.webp';
    return 'burger.webp';
  }

  // Varian Roti
  if (cat.includes('roti')) {
    if (name.includes('sandwich')) return 'burger.webp';
    return 'roti_bakar.webp';
  }

  // Makanan Berat
  if (cat.includes('makanan') || cat.includes('berat')) {
    if (name.includes('ayam')) return 'ayam_panggang.webp';
    if (name.includes('nasi') || name.includes('mie')) return 'nasi_goreng.webp';
    return 'nasi_goreng.webp';
  }

  // Desserts
  if (cat.includes('dessert')) {
    if (name.includes('matcha')) return 'matcha_latte.webp';
    return 'roti_bakar.webp';
  }

  return 'cappuccino.webp';
}

async function main() {
  console.log('--- Starting WebP Compression & Supabase Upload ---');

  if (!fs.existsSync(localStorageDir)) {
    fs.mkdirSync(localStorageDir, { recursive: true });
  }

  // Step 1: Compress PNGs to WebP and save locally + upload to Supabase
  for (const [webpName, pngName] of Object.entries(imageMap)) {
    const pngPath = path.join(brainDir, pngName);
    const webpPath = path.join(localStorageDir, webpName);

    if (!fs.existsSync(pngPath)) {
      console.warn(`PNG source file not found: ${pngPath}`);
      continue;
    }

    // Compress to WebP via sharp
    const webpBuffer = await sharp(pngPath)
      .webp({ quality: 82 })
      .toBuffer();

    fs.writeFileSync(webpPath, webpBuffer);
    console.log(`Compressed: ${webpName} (${(webpBuffer.length / 1024).toFixed(1)} KB) -> saved to ${webpPath}`);

    // Upload to Supabase Storage if configured
    if (supabase) {
      const { error } = await supabase.storage
        .from('menus')
        .upload(webpName, webpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.warn(`Supabase Storage upload warning for ${webpName}:`, error.message);
      } else {
        console.log(`Uploaded to Supabase Storage: menus/${webpName}`);
      }
    }
  }

  // Step 2: Assign image_path to all menus in Supabase DB
  console.log('\nAssigning WebP image_paths to all menu items in Supabase DB...');
  const menus = await prisma.menu.findMany({ include: { category: true } });

  let updatedCount = 0;
  for (const menu of menus) {
    const webpFilename = selectWebpImage(menu.name, menu.category.name);
    const imagePath = `menus/${webpFilename}`;

    await prisma.menu.update({
      where: { id: menu.id },
      data: { imagePath: imagePath }
    });
    updatedCount++;
  }

  console.log(`\n✅ SUCCESSFULLY COMPRESSED, UPLOADED & UPDATED DATABASE!`);
  console.log(`Total Menu Items Updated with WebP Images: ${updatedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
