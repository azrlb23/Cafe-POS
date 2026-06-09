import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { deductStockFromOrder } from '../services/inventoryService.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting clean seed database with historical transaction data...');

  // ==========================================
  // 1. CLEANUP ALL EXISTING TABLES (order matters for FK constraints)
  // ==========================================
  console.log('Wiping existing data...');
  
  // Transactions and logs
  await prisma.stockMutation.deleteMany({});
  await prisma.orderItemOption.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.pettyCash.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.activityLog.deleteMany({});
  
  // Recipes & Menu structures
  await prisma.recipe.deleteMany({});
  await prisma.menuOptionItem.deleteMany({});
  await prisma.menuOptionGroup.deleteMany({});
  await prisma.menu.deleteMany({});
  
  // Core tables
  await prisma.rawMaterial.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.cafeTable.deleteMany({});
  await prisma.storeSetting.deleteMany({});

  console.log('Database wiped successfully.');

  // ==========================================
  // 2. SEED USERS
  // ==========================================
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password', 10);
  
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@denjavas.com',
      password: passwordHash,
      pin: '123456',
      role: 'admin',
    },
  });

  const cashiers = [
    { name: 'Kasir 1', email: 'kasir@denjavas.com', pin: '654321' },
    { name: 'Kasir 2', email: 'kasir2@denjavas.com', pin: '111222' },
    { name: 'Kasir 3', email: 'kasir3@denjavas.com', pin: '333444' },
  ];

  const cashierUsers = [];
  for (const cashier of cashiers) {
    const user = await prisma.user.create({
      data: {
        name: cashier.name,
        email: cashier.email,
        password: passwordHash,
        pin: cashier.pin,
        role: 'kasir',
      },
    });
    cashierUsers.push(user);
  }

  // ==========================================
  // 3. SEED CATEGORIES
  // ==========================================
  console.log('Seeding categories...');
  const catCoffee = await prisma.category.create({ data: { name: 'Coffee', slug: 'coffee' } });
  const catNonCoffee = await prisma.category.create({ data: { name: 'Non-Coffee', slug: 'non-coffee' } });
  const catTea = await prisma.category.create({ data: { name: 'Tea & Infusion', slug: 'tea-infusion' } });
  const catSnack = await prisma.category.create({ data: { name: 'Snacks & Appetizers', slug: 'snacks-appetizers' } });
  const catBakery = await prisma.category.create({ data: { name: 'Bakery & Pastry', slug: 'bakery-pastry' } });

  // ==========================================
  // 4. SEED SUPPLIERS & RAW MATERIALS
  // ==========================================
  console.log('Seeding suppliers & raw materials...');
  const defaultSupplier = await prisma.supplier.create({
    data: {
      name: 'Denjavas Central Supplier',
      contactPerson: 'PIC Central',
      phone: '08123456789',
      email: 'central@supplier.com',
      address: 'Balikpapan',
    }
  });

  // Generous stocks to support 7 days of transactions without going negative
  const rawMaterialsData = [
    { name: 'Espresso Roast Beans', unit: 'gram', currentStock: 100000, minimumStock: 5000, costPerUnit: 150 },
    { name: 'Fresh Milk', unit: 'ml', currentStock: 200000, minimumStock: 10000, costPerUnit: 20 },
    { name: 'Palm Sugar Syrup', unit: 'ml', currentStock: 50000, minimumStock: 2000, costPerUnit: 15 },
    { name: 'Matcha Powder', unit: 'gram', currentStock: 20000, minimumStock: 1000, costPerUnit: 500 },
    { name: 'Chocolate Powder', unit: 'gram', currentStock: 20000, minimumStock: 1000, costPerUnit: 400 },
    { name: 'Tea Leaves', unit: 'gram', currentStock: 10000, minimumStock: 500, costPerUnit: 250 },
    { name: 'Peach Syrup', unit: 'ml', currentStock: 30000, minimumStock: 1500, costPerUnit: 30 },
    { name: 'Paper Cup 8oz', unit: 'pcs', currentStock: 10000, minimumStock: 500, costPerUnit: 800 },
    { name: 'Plastic Cup 16oz', unit: 'pcs', currentStock: 10000, minimumStock: 500, costPerUnit: 600 },
    { name: 'Ice Cubes', unit: 'gram', currentStock: 500000, minimumStock: 20000, costPerUnit: 5 },
    { name: 'Frozen French Fries', unit: 'gram', currentStock: 100000, minimumStock: 5000, costPerUnit: 40 },
    { name: 'Cooking Oil', unit: 'ml', currentStock: 100000, minimumStock: 5000, costPerUnit: 15 },
    { name: 'Paper Bag Snack', unit: 'pcs', currentStock: 10000, minimumStock: 500, costPerUnit: 500 },
    { name: 'Tapioca Pearl (Boba)', unit: 'gram', currentStock: 50000, minimumStock: 2000, costPerUnit: 60 },
    { name: 'Raw Croissant', unit: 'pcs', currentStock: 1000, minimumStock: 50, costPerUnit: 8000 },
  ];

  const rawMaterials: Record<string, any> = {};
  for (const material of rawMaterialsData) {
    const rm = await prisma.rawMaterial.create({
      data: {
        name: material.name,
        unit: material.unit,
        currentStock: material.currentStock,
        minimumStock: material.minimumStock,
        costPerUnit: material.costPerUnit,
        parLevel: material.currentStock,
        defaultSupplierId: defaultSupplier.id,
      },
    });
    rawMaterials[material.name] = rm;

    // Log initial stock mutations
    await prisma.stockMutation.create({
      data: {
        rawMaterialId: rm.id,
        type: 'in',
        quantity: material.currentStock,
        reference: 'Initial Stock',
        notes: 'Saldo awal pendaftaran bahan baku',
      }
    });
  }

  // Quick references
  const beans = rawMaterials['Espresso Roast Beans'];
  const milk = rawMaterials['Fresh Milk'];
  const palmSugar = rawMaterials['Palm Sugar Syrup'];
  const matcha = rawMaterials['Matcha Powder'];
  const chocolate = rawMaterials['Chocolate Powder'];
  const tea = rawMaterials['Tea Leaves'];
  const peachSyrup = rawMaterials['Peach Syrup'];
  const paperCup = rawMaterials['Paper Cup 8oz'];
  const plasticCup = rawMaterials['Plastic Cup 16oz'];
  const ice = rawMaterials['Ice Cubes'];
  const fries = rawMaterials['Frozen French Fries'];
  const oil = rawMaterials['Cooking Oil'];
  const paperBag = rawMaterials['Paper Bag Snack'];
  const boba = rawMaterials['Tapioca Pearl (Boba)'];
  const croissant = rawMaterials['Raw Croissant'];

  // Helper function to create Suhu Option (Hot/Ice) which deducts correct cup type and ice
  const addSuhuOption = async (menuId: number) => {
    const group = await prisma.menuOptionGroup.create({
      data: { menuId, name: 'Suhu', minSelect: 1, maxSelect: 1 }
    });
    await prisma.menuOptionItem.create({
      data: {
        menuOptionGroupId: group.id,
        name: 'Hot',
        priceModifier: 0,
        recipes: { create: [{ rawMaterialId: paperCup.id, quantity: 1 }] }
      }
    });
    await prisma.menuOptionItem.create({
      data: {
        menuOptionGroupId: group.id,
        name: 'Ice',
        priceModifier: 0,
        recipes: {
          create: [
            { rawMaterialId: plasticCup.id, quantity: 1 },
            { rawMaterialId: ice.id, quantity: 150 }
          ]
        }
      }
    });
  };

  // Helper for Sweetness Option
  const addSweetnessOption = async (menuId: number) => {
    const group = await prisma.menuOptionGroup.create({
      data: { menuId, name: 'Kadar Gula', minSelect: 1, maxSelect: 1 }
    });
    await prisma.menuOptionItem.create({
      data: { menuOptionGroupId: group.id, name: 'Normal Sugar', priceModifier: 0 }
    });
    await prisma.menuOptionItem.create({
      data: { menuOptionGroupId: group.id, name: 'Less Sugar', priceModifier: 0 }
    });
    await prisma.menuOptionItem.create({
      data: { menuOptionGroupId: group.id, name: 'No Sugar', priceModifier: 0 }
    });
  };

  // ==========================================
  // 5. SEED MENUS
  // ==========================================
  console.log('Seeding menus and recipes...');

  // MENU 1: Espresso
  const menuEspresso = await prisma.menu.create({
    data: {
      categoryId: catCoffee.id,
      name: 'Espresso Single Shot',
      description: 'Ekstraksi kopi murni dengan crema tebal',
      basePrice: 15000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: beans.id, quantity: 9 },
          { rawMaterialId: paperCup.id, quantity: 1 }
        ]
      }
    }
  });

  // MENU 2: Americano
  const menuAmericano = await prisma.menu.create({
    data: {
      categoryId: catCoffee.id,
      name: 'Americano',
      description: 'Espresso double shot dengan air panas/es',
      basePrice: 18000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: beans.id, quantity: 18 }
        ]
      }
    }
  });
  await addSuhuOption(menuAmericano.id);

  // MENU 3: Kopi Susu Aren
  const menuKopiSusu = await prisma.menu.create({
    data: {
      categoryId: catCoffee.id,
      name: 'Kopi Susu Aren',
      description: 'Es Kopi Susu dengan Gula Aren khas Denjavas',
      basePrice: 20000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: beans.id, quantity: 18 },
          { rawMaterialId: milk.id, quantity: 150 },
          { rawMaterialId: palmSugar.id, quantity: 20 }
        ]
      }
    }
  });
  await addSuhuOption(menuKopiSusu.id);
  await addSweetnessOption(menuKopiSusu.id);

  // MENU 4: Cafe Latte
  const menuLatte = await prisma.menu.create({
    data: {
      categoryId: catCoffee.id,
      name: 'Cafe Latte',
      description: 'Espresso dengan susu lembut (steamed milk)',
      basePrice: 22000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: beans.id, quantity: 18 },
          { rawMaterialId: milk.id, quantity: 180 }
        ]
      }
    }
  });
  await addSuhuOption(menuLatte.id);
  await addSweetnessOption(menuLatte.id);

  // MENU 5: Premium Matcha Latte
  const menuMatcha = await prisma.menu.create({
    data: {
      categoryId: catNonCoffee.id,
      name: 'Matcha Latte',
      description: 'Matcha Jepang premium dipadu susu segar',
      basePrice: 24000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: matcha.id, quantity: 15 },
          { rawMaterialId: milk.id, quantity: 180 }
        ]
      }
    }
  });
  await addSuhuOption(menuMatcha.id);
  await addSweetnessOption(menuMatcha.id);
  
  // Add topping option for Matcha
  const matchToppingGroup = await prisma.menuOptionGroup.create({
    data: { menuId: menuMatcha.id, name: 'Topping', minSelect: 0, maxSelect: 1 }
  });
  await prisma.menuOptionItem.create({
    data: {
      menuOptionGroupId: matchToppingGroup.id,
      name: 'Boba Topping',
      priceModifier: 3000,
      recipes: { create: [{ rawMaterialId: boba.id, quantity: 30 }] }
    }
  });

  // MENU 6: Belgian Chocolate Latte
  const menuChocolate = await prisma.menu.create({
    data: {
      categoryId: catNonCoffee.id,
      name: 'Belgian Chocolate Latte',
      description: 'Cokelat Belgia pekat dengan susu segar manis',
      basePrice: 24000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: chocolate.id, quantity: 15 },
          { rawMaterialId: milk.id, quantity: 180 }
        ]
      }
    }
  });
  await addSuhuOption(menuChocolate.id);
  await addSweetnessOption(menuChocolate.id);

  // MENU 7: Ice Peach Tea
  const menuPeachTea = await prisma.menu.create({
    data: {
      categoryId: catTea.id,
      name: 'Ice Peach Tea',
      description: 'Teh hitam segar rasa buah persik manis dengan es',
      basePrice: 18000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: tea.id, quantity: 10 },
          { rawMaterialId: peachSyrup.id, quantity: 20 },
          { rawMaterialId: plasticCup.id, quantity: 1 },
          { rawMaterialId: ice.id, quantity: 150 }
        ]
      }
    }
  });

  // MENU 8: Boba Milk Tea
  const menuBobaTea = await prisma.menu.create({
    data: {
      categoryId: catTea.id,
      name: 'Boba Milk Tea',
      description: 'Classic milk tea segar lengkap dengan boba kenyal',
      basePrice: 22000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: tea.id, quantity: 10 },
          { rawMaterialId: milk.id, quantity: 150 },
          { rawMaterialId: boba.id, quantity: 40 },
          { rawMaterialId: plasticCup.id, quantity: 1 },
          { rawMaterialId: ice.id, quantity: 150 }
        ]
      }
    }
  });

  // MENU 9: French Fries
  const menuFrenchFries = await prisma.menu.create({
    data: {
      categoryId: catSnack.id,
      name: 'French Fries',
      description: 'Kentang goreng renyah dengan bumbu gurih dan saus',
      basePrice: 18000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: fries.id, quantity: 150 },
          { rawMaterialId: oil.id, quantity: 20 },
          { rawMaterialId: paperBag.id, quantity: 1 }
        ]
      }
    }
  });

  // MENU 10: Butter Croissant
  const menuCroissant = await prisma.menu.create({
    data: {
      categoryId: catBakery.id,
      name: 'Butter Croissant',
      description: 'Croissant mentega panggang yang renyah dan lembut',
      basePrice: 20000,
      isActive: true,
      recipes: {
        create: [
          { rawMaterialId: croissant.id, quantity: 1 },
          { rawMaterialId: paperBag.id, quantity: 1 }
        ]
      }
    }
  });

  // ==========================================
  // 6. SEED CAFE TABLES (Meja 1–20)
  // ==========================================
  console.log('Seeding tables...');
  for (let i = 1; i <= 20; i++) {
    await prisma.cafeTable.create({
      data: { number: i, status: 'available' },
    });
  }

  // ==========================================
  // 7. SEED STORE SETTINGS
  // ==========================================
  console.log('Seeding settings...');
  const defaults = [
    { key: 'store_name', value: 'Denjavas Retro Café' },
    { key: 'store_phone', value: '+62 823-5343-8404' },
    { key: 'store_instagram', value: '@denjavas' },
    { key: 'store_address', value: 'Denjavas Jl. Penajam - Kuaro KM 16, Giri Mukti, Penajam, Kabupaten Penajam Paser Utara, Kalimantan Timur 76143' },
    { key: 'receipt_header', value: 'Denjavas Retro Café' },
    { key: 'receipt_footer', value: 'Terima kasih atas kunjungan Anda! Follow IG kami @denjavas' },
  ];

  for (const item of defaults) {
    await prisma.storeSetting.create({
      data: { key: item.key, value: item.value },
    });
  }

  // ==========================================
  // 8. SEED HISTORICAL TRANSACTIONS (Last 7 Days)
  // ==========================================
  console.log('Seeding historical transaction data (7 days ago to today)...');
  
  const tablesList = await prisma.cafeTable.findMany();
  const menusList = await prisma.menu.findMany({
    include: {
      menuOptionGroups: {
        include: { menuOptionItems: true }
      }
    }
  });

  const today = new Date();
  let globalOrderCount = 1;

  for (let d = 7; d >= 0; d--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - d);
    
    // Create 1 or 2 shifts per day
    const isToday = d === 0;
    const shiftCount = isToday ? 1 : (Math.random() > 0.3 ? 2 : 1);
    
    for (let s = 1; s <= shiftCount; s++) {
      const cashier = cashierUsers[s % cashierUsers.length];
      
      const openTime = new Date(currentDate);
      openTime.setHours(s === 1 ? 8 : 15, Math.floor(Math.random() * 30), 0, 0);
      
      let closeTime = null;
      // Close all shifts except today's active shift
      if (!isToday || s < shiftCount) {
        closeTime = new Date(currentDate);
        closeTime.setHours(s === 1 ? 15 : 22, Math.floor(Math.random() * 30), 0, 0);
      }
      
      const shift = await prisma.shift.create({
        data: {
          userId: cashier.id,
          openedAt: openTime,
          closedAt: closeTime,
          openingCash: 100000,
          closingCash: 0,
          totalSales: 0,
          totalCashSales: 0,
          expectedClosingCash: 0,
          totalPettyCash: 0,
        }
      });

      // Daily random logs
      await prisma.activityLog.create({
        data: {
          userId: cashier.id,
          action: 'shift_open',
          description: `Membuka shift baru — Modal: Rp 100.000`,
          createdAt: openTime,
        }
      });

      // Generate random petty cash expenses occasionally
      let totalPettyCash = 0;
      if (closeTime && Math.random() > 0.6) {
        const pettyAmount = Math.random() > 0.5 ? 25000 : 50000;
        const pettyDesc = Math.random() > 0.5 ? 'Beli Es Batu Tambahan' : 'Beli Sabun Cuci Piring';
        const pettyTime = new Date(openTime);
        pettyTime.setHours(openTime.getHours() + 2);

        await prisma.pettyCash.create({
          data: {
            shiftId: shift.id,
            userId: cashier.id,
            amount: pettyAmount,
            description: pettyDesc,
            createdAt: pettyTime
          }
        });
        totalPettyCash += pettyAmount;
      }
      
      const orderCount = Math.floor(Math.random() * 8) + 12; // 12 to 20 orders per shift
      let totalSales = 0;
      let totalCashSales = 0;
      
      for (let o = 1; o <= orderCount; o++) {
        const seq = String(globalOrderCount++).padStart(4, '0');
        const datePrefix = openTime.toISOString().slice(0, 10).replace(/-/g, '');
        const orderNumber = `ORD-${datePrefix}-${seq}`;
        
        const orderTime = new Date(openTime);
        const minutesToAdd = Math.floor(Math.random() * (closeTime ? (closeTime.getTime() - openTime.getTime()) / 60000 : 300));
        orderTime.setMinutes(orderTime.getMinutes() + minutesToAdd);
        
        const rand = Math.random();
        const paymentMethod = rand < 0.45 ? 'cash' : (rand < 0.85 ? 'qris' : 'ewallet');
        const orderType = Math.random() > 0.4 ? 'dine_in' : 'takeaway';
        
        const randomTable = tablesList[Math.floor(Math.random() * tablesList.length)];

        const order = await prisma.order.create({
          data: {
            orderNumber,
            shiftId: shift.id,
            userId: cashier.id,
            orderType,
            cafeTableId: orderType === 'dine_in' ? randomTable.id : null,
            subtotal: 0,
            total: 0,
            paymentMethod,
            paymentAmount: 0,
            change: 0,
            status: 'completed',
            createdAt: orderTime,
            updatedAt: orderTime,
          }
        });
        
        const itemsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items per order
        let orderSubtotal = 0;
        
        for (let i = 0; i < itemsCount; i++) {
          const menu = menusList[Math.floor(Math.random() * menusList.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 pcs
          const basePrice = Number(menu.basePrice);
          
          const orderItem = await prisma.orderItem.create({
            data: {
              orderId: order.id,
              menuId: menu.id,
              menuName: menu.name,
              quantity,
              unitPrice: basePrice,
              subtotal: basePrice * quantity,
              notes: Math.random() > 0.85 ? 'Manisnya dikurangi ya' : null,
            }
          });
          
          let optionsSubtotal = 0;
          
          // Process option groups
          for (const group of menu.menuOptionGroups) {
            if (group.menuOptionItems.length > 0) {
              if (group.minSelect === 0 && Math.random() > 0.5) continue; // Optional group
              
              const optionItem = group.menuOptionItems[Math.floor(Math.random() * group.menuOptionItems.length)];
              
              await prisma.orderItemOption.create({
                data: {
                  orderItemId: orderItem.id,
                  menuOptionItemId: optionItem.id,
                  optionGroupName: group.name,
                  optionName: optionItem.name,
                  priceModifier: optionItem.priceModifier,
                }
              });
              
              optionsSubtotal += Number(optionItem.priceModifier);
            }
          }
          
          const finalItemSubtotal = (basePrice + optionsSubtotal) * quantity;
          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: { subtotal: finalItemSubtotal }
          });
          
          orderSubtotal += finalItemSubtotal;
        }
        
        let paymentAmount = orderSubtotal;
        let change = 0;
        if (paymentMethod === 'cash') {
          const paymentOptions = [
            orderSubtotal, 
            Math.ceil(orderSubtotal / 10000) * 10000, 
            Math.ceil(orderSubtotal / 50000) * 50000
          ];
          paymentAmount = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
          change = paymentAmount - orderSubtotal;
        }
        
        // Finalize order
        const finalOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            subtotal: orderSubtotal,
            total: orderSubtotal,
            paymentAmount,
            change,
          },
          include: {
            orderItems: {
              include: {
                orderItemOptions: true
              }
            }
          }
        });
        
        // Deduct inventory
        await deductStockFromOrder(prisma, finalOrder);
        
        totalSales += orderSubtotal;
        if (paymentMethod === 'cash') {
          totalCashSales += orderSubtotal;
        }
      }
      
      // Update Shift totals
      const expectedClosingCash = 100000 + totalCashSales - totalPettyCash;
      const discrepancy = closeTime ? (Math.random() > 0.7 ? (Math.random() > 0.5 ? 5000 : -5000) : 0) : 0;
      const closingCash = expectedClosingCash + discrepancy;
      
      await prisma.shift.update({
        where: { id: shift.id },
        data: {
          totalSales,
          totalCashSales,
          totalPettyCash,
          expectedClosingCash,
          closingCash: closeTime ? closingCash : null,
        }
      });

      if (closeTime) {
        await prisma.activityLog.create({
          data: {
            userId: cashier.id,
            action: 'shift_close',
            description: `Menutup shift — Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}, Selisih: Rp ${discrepancy.toLocaleString('id-ID')}`,
            createdAt: closeTime,
          }
        });
      }
    }
  }

  console.log('Clean seeding with 7-day transaction history completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
