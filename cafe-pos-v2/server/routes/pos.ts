import express, { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { isAuthenticated } from '../middleware/auth.js';
import { deductStockFromOrder, restoreStockFromOrder } from '../services/inventoryService.js';
import * as ActivityLogger from '../services/activityLogger.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Helper: format Rupiah for logging
function formatRp(amount: any): string {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Helper: generate order number ORD-YYYYMMDD-XXX (tx-safe, no race condition)
async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const today = dayjs().format('YYYYMMDD');
  const prefix = `ORD-${today}-`;

  const lastOrder = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  });

  let nextSequence = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.replace(prefix, ''), 10);
    nextSequence = lastSeq + 1;
  }

  return prefix + String(nextSequence).padStart(3, '0');
}

// ========================================
// GET /api/pos/data — Load POS interface data
// ========================================
router.get('/data', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    const activeShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    let activeShiftData: any = null;
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

    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [menus, categories, tables, todayOrders, todayPettyCash] = await Promise.all([
      prisma.menu.findMany({
        where: { isActive: true },
        include: {
          category: true,
          menuOptionGroups: {
            include: { menuOptionItems: true },
          },
        },
      }),
      prisma.category.findMany(),
      prisma.cafeTable.findMany({ orderBy: { number: 'asc' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: {
          orderItems: { include: { orderItemOptions: true } },
          cafeTable: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pettyCash.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      menus,
      categories,
      tables,
      activeShift: activeShiftData,
      todayOrders,
      todayPettyCash,
    });
  } catch (error) {
    console.error('POS data error:', error);
    return res.status(500).json({ message: 'Failed to load POS data.' });
  }
});

// ========================================
// POST /api/pos/shifts/start — Start a new shift
// ========================================
router.post('/shifts/start', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { pin, opening_cash } = req.body;
    const userId = req.session.userId;

    if (!pin || opening_cash === undefined) {
      return res.status(400).json({ message: 'PIN dan modal awal wajib diisi.' });
    }

    // Verify PIN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.pin !== pin) {
      return res.status(422).json({ errors: { pin: 'PIN yang Anda masukkan salah.' } });
    }

    // Check for existing active shift
    const existingShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    if (existingShift) {
      return res.status(422).json({ errors: { shift: 'Anda masih memiliki shift yang belum ditutup.' } });
    }

    const shift = await prisma.shift.create({
      data: {
        userId: userId!,
        openedAt: new Date(),
        openingCash: opening_cash,
      },
    });

    await ActivityLogger.log(userId!, 'shift_open', `Membuka shift baru — Modal: ${formatRp(opening_cash)}`);

    return res.json({ shift, message: 'Shift berhasil dibuka. Selamat bertugas!' });
  } catch (error) {
    console.error('Start shift error:', error);
    return res.status(500).json({ message: 'Gagal membuka shift.' });
  }
});

// ========================================
// POST /api/pos/shifts/end — Close the current shift
// ========================================
router.post('/shifts/end', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { closing_cash, notes } = req.body;
    const userId = req.session.userId;

    if (closing_cash === undefined) {
      return res.status(400).json({ message: 'Kas akhir wajib diisi.' });
    }

    const activeShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    if (!activeShift) {
      return res.status(422).json({ errors: { shift: 'Tidak ada shift aktif untuk ditutup.' } });
    }

    // Expected cash = opening + cash sales - petty cash
    const expectedClosingCash =
      Number(activeShift.openingCash) +
      Number(activeShift.totalCashSales) -
      Number(activeShift.totalPettyCash);

    const updatedShift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        closedAt: new Date(),
        closingCash: closing_cash,
        expectedClosingCash,
        notes: notes || null,
      },
    });

    const diff = closing_cash - expectedClosingCash;
    await ActivityLogger.log(
      userId!,
      'shift_close',
      `Menutup shift — Total: ${formatRp(activeShift.totalSales)}, Selisih: ${formatRp(diff)}`
    );

    // Destroy session (logout after closing shift) and respond from within callback
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error during shift close:', err);
      }
      return res.json({
        shift: updatedShift,
        message: `Shift berhasil ditutup. Total Penjualan: ${formatRp(activeShift.totalSales)}`,
      });
    });
  } catch (error) {
    console.error('End shift error:', error);
    return res.status(500).json({ message: 'Gagal menutup shift.' });
  }
});

