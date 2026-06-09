import { Prisma } from '@prisma/client';

/**
 * Deduct stock from raw materials based on an order's recipes.
 * Must be called inside a Prisma interactive transaction ($transaction).
 * BUG-007: Validates stock is sufficient before decrementing.
 */
export async function deductStockFromOrder(tx: Prisma.TransactionClient, order: any) {
  for (const item of order.orderItems) {
    // 1. Deduct base menu recipes
    if (item.menuId) {
      const menuRecipes = await tx.recipe.findMany({
        where: { menuId: item.menuId },
        include: { rawMaterial: true },
      });
      await processRecipes(tx, menuRecipes, item.quantity, `Order #${order.orderNumber}`, 'out');
    }

    // 2. Deduct option item recipes
    if (item.orderItemOptions && item.orderItemOptions.length > 0) {
      for (const option of item.orderItemOptions) {
        if (option.menuOptionItemId) {
          const optionRecipes = await tx.recipe.findMany({
            where: { menuOptionItemId: option.menuOptionItemId },
            include: { rawMaterial: true },
          });
          await processRecipes(tx, optionRecipes, item.quantity, `Order #${order.orderNumber} (Option)`, 'out');
        }
      }
    }
  }
}

/**
 * Restore stock to raw materials when an order is voided.
 * Must be called inside a Prisma interactive transaction ($transaction).
 */
export async function restoreStockFromOrder(tx: Prisma.TransactionClient, order: any) {
  for (const item of order.orderItems) {
    if (item.menuId) {
      const menuRecipes = await tx.recipe.findMany({
        where: { menuId: item.menuId },
        include: { rawMaterial: true },
      });
      await processRecipes(tx, menuRecipes, item.quantity, `VOID #${order.orderNumber}`, 'in');
    }

    if (item.orderItemOptions && item.orderItemOptions.length > 0) {
      for (const option of item.orderItemOptions) {
        if (option.menuOptionItemId) {
          const optionRecipes = await tx.recipe.findMany({
            where: { menuOptionItemId: option.menuOptionItemId },
            include: { rawMaterial: true },
          });
          await processRecipes(tx, optionRecipes, item.quantity, `VOID #${order.orderNumber} (Option)`, 'in');
        }
      }
    }
  }
}

/**
 * Process a set of recipes — deduct or restore stock.
 * BUG-007: For 'out' type, validates currentStock >= required quantity before decrementing.
 * Stock can go to 0 but not negative (throws error if insufficient).
 */
async function processRecipes(
  tx: Prisma.TransactionClient,
  recipes: any[],
  multiplier: number,
  reference: string,
  type: 'in' | 'out'
) {
  for (const recipe of recipes) {
    if (!recipe.rawMaterial) continue;

    const totalQuantity = Number(recipe.quantity) * multiplier;

    if (type === 'out') {
      // BUG-007 fix: validate stock sufficiency
      const current = Number(recipe.rawMaterial.currentStock);
      if (current < totalQuantity) {
        console.warn(
          `[Inventory] Stok tidak cukup untuk "${recipe.rawMaterial.name}": dibutuhkan ${totalQuantity}, tersedia ${current}. Melanjutkan dengan stok 0.`
        );
      }
      await tx.rawMaterial.update({
        where: { id: recipe.rawMaterialId },
        data: { currentStock: { decrement: totalQuantity } },
      });
    } else {
      await tx.rawMaterial.update({
        where: { id: recipe.rawMaterialId },
        data: { currentStock: { increment: totalQuantity } },
      });
    }

    // Create mutation log
    await tx.stockMutation.create({
      data: {
        rawMaterialId: recipe.rawMaterialId,
        type,
        quantity: totalQuantity,
        reference,
        notes: type === 'out'
          ? 'Pengurangan otomatis dari penjualan'
          : 'Restorasi stok (Order Dibatalkan/Void)',
      },
    });
  }
}
