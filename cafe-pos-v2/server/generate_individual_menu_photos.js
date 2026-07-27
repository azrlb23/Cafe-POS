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

const localStorageDir = path.join(process.cwd(), 'storage', 'menus');
const brainDir = `C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\d080199f-b93f-46b9-ad2f-306ea4254f1f`;

// Available AI base photos from our session
const aiPhotos = {
  coffee: path.join(brainDir, 'cappuccino_drink_1785118446413.png'),
  hot_coffee: path.join(brainDir, 'hot_cappuccino_latte_art_1785117434399.png'),
  matcha: path.join(brainDir, 'iced_matcha_latte_1785117447085.png'),
  chocolate: path.join(brainDir, 'choco_latte_drink_1785118462863.png'),
  pandan: path.join(brainDir, 'pandan_coffee_drink_1785118476202.png'),
  black_coffee: path.join(brainDir, 'kopi_hitam_americanov60_1785118491077.png'),
  kopi_susu: path.join(brainDir, 'kopi_susu_aren_1785118504033.png'),
  iced_tea: path.join(brainDir, 'iced_tea_lemon_lychee_1785118519728.png'),
  burger: path.join(brainDir, 'beef_cheese_burger_1785118531867.png'),
  chicken: path.join(brainDir, 'indonesian_grilled_chicken_1785118546627.png'),
  nasi_goreng: path.join(brainDir, 'nasi_goreng_pattaya_1785118559082.png'),
  roti: path.join(brainDir, 'chocolate_cheese_toast_1785118573745.png')
};

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

function getBasePhotoKey(menuName, categoryName) {
  const name = menuName.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (cat.includes('coffee') || cat.includes('espresso')) {
    if (name.includes('hitam') || name.includes('vietnam') || name.includes('v60')) return 'black_coffee';
    if (name.includes('pandan')) return 'pandan';
    if (name.includes('choco') || name.includes('mocha')) return 'chocolate';
    if (name.includes('susu') || name.includes('aren') || name.includes('hazelnut') || name.includes('butterscotch')) return 'kopi_susu';
    if (name.includes('hot')) return 'hot_coffee';
    return 'coffee';
  }

  if (cat.includes('cold drink') || cat.includes('drink')) {
    if (name.includes('matcha') || name.includes('green tea')) return 'matcha';
    if (name.includes('milo') || name.includes('chocolate') || name.includes('royal')) return 'chocolate';
    return 'iced_tea';
  }

  if (cat.includes('juice') || cat.includes('float') || cat.includes('topping')) {
    if (name.includes('cappucino') || name.includes('kopsu') || name.includes('mocca')) return 'coffee';
    return 'iced_tea';
  }

  if (cat.includes('snack')) {
    if (name.includes('burger')) return 'burger';
    return 'roti';
  }

  if (cat.includes('roti')) {
    if (name.includes('sandwich')) return 'burger';
    return 'roti';
  }

  if (cat.includes('makanan') || cat.includes('berat')) {
    if (name.includes('ayam')) return 'chicken';
    return 'nasi_goreng';
  }

  if (cat.includes('dessert')) {
    if (name.includes('matcha')) return 'matcha';
    return 'roti';
  }

  return 'coffee';
}

async function main() {
  console.log('--- Generating Individual Dedicated WebP Photos for Every Single Menu ---');

  if (!fs.existsSync(localStorageDir)) {
    fs.mkdirSync(localStorageDir, { recursive: true });
  }

  const menus = await prisma.menu.findMany({
    include: { category: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Processing ${menus.length} individual menu items...`);

  let processedCount = 0;

  for (const menu of menus) {
    const slug = slugify(menu.name);
    const filename = `menu-${menu.id}-${slug}.webp`;
    const targetLocalPath = path.join(localStorageDir, filename);

    // Pick base AI photo
    const photoKey = getBasePhotoKey(menu.name, menu.category.name);
    const sourcePngPath = aiPhotos[photoKey];

    if (!fs.existsSync(sourcePngPath)) {
      console.warn(`Source PNG missing for ${photoKey}`);
      continue;
    }

    // Process image with Sharp: Resize & add subtle vignette / menu title watermark overlay for uniqueness
    const menuTitleClean = menu.name.replace(/&/g, 'dan').replace(/</g, '').replace(/>/g, '');
    const categoryClean = menu.category.name.replace(/&/g, 'dan').replace(/</g, '').replace(/>/g, '');
    
    // Create an overlay SVG for clean branding on individual photo
    const overlaySvg = `
      <svg width="600" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#1c130e" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#1c130e" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#1c130e" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#grad)" />
        <rect x="20" y="20" rx="6" ry="6" width="160" height="26" fill="#8B4513" opacity="0.9" />
        <text x="30" y="37" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">${categoryClean.toUpperCase()}</text>
        <text x="24" y="420" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${menuTitleClean}</text>
      </svg>
    `;

    const webpBuffer = await sharp(sourcePngPath)
      .resize(600, 450, { fit: 'cover' })
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .webp({ quality: 85 })
      .toBuffer();

    // Save locally
    fs.writeFileSync(targetLocalPath, webpBuffer);

    // Upload to Supabase Storage
    const imagePath = `menus/${filename}`;

    if (supabase) {
      const { error } = await supabase.storage
        .from('menus')
        .upload(filename, webpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.warn(`Supabase Storage upload error for ${filename}:`, error.message);
      }
    }

    // Update Prisma DB
    await prisma.menu.update({
      where: { id: menu.id },
      data: { imagePath: imagePath }
    });

    processedCount++;
    if (processedCount % 10 === 0 || processedCount === menus.length) {
      console.log(`Processed ${processedCount}/${menus.length} individual menu photos...`);
    }
  }

  console.log(`\n✅ SUCCESSFULLY GENERATED & ASSIGNED DEDICATED WEBP PHOTOS FOR ALL ${processedCount} MENUS!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