// ========================================
// POST /api/pos/orders — Submit a new order
// ========================================
router.post('/orders', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { shift_id, cafe_table_id, order_type, items, payment_method, payment_amount, notes } = req.body;
    const userId = req.session.userId;

    // Basic validation
    if (!shift_id || !order_type || !items || items.length === 0 || !payment_method || payment_amount === undefined) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const orderNumber = await generateOrderNumber(tx);
      const order = await tx.order.create({
        data: {
          orderNumber,
          shiftId: shift_id,
          userId: userId!,
          cafeTableId: cafe_table_id || null,
          orderType: order_type,
          subtotal: 0,
          total: 0,
          paymentMethod: payment_method,
          paymentAmount: payment_amount,
          change: 0,
          status: order_type === 'dine_in' ? 'pending' : 'completed',
          notes: notes || null,
        },
      });

      let totalSubtotal = 0;

      // 2. Process each item
      for (const itemData of items) {
        const menu = await tx.menu.findUnique({ where: { id: itemData.menu_id } });
        if (!menu) continue;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuId: menu.id,
            menuName: menu.name,
            quantity: itemData.quantity,
            unitPrice: menu.basePrice,
            subtotal: Number(menu.basePrice) * itemData.quantity,
            notes: itemData.notes || null,
          },
        });

        let itemTotalOptions = 0;

        // 3. Process options for this item
        if (itemData.options && itemData.options.length > 0) {
          for (const optionData of itemData.options) {
            const optionItem = await tx.menuOptionItem.findUnique({
              where: { id: optionData.id },
              include: { menuOptionGroup: true },
            });

            if (!optionItem) continue;

            await tx.orderItemOption.create({
              data: {
                orderItemId: orderItem.id,
                menuOptionItemId: optionItem.id,
                optionGroupName: optionItem.menuOptionGroup.name,
                optionName: optionItem.name,
                priceModifier: optionItem.priceModifier,
              },
            });

            itemTotalOptions += Number(optionItem.priceModifier);
          }
        }

        // Update item subtotal with options
        const finalItemSubtotal = (Number(menu.basePrice) + itemTotalOptions) * itemData.quantity;
        await tx.orderItem.update({
          where: { id: orderItem.id },
          data: { subtotal: finalItemSubtotal },
        });

        totalSubtotal += finalItemSubtotal;
      }

      // 4. Update final order totals
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal: totalSubtotal,
          total: totalSubtotal,
          change: Math.max(0, payment_amount - totalSubtotal),
        },
        include: {
          orderItems: { include: { orderItemOptions: true } },
          cafeTable: true,
          user: { select: { id: true, name: true } },
        },
      });

      // 5. Update shift totals
      await tx.shift.update({
        where: { id: shift_id },
        data: {
          totalSales: { increment: totalSubtotal },
          ...(payment_method === 'cash' ? { totalCashSales: { increment: totalSubtotal } } : {}),
        },
      });

      // 6. Deduct stock from inventory
      await deductStockFromOrder(tx, updatedOrder);

      // 7. Log the activity
      await ActivityLogger.log(
        userId!,
        'order_create',
        `Membuat pesanan #${updatedOrder.orderNumber} — ${formatRp(totalSubtotal)} (${payment_method.charAt(0).toUpperCase() + payment_method.slice(1)})`,
        tx
      );

      return updatedOrder;
    }, {
      maxWait: 5000,
      timeout: 15000,
    });

    return res.json({
      order: result,
      message: `Pesanan #${result.orderNumber} berhasil disimpan.`,
    });
  } catch (error) {
    console.error('Submit order error:', error);
    const err = error as Error;
    return res.status(500).json({ message: 'Gagal menyimpan pesanan.', error: err.message, stack: err.stack });
  }
});

