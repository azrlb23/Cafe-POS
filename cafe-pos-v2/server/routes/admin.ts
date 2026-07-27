import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from '../middleware/auth.js';
import { hasRole } from '../middleware/role.js';
import prisma from '../lib/prisma.js';

import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase Client if configured
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log('[Storage] Supabase client initialized for menu photo uploads.');
} else {
  console.log('[Storage] Supabase URL/Key not found. Using local disk storage.');
}

// --- Multer: memory storage for menu photos ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya file gambar yang diizinkan.'));
  },
});

// Helper: save image (either locally or on Supabase Storage)
async function saveMenuImage(file: any): Promise<string> {
  const ext = path.extname(file.originalname);
  const filename = `menu-${Date.now()}${ext}`;

  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from('menus')
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.warn('Supabase Storage upload failed, falling back to local disk storage:', error);
      } else {
        return `menus/${filename}`;
      }
    } catch (err) {
      console.warn('Supabase Storage upload threw exception, falling back to local disk storage:', err);
    }
  }

  // Fallback local storage write
  const dir = path.join(process.cwd(), 'storage', 'menus');
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, file.buffer);
  return `menus/${filename}`;
}

// Helper: parse integer ID, returns null if invalid
function parseId(val: string): number | null {
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// GET /api/admin/public-menus (Publicly accessible)
router.get('/public-menus', async (req, res) => {
  try {
    const [menus, categories, settings] = await Promise.all([
      prisma.menu.findMany({
        where: { isActive: true },
        include: {
          category: true,
          menuOptionGroups: {
            include: {
              menuOptionItems: {
                where: { isAvailable: true }
              }
            }
          }
        },
        orderBy: { id: 'desc' },
      }),
      prisma.category.findMany({
        orderBy: { id: 'asc' }
      }),
      prisma.storeSetting.findMany()
    ]);

    const settingsMap: Record<string, string | null> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    
    // Set Cache-Control header for API response (e.g. max-age 15s, s-maxage 60s)
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    return res.json({ menus, categories, settings: settingsMap });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// All admin routes require authentication + admin role
router.use(isAuthenticated, hasRole('admin'));

// Helper: slugify
function slugify(text: string): string {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

// =============================================
// CATEGORIES
// =============================================

router.get('/categories', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? { name: { contains: String(search) } } : {};
    const categories = await prisma.category.findMany({ where, orderBy: { id: 'desc' } });
    return res.json({ categories });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
    return res.json({ category, message: 'Kategori berhasil ditambahkan.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, slug: slugify(name) },
    });
    return res.json({ category, message: 'Kategori berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });

    // Check if there are menus associated with this category
    const menuCount = await prisma.menu.count({ where: { categoryId: id } });
    if (menuCount > 0) {
      return res.status(400).json({ message: 'Kategori tidak dapat dihapus karena masih memiliki menu terkait.' });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// MENUS (Most complex CRUD — nested option groups + recipes)
// =============================================

router.get('/menus', async (req, res) => {
  try {
    const { search, category_id } = req.query;
    const where: any = {};
    if (search) where.name = { contains: String(search) };
    if (category_id) where.categoryId = parseInt(String(category_id), 10);

    const menus = await prisma.menu.findMany({
      where,
      include: { category: true, recipes: { select: { id: true } } },
      orderBy: { id: 'desc' },
    });
    const categories = await prisma.category.findMany();
    return res.json({ menus, categories });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/menus/create-data', async (req, res) => {
  try {
    const [categories, rawMaterials] = await Promise.all([
      prisma.category.findMany(),
      prisma.rawMaterial.findMany(),
    ]);
    return res.json({ categories, rawMaterials });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/menus/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        category: true,
        recipes: true,
        menuOptionGroups: {
          include: { menuOptionItems: { include: { recipes: true } } },
        },
      },
    });
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    const [categories, rawMaterials] = await Promise.all([
      prisma.category.findMany(),
      prisma.rawMaterial.findMany(),
    ]);
    return res.json({ menu, categories, rawMaterials });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/menus', upload.single('image'), async (req: any, res) => {
  try {
    const { category_id, name, description, base_price, is_active, recipes, option_groups } = req.body;
    if (!category_id || !name || base_price === undefined) {
      return res.status(400).json({ message: 'Data menu tidak lengkap.' });
    }
    const imagePath = req.file ? await saveMenuImage(req.file) : null;
    const parsedRecipes = typeof recipes === 'string' ? JSON.parse(recipes) : (recipes || []);
    const parsedGroups = typeof option_groups === 'string' ? JSON.parse(option_groups) : (option_groups || []);

    const result = await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: {
          categoryId: parseInt(category_id),
          name,
          description: description || null,
          basePrice: parseFloat(base_price),
          isActive: is_active === 'true' || is_active === true || is_active === undefined || is_active === null,
          imagePath,
        },
      });
      if (parsedRecipes.length > 0) {
        for (const r of parsedRecipes) {
          await tx.recipe.create({
            data: { menuId: menu.id, rawMaterialId: r.raw_material_id, quantity: r.quantity },
          });
        }
      }
      if (parsedGroups.length > 0) {
        for (const groupData of parsedGroups) {
          const group = await tx.menuOptionGroup.create({
            data: { menuId: menu.id, name: groupData.name, minSelect: groupData.min_select, maxSelect: groupData.max_select },
          });
          for (const itemData of (groupData.items || [])) {
            const item = await tx.menuOptionItem.create({
              data: { menuOptionGroupId: group.id, name: itemData.name, priceModifier: itemData.price_modifier },
            });
            for (const ir of (itemData.recipes || [])) {
              await tx.recipe.create({
                data: { menuOptionItemId: item.id, rawMaterialId: ir.raw_material_id, quantity: ir.quantity },
              });
            }
          }
        }
      }
      return menu;
    });
    return res.json({ menu: result, message: 'Menu berhasil ditambahkan.' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error.' });
  }
});

router.put('/menus/:id', upload.single('image'), async (req: any, res) => {
  try {
    const menuId = parseId(req.params.id);
    if (!menuId) return res.status(400).json({ message: 'ID tidak valid.' });
    const { category_id, name, description, base_price, is_active, recipes, option_groups } = req.body;
    const parsedRecipes = typeof recipes === 'string' ? JSON.parse(recipes) : (recipes || []);
    const parsedGroups = typeof option_groups === 'string' ? JSON.parse(option_groups) : (option_groups || []);

    // Build update data — only update imagePath if a new file was uploaded
    const imageData: any = {};
    if (req.file) imageData.imagePath = await saveMenuImage(req.file);

    const result = await prisma.$transaction(async (tx) => {
      await tx.menu.update({
        where: { id: menuId },
        data: {
          categoryId: parseInt(category_id),
          name,
          description: description || null,
          basePrice: parseFloat(base_price),
          isActive: is_active === 'true' || is_active === true || is_active === undefined || is_active === null,
          ...imageData,
        },
      });
      await tx.recipe.deleteMany({ where: { menuId } });
      for (const r of parsedRecipes) {
        await tx.recipe.create({
          data: { menuId, rawMaterialId: r.raw_material_id, quantity: r.quantity },
        });
      }
      const incomingGroupIds = parsedGroups.filter((g: any) => g.id).map((g: any) => g.id);
      await tx.menuOptionGroup.deleteMany({ where: { menuId, id: { notIn: incomingGroupIds } } });
      for (const groupData of parsedGroups) {
        const group = groupData.id
          ? await tx.menuOptionGroup.update({
              where: { id: groupData.id },
              data: { name: groupData.name, minSelect: groupData.min_select, maxSelect: groupData.max_select },
            })
          : await tx.menuOptionGroup.create({
              data: { menuId, name: groupData.name, minSelect: groupData.min_select, maxSelect: groupData.max_select },
            });
        const incomingItemIds = (groupData.items || []).filter((i: any) => i.id).map((i: any) => i.id);
        await tx.menuOptionItem.deleteMany({ where: { menuOptionGroupId: group.id, id: { notIn: incomingItemIds } } });
        for (const itemData of (groupData.items || [])) {
          const item = itemData.id
            ? await tx.menuOptionItem.update({
                where: { id: itemData.id },
                data: { name: itemData.name, priceModifier: itemData.price_modifier },
              })
            : await tx.menuOptionItem.create({
                data: { menuOptionGroupId: group.id, name: itemData.name, priceModifier: itemData.price_modifier },
              });
          await tx.recipe.deleteMany({ where: { menuOptionItemId: item.id } });
          for (const ir of (itemData.recipes || [])) {
            await tx.recipe.create({
              data: { menuOptionItemId: item.id, rawMaterialId: ir.raw_material_id, quantity: ir.quantity },
            });
          }
        }
      }
      return tx.menu.findUnique({
        where: { id: menuId },
        include: { category: true, recipes: true, menuOptionGroups: { include: { menuOptionItems: { include: { recipes: true } } } } },
      });
    });
    return res.json({ menu: result, message: 'Menu berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/menus/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });

    await prisma.menu.delete({ where: { id } });
    return res.json({ message: 'Menu berhasil dihapus.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// RAW MATERIALS
// =============================================

router.get('/raw-materials', async (req, res) => {
  try {
    const { search } = req.query;
    const rawMaterials = await prisma.rawMaterial.findMany({
      where: search ? { name: { contains: String(search) } } : {},
      include: { defaultSupplier: true },
      orderBy: { id: 'desc' },
    });
    const suppliers = await prisma.supplier.findMany();
    return res.json({ rawMaterials, suppliers });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/raw-materials', async (req, res) => {
  try {
    const { name, unit, cost_per_unit, current_stock, minimum_stock, par_level, default_supplier_id } = req.body;

    const rawMaterial = await prisma.rawMaterial.create({
      data: {
        name, unit,
        costPerUnit: cost_per_unit,
        currentStock: current_stock || 0,
        minimumStock: minimum_stock || 0,
        parLevel: par_level || null,
        defaultSupplierId: default_supplier_id || null,
      },
    });

    if (current_stock > 0) {
      await prisma.stockMutation.create({
        data: {
          rawMaterialId: rawMaterial.id,
          type: 'in',
          quantity: current_stock,
          reference: 'Initial Stock',
          notes: 'Saldo awal saat pendaftaran bahan baku',
        },
      });
    }

    return res.json({ rawMaterial, message: 'Bahan baku berhasil ditambahkan.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/raw-materials/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });
    const rawMaterial = await prisma.rawMaterial.findUnique({
      where: { id },
      include: { defaultSupplier: true }
    });
    if (!rawMaterial) return res.status(404).json({ message: 'Bahan baku tidak ditemukan.' });
    const suppliers = await prisma.supplier.findMany();
    return res.json({ rawMaterial, suppliers });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.put('/raw-materials/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });
    const { name, unit, cost_per_unit, current_stock, minimum_stock, par_level, default_supplier_id } = req.body;

    // BUG-017: Guard against null existing record
    const existing = await prisma.rawMaterial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Bahan baku tidak ditemukan.' });

    const diff = Number(current_stock) - Number(existing.currentStock);
    if (diff !== 0) {
      await prisma.stockMutation.create({
        data: {
          rawMaterialId: id,
          type: diff > 0 ? 'in' : 'out',
          quantity: Math.abs(diff),
          reference: 'Manual Adjustment',
          notes: 'Penyesuaian stok manual oleh admin',
        },
      });
    }

    const rawMaterial = await prisma.rawMaterial.update({
      where: { id },
      data: {
        name, unit,
        costPerUnit: cost_per_unit,
        currentStock: current_stock,
        minimumStock: minimum_stock || 0,
        parLevel: par_level || null,
        defaultSupplierId: default_supplier_id || null,
      },
    });
    return res.json({ rawMaterial, message: 'Bahan baku berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/raw-materials/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });

    // Check if raw material is used in any menu/option recipes
    const recipeCount = await prisma.recipe.count({ where: { rawMaterialId: id } });
    if (recipeCount > 0) {
      return res.status(400).json({ message: 'Bahan baku tidak dapat dihapus karena masih digunakan dalam resep menu.' });
    }

    // Check if raw material has any purchase order items
    const poItemCount = await prisma.purchaseOrderItem.count({ where: { rawMaterialId: id } });
    if (poItemCount > 0) {
      return res.status(400).json({ message: 'Bahan baku tidak dapat dihapus karena memiliki riwayat pembelian.' });
    }

    await prisma.rawMaterial.delete({ where: { id } });
    return res.json({ message: 'Bahan baku berhasil dihapus.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// SUPPLIERS
// =============================================

router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { id: 'desc' } });
    return res.json({ suppliers });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/suppliers/:id', async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!supplier) return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
    return res.json({ supplier });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/suppliers', async (req, res) => {
  try {
    const { name, address, contact_person, phone, email } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
        address,
        contactPerson: contact_person,
        phone,
        email,
      },
    });
    return res.json({ supplier, message: 'Supplier berhasil ditambahkan.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.put('/suppliers/:id', async (req, res) => {
  try {
    const { name, address, contact_person, phone, email } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        address,
        contactPerson: contact_person,
        phone,
        email,
      },
    });
    return res.json({ supplier, message: 'Supplier berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });

    // Check if supplier is default for any raw materials
    const rawMaterialCount = await prisma.rawMaterial.count({ where: { defaultSupplierId: id } });
    if (rawMaterialCount > 0) {
      return res.status(400).json({ message: 'Supplier tidak dapat dihapus karena masih menjadi supplier default untuk bahan baku.' });
    }

    // Check if supplier has any purchase orders
    const poCount = await prisma.purchaseOrder.count({ where: { supplierId: id } });
    if (poCount > 0) {
      return res.status(400).json({ message: 'Supplier tidak dapat dihapus karena memiliki riwayat transaksi Purchase Order.' });
    }

    await prisma.supplier.delete({ where: { id } });
    return res.json({ message: 'Supplier berhasil dihapus.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// PURCHASE ORDERS
// =============================================

router.get('/purchase-orders', async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: { supplier: true, purchaseOrderItems: { include: { rawMaterial: true } } },
      orderBy: { id: 'desc' },
    });

    // BUG-005: Fetch all materials with default supplier, then filter manually
    const allMaterialsForSuggestions = await prisma.rawMaterial.findMany({
      where: { defaultSupplierId: { not: null } },
      include: { defaultSupplier: true },
    });
    const filtered = allMaterialsForSuggestions.filter(m => Number(m.currentStock) <= Number(m.minimumStock));

    const suppliers = await prisma.supplier.findMany();
    const rawMaterials = await prisma.rawMaterial.findMany();

    return res.json({ purchaseOrders, suppliers, rawMaterials, suggestions: filtered });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/purchase-orders', async (req, res) => {
  try {
    const { supplier_id, order_number, notes, items } = req.body;
    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ message: 'Data PO tidak lengkap.' });
    }

    const poNumber = order_number || `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${await prisma.purchaseOrder.count() + 1}`;

    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          supplierId: supplier_id,
          poNumber,
          status: 'received',
          notes: notes || null,
        },
      });

      for (const item of items) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            rawMaterialId: item.raw_material_id,
            quantity: item.quantity,
            unitCost: item.unit_cost,
          },
        });

        // Update raw material stock + cost
        await tx.rawMaterial.update({
          where: { id: item.raw_material_id },
          data: {
            currentStock: { increment: item.quantity },
            costPerUnit: item.unit_cost,
          },
        });

        // Log stock mutation
        const supplier = await tx.supplier.findUnique({ where: { id: supplier_id } });
        await tx.stockMutation.create({
          data: {
            rawMaterialId: item.raw_material_id,
            type: 'in',
            quantity: item.quantity,
            reference: `PO: ${poNumber}`,
            notes: `Stok masuk dari supplier: ${supplier?.name || 'Unknown'}`,
          },
        });
      }

      return po;
    });

    return res.json({ purchaseOrder: result, message: 'Stok berhasil ditambahkan dan modal diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/purchase-orders/:id', async (req, res) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { supplier: true, purchaseOrderItems: { include: { rawMaterial: true } } },
    });
    if (!purchaseOrder) return res.status(404).json({ message: 'Purchase Order tidak ditemukan.' });
    return res.json({ purchaseOrder });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/purchase-orders/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID tidak valid.' });

    // BUG-008: Revert stock before deleting the PO
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { purchaseOrderItems: true },
    });
    if (!po) return res.status(404).json({ message: 'Purchase Order tidak ditemukan.' });

    await prisma.$transaction(async (tx) => {
      for (const item of po.purchaseOrderItems) {
        await tx.rawMaterial.update({
          where: { id: item.rawMaterialId },
          data: { currentStock: { decrement: item.quantity } },
        });
        await tx.stockMutation.create({
          data: {
            rawMaterialId: item.rawMaterialId,
            type: 'out',
            quantity: item.quantity,
            reference: `Hapus PO: ${po.poNumber}`,
            notes: 'Stok dikembalikan karena PO dihapus',
          },
        });
      }
      await tx.purchaseOrder.delete({ where: { id } });
    });

    return res.json({ message: 'Riwayat pembelian dihapus dan stok dikembalikan.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// CASHIERS
// =============================================

router.get('/cashiers', async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const cashiers = await prisma.user.findMany({
      where: { role: 'kasir' },
      include: { shifts: { where: { closedAt: null } } },
    });

    const mapped = await Promise.all(cashiers.map(async (c) => {
      const activeShift = c.shifts[0] || null;
      let activeShiftData = null;

      if (activeShift) {
        const orders = await prisma.order.findMany({
          where: { shiftId: activeShift.id, status: 'completed' },
          select: { paymentMethod: true, total: true }
        });

        const paymentTotals: Record<string, number> = {};
        orders.forEach(o => {
          const method = o.paymentMethod.toLowerCase();
          paymentTotals[method] = (paymentTotals[method] || 0) + Number(o.total);
        });

        activeShiftData = {
          ...activeShift,
          paymentTotals,
        };
      }

      return {
        ...c,
        password: undefined,
        is_active: c.shifts.length > 0,
        active_shift: activeShiftData,
        active_shift_duration: activeShift?.openedAt || null,
      };
    }));

    const [activeCashiersCount, totalTransactionsToday, activityLogs] = await Promise.all([
      prisma.shift.count({ where: { closedAt: null } }),
      prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'completed' },
      }),
      prisma.activityLog.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return res.json({
      cashiers: mapped,
      stats: {
        total_cashiers: cashiers.length,
        active_cashiers: activeCashiersCount,
        total_transactions_today: totalTransactionsToday,
      },
      activityLogs,
    });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.post('/cashiers', async (req, res) => {
  try {
    const { name, email, pin, password } = req.body;
    if (!name || !email || !pin || !password) return res.status(400).json({ message: 'Semua field wajib.' });

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { pin }] },
    });
    
    if (existingUser) {
      if (existingUser.pin === pin) return res.status(400).json({ message: 'PIN sudah digunakan.' });
      if (existingUser.email === email) return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const user = await prisma.user.create({
      data: { name, email, pin, password: await bcrypt.hash(password, 10), role: 'kasir' },
    });
    return res.json({ cashier: { ...user, password: undefined }, message: 'Akun Kasir berhasil ditambahkan.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/cashiers/:id', async (req, res) => {
  try {
    const cashier = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!cashier || cashier.role !== 'kasir') return res.status(404).json({ message: 'Kasir tidak ditemukan.' });
    return res.json({ cashier: { ...cashier, password: undefined } });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.put('/cashiers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, pin, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [{ email }, { pin }],
      },
    });

    if (existingUser) {
      if (existingUser.pin === pin) return res.status(400).json({ message: 'PIN sudah digunakan kasir lain.' });
      if (existingUser.email === email) return res.status(400).json({ message: 'Email sudah terdaftar untuk kasir lain.' });
    }

    const data: any = { name, email, pin };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id }, data });
    return res.json({ cashier: { ...user, password: undefined }, message: 'Data Kasir berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/cashiers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const hasData = await prisma.shift.count({ where: { userId: id } }) +
                    await prisma.order.count({ where: { userId: id } });
    if (hasData > 0) {
      return res.status(422).json({
        message: 'Tidak dapat menghapus kasir karena memiliki riwayat transaksi.',
      });
    }
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Akun Kasir berhasil dihapus.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// SHIFTS FORCE CLOSE
// =============================================

router.post('/shifts/:id/end', async (req, res) => {
  try {
    const shiftId = parseInt(req.params.id, 10);
    const { closing_cash_option, custom_closing_cash, notes } = req.body;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { user: true },
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift tidak ditemukan.' });
    }

    if (shift.closedAt) {
      return res.status(422).json({ message: 'Shift ini sudah ditutup sebelumnya.' });
    }

    // Expected cash = opening + cash sales - petty cash
    const expectedClosingCash =
      Number(shift.openingCash) +
      Number(shift.totalCashSales) -
      Number(shift.totalPettyCash);

    let closingCash = expectedClosingCash;
    if (closing_cash_option === 'custom') {
      if (custom_closing_cash === undefined || isNaN(Number(custom_closing_cash))) {
        return res.status(400).json({ message: 'Jumlah kas akhir kustom tidak valid.' });
      }
      closingCash = Number(custom_closing_cash);
    }

    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        closedAt: new Date(),
        closingCash: closingCash,
        expectedClosingCash,
        notes: notes || 'Ditutup oleh Admin',
      },
    });

    const diff = closingCash - expectedClosingCash;
    const formatRpLocal = (amount: number) => 'Rp ' + Number(amount).toLocaleString('id-ID');

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.session.userId!,
        action: 'shift_close', // Use existing 'shift_close' action so it logs on the timeline properly
        description: `Admin menutup shift kasir ${shift.user.name}. Kas akhir: ${formatRpLocal(closingCash)} (Seharusnya: ${formatRpLocal(expectedClosingCash)}, Selisih: ${formatRpLocal(diff)}). Ket: ${notes || 'Ditutup oleh Admin'}`
      }
    });

    return res.json({
      shift: updatedShift,
      message: `Shift kasir ${shift.user.name} berhasil ditutup oleh Admin.`,
    });
  } catch (error) {
    console.error('Admin end shift error:', error);
    return res.status(500).json({ message: 'Gagal menutup shift kasir.' });
  }
});

// =============================================
// TABLES
// =============================================

router.get('/tables', async (req, res) => {
  try {
    const tables = await prisma.cafeTable.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: 'pending' },
          take: 1,
          include: {
            user: { select: { id: true, name: true } },
            orderItems: { include: { menu: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    return res.json({ tables });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

// =============================================
// STORE SETTINGS
// =============================================

router.post('/settings/upload', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }
    const ext = path.extname(req.file.originalname);
    const filename = `setting-${Date.now()}${ext}`;
    let pathResult = '';
    
    if (supabase) {
      const { error } = await supabase.storage
        .from('settings')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        throw new Error(`Gagal mengunggah gambar ke Cloud Storage: ${error.message}`);
      }
      pathResult = `settings/${filename}`;
    } else {
      const dir = path.join(process.cwd(), 'storage', 'settings');
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, filename);
      await fs.promises.writeFile(filePath, req.file.buffer);
      pathResult = `settings/${filename}`;
    }
    return res.json({ path: pathResult });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error.' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, string | null> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return res.json({ settings: map });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

router.put('/settings', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return res.json({ message: 'Pengaturan berhasil diperbarui.' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error.' }); }
});

export default router;