// ========================================
// POST /api/pos/orders/:id/void — Void/cancel an order
// ========================================
router.post('/orders/:id/void', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(String(req.params.id), 10);
    const { void_reason } = req.body;
    const userId = req.session.userId;

    if (!void_reason) {
      return res.status(400).json({ message: 'Alasan pembatalan wajib diisi.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { orderItemOptions: true } },
        shift: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    if (order.status === 'void') {
      return res.status(422).json({ errors: { order: 'Pesanan ini sudah dibatalkan sebelumnya.' } });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'void',
          voidReason: void_reason,
        },
      });

      // 2. Adjust shift balance
      if (order.shiftId) {
        const updateData: any = {
          totalSales: { decrement: Number(order.total) },
        };
        if (order.paymentMethod === 'cash') {
          updateData.totalCashSales = { decrement: Number(order.total) };
        }
        await tx.shift.update({
          where: { id: order.shiftId },
          data: updateData,
        });
      }

      // 3. Restore stock
      await restoreStockFromOrder(tx, order);
    }, {
      maxWait: 5000,
      timeout: 15000,
    });

    await ActivityLogger.log(
      userId!,
      'order_void',
      `Membatalkan pesanan #${order.orderNumber} — Alasan: ${void_reason}`
    );

    return res.json({ message: `Pesanan #${order.orderNumber} berhasil dibatalkan.` });
  } catch (error) {
    console.error('Void order error:', error);
    return res.status(500).json({ message: 'Gagal membatalkan pesanan.' });
  }
});

// ========================================
// PATCH /api/pos/orders/:id/status — Update order status
// ========================================
router.patch('/orders/:id/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(String(req.params.id), 10);
    const { status } = req.body;
    const userId = req.session.userId;

    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await ActivityLogger.log(
      userId!,
      'order_update',
      `Mengubah status pesanan #${order.orderNumber} menjadi ${status === 'pending' ? 'Pending' : 'Completed'}`
    );

    return res.json({ order, message: 'Status pesanan berhasil diperbarui.' });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ message: 'Gagal mengubah status pesanan.' });
  }
});

// ========================================
// POST /api/pos/petty-cash — Record petty cash expense
// ========================================
router.post('/petty-cash', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { amount, description } = req.body;
    const userId = req.session.userId;

    if (!amount || amount < 100 || !description) {
      return res.status(400).json({ message: 'Nominal dan keterangan wajib diisi.' });
    }

    const activeShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    if (!activeShift) {
      return res.status(422).json({ errors: { shift: 'Tidak ada shift aktif untuk mencatat kas keluar.' } });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pettyCash.create({
        data: {
          shiftId: activeShift.id,
          userId: userId!,
          amount,
          description,
        },
      });

      await tx.shift.update({
        where: { id: activeShift.id },
        data: { totalPettyCash: { increment: amount } },
      });
    });

    await ActivityLogger.log(
      userId!,
      'petty_cash',
      `Kas keluar ${formatRp(amount)} — ${description}`
    );

    return res.json({ message: 'Kas keluar berhasil dicatat.' });
  } catch (error) {
    console.error('Petty cash error:', error);
    return res.status(500).json({ message: 'Gagal mencatat kas keluar.' });
  }
});

// ========================================
// GET /api/pos/active-orders — Get active orders for today
// ========================================
router.get('/active-orders', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const activeShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['cancelled', 'void'] },
      },
      include: {
        orderItems: { include: { orderItemOptions: true } },
        cafeTable: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ todayOrders, activeShift });
  } catch (error) {
    console.error('Active orders error:', error);
    return res.status(500).json({ message: 'Gagal memuat pesanan aktif.' });
  }
});

// ========================================
// GET /api/pos/history — Get today's order history
// ========================================
router.get('/history', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const activeShift = await prisma.shift.findFirst({
      where: { userId, closedAt: null },
    });

    const [todayOrders, todayPettyCash] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: {
          orderItems: { include: { orderItemOptions: true } },
          cafeTable: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pettyCash.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({ todayOrders, todayPettyCash, activeShift });
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ message: 'Gagal memuat riwayat.' });
  }
});

// ========================================
// GET /api/pos/orders/:id/print — Generate receipt HTML (for client-side PDF)
// ========================================
router.get('/orders/:id/print', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(String(req.params.id), 10);
    const type = (req.query.type as string) || 'customer'; // customer, cashier, kitchen

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { orderItemOptions: true } },
        cafeTable: true,
        user: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    // Fetch store settings for receipt header/footer
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, string | null> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return res.json({ order, type, settings: settingsMap });
  } catch (error) {
    console.error('Print receipt error:', error);
    return res.status(500).json({ message: 'Gagal memuat data struk.' });
  }
});

export default router;
