import express, { Request, Response } from 'express';
import dayjs from 'dayjs';
import { isAuthenticated } from '../middleware/auth.js';
import { hasRole } from '../middleware/role.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.use(isAuthenticated, hasRole('admin'));

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const startDate = typeof req.query.start_date === 'string' && req.query.start_date ? req.query.start_date : dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = typeof req.query.end_date === 'string' && req.query.end_date ? req.query.end_date : dayjs().format('YYYY-MM-DD');

    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();
    const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

    // Previous period for comparison
    const prevStart = dayjs(startDate).subtract(daysDiff, 'day').startOf('day').toDate();
    const prevEnd = dayjs(startDate).subtract(1, 'second').toDate();

    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    // Perform all independent queries concurrently in a single Promise.all call
    const [
      completedOrders,
      prevOrders,
      pettyCashes,
      voidStats,
      activeCashiers,
      closedShifts,
      allMaterials,
      allMenus,
      stockMutationsOut,
      recentOrders,
      recentPettyCash,
      activityLogs
    ] = await Promise.all([
      // 1. Completed orders in range with all nested includes
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: 'completed' },
        include: {
          orderItems: {
            include: {
              menu: {
                include: {
                  recipes: {
                    include: {
                      rawMaterial: true
                    }
                  },
                  category: true
                }
              },
              orderItemOptions: true
            }
          },
          cafeTable: true,
          user: { select: { id: true, name: true } }
        }
      }),
      // 2. Previous period completed orders (for comparison)
      prisma.order.findMany({
        where: { createdAt: { gte: prevStart, lte: prevEnd }, status: 'completed' },
        select: { total: true }
      }),
      // 3. Petty cash in range
      prisma.pettyCash.findMany({
        where: { createdAt: { gte: start, lte: end } }
      }),
      // 4. Void stats in range
      prisma.order.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: 'void' },
        _count: true,
        _sum: { total: true },
      }),
      // 5. Active shifts/cashiers
      prisma.shift.findMany({
        where: { closedAt: null },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { openedAt: 'desc' }
      }),
      // 6. Closed shifts in range
      prisma.shift.findMany({
        where: { closedAt: { gte: start, lte: end } }
      }),
      // 7. Raw materials (for low stock and projection)
      prisma.rawMaterial.findMany(),
      // 8. All menus (for slow menus)
      prisma.menu.findMany({
        select: { id: true, name: true }
      }),
      // 9. Stock mutations out (for projection)
      prisma.stockMutation.findMany({
        where: { type: 'out', createdAt: { gte: start, lte: end } }
      }),
      // 10. Recent orders (limit 50)
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true } } }
      }),
      // 11. Recent petty cash (limit 50)
      prisma.pettyCash.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      // 12. Activity logs today (limit 50)
      prisma.activityLog.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ]);

    // ===== 1. KPIs In-Memory Calculations =====
    const revenuePeriod = completedOrders.reduce((s, o) => s + Number(o.total), 0);
    const transactionsPeriod = completedOrders.length;
    const avgBasketPeriod = transactionsPeriod > 0 ? revenuePeriod / transactionsPeriod : 0;

    const revenuePrev = prevOrders.reduce((s, o) => s + Number(o.total), 0);
    const transactionsPrev = prevOrders.length;
    const avgBasketPrev = transactionsPrev > 0 ? revenuePrev / transactionsPrev : 0;
    const revenueChange = revenuePrev > 0 ? ((revenuePeriod - revenuePrev) / revenuePrev) * 100 : 0;
    const avgBasketChange = avgBasketPrev > 0 ? ((avgBasketPeriod - avgBasketPrev) / avgBasketPrev) * 100 : 0;

    const pettyCashTotal = pettyCashes.reduce((sum, p) => sum + Number(p.amount), 0);

    // COGS calculation
    let totalCogs = 0;
    for (const order of completedOrders) {
      for (const item of order.orderItems) {
        if (!item.menu) continue;
        let itemCogs = 0;
        for (const recipe of item.menu.recipes) {
          if (recipe.rawMaterial) {
            itemCogs += Number(recipe.quantity) * Number(recipe.rawMaterial.costPerUnit);
          }
        }
        totalCogs += itemCogs * item.quantity;
      }
    }

    // Active shift (first of the active cashiers)
    const activeShift = activeCashiers.length > 0 ? activeCashiers[0] : null;
    const estimatedBalance = activeShift
      ? Number(activeShift.openingCash) + Number(activeShift.totalCashSales) - Number(activeShift.totalPettyCash)
      : 0;

    // Cash differences
    const cashDifferences = closedShifts.reduce(
      (s, sh) => s + (Number(sh.closingCash || 0) - Number(sh.expectedClosingCash || 0)), 0
    );

    // Low stock items
    const lowStockItems = allMaterials.filter(m => Number(m.minimumStock) > 0 && Number(m.currentStock) <= Number(m.minimumStock));

    // ===== 2. Sales Trend (computed in-memory) =====
    const salesByDate: Record<string, { date: string; revenue: number; orders: number }> = {};
    completedOrders.forEach(o => {
      const d = dayjs(o.createdAt).format('YYYY-MM-DD');
      if (!salesByDate[d]) salesByDate[d] = { date: d, revenue: 0, orders: 0 };
      salesByDate[d].revenue += Number(o.total);
      salesByDate[d].orders += 1;
    });
    const salesTrend = Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date));

    // ===== 3. Top 5 Menus & 8. Category Revenue (computed in-memory) =====
    const completedOrderItems = completedOrders.flatMap(o => o.orderItems);
    const menuMap: Record<number, { menu_id: number; name: string | undefined; category: string | undefined; total_quantity: number; total_revenue: number }> = {};
    const catMap: Record<string, { category_name: string; revenue: number }> = {};

    completedOrderItems.forEach(oi => {
      const mid = oi.menuId;
      if (!menuMap[mid]) {
        menuMap[mid] = { 
          menu_id: mid, 
          name: oi.menu?.name, 
          category: oi.menu?.category?.name, 
          total_quantity: 0, 
          total_revenue: 0 
        };
      }
      menuMap[mid].total_quantity += oi.quantity;
      menuMap[mid].total_revenue += Number(oi.subtotal);

      const cat = oi.menu?.category?.name || 'Uncategorized';
      if (!catMap[cat]) catMap[cat] = { category_name: cat, revenue: 0 };
      catMap[cat].revenue += Number(oi.subtotal);
    });

    const topMenus = Object.values(menuMap).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, 5);
    const categoryRevenue = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);

    // ===== 4. Payment Methods (computed in-memory) =====
    const paymentMap: Record<string, { payment_method: string; count: number; total: number }> = {};
    completedOrders.forEach(o => {
      if (!paymentMap[o.paymentMethod]) {
        paymentMap[o.paymentMethod] = { payment_method: o.paymentMethod, count: 0, total: 0 };
      }
      paymentMap[o.paymentMethod].count += 1;
      paymentMap[o.paymentMethod].total += Number(o.total);
    });
    const paymentMethods = Object.values(paymentMap);

    // ===== 5. Peak Hours (computed in-memory) =====
    const peakMap: Record<string, { hour: string; count: number }> = {};
    completedOrders.forEach(o => {
      const h = String(dayjs(o.createdAt).hour()).padStart(2, '0');
      if (!peakMap[h]) peakMap[h] = { hour: h, count: 0 };
      peakMap[h].count += 1;
    });
    const peakHours = Object.values(peakMap).sort((a, b) => a.hour.localeCompare(b.hour));

    // ===== 6. Expense Trend (computed in-memory) =====
    const expenseByDate: Record<string, { date: string; amount: number }> = {};
    pettyCashes.forEach(p => {
      const d = dayjs(p.createdAt).format('YYYY-MM-DD');
      if (!expenseByDate[d]) expenseByDate[d] = { date: d, amount: 0 };
      expenseByDate[d].amount += Number(p.amount);
    });
    const expenseTrend = Object.values(expenseByDate).sort((a, b) => a.date.localeCompare(b.date));

    // ===== 7. Order Types (computed in-memory) =====
    const typeMap: Record<string, { order_type: string; count: number }> = {};
    completedOrders.forEach(o => {
      if (!typeMap[o.orderType]) typeMap[o.orderType] = { order_type: o.orderType, count: 0 };
      typeMap[o.orderType].count += 1;
    });
    const orderTypes = Object.values(typeMap);

    // ===== 9. Popular Tables (computed in-memory) =====
    const tableMap: Record<number, { cafe_table_id: number; number: number | undefined; count: number }> = {};
    completedOrders.forEach(o => {
      if (o.cafeTableId) {
        const tid = o.cafeTableId;
        if (!tableMap[tid]) {
          tableMap[tid] = { cafe_table_id: tid, number: o.cafeTable?.number, count: 0 };
        }
        tableMap[tid].count += 1;
      }
    });
    const popularTables = Object.values(tableMap).sort((a, b) => b.count - a.count);

    // ===== 10. Slow Menus (computed in-memory) =====
    const slowMenus = allMenus.map(m => ({
      name: m.name,
      total_sold: menuMap[m.id]?.total_quantity || 0,
    })).sort((a, b) => a.total_sold - b.total_sold).slice(0, 5);

    // ===== 11. Stock Projection (computed in-memory) =====
    const usageMap: Record<number, number> = {};
    stockMutationsOut.forEach(m => {
      if (!usageMap[m.rawMaterialId]) usageMap[m.rawMaterialId] = 0;
      usageMap[m.rawMaterialId] += Number(m.quantity);
    });
    const stockProjection = allMaterials.map(m => {
      const usage = usageMap[m.id] || 0;
      const dailyUsage = usage / Math.max(daysDiff, 1);
      return {
        id: m.id,
        name: m.name,
        current_stock: Number(m.currentStock),
        unit: m.unit,
        days_remaining: dailyUsage > 0 ? Math.floor(Number(m.currentStock) / dailyUsage) : 999,
      };
    });

    // ===== 12. Cashier Performance (computed in-memory) =====
    const cashierMap: Record<number, { user_id: number; name: string | undefined; revenue: number; orders: number }> = {};
    completedOrders.forEach(o => {
      const uid = o.userId;
      if (!cashierMap[uid]) {
        cashierMap[uid] = { user_id: uid, name: o.user?.name, revenue: 0, orders: 0 };
      }
      cashierMap[uid].revenue += Number(o.total);
      cashierMap[uid].orders += 1;
    });
    const cashierPerformance = Object.values(cashierMap);

    // ===== 13. Variant Contribution (computed in-memory) =====
    const variantMap: Record<string, { option_name: string; revenue: number }> = {};
    completedOrderItems.forEach(oi => {
      oi.orderItemOptions.forEach(oio => {
        if (!variantMap[oio.optionName]) {
          variantMap[oio.optionName] = { option_name: oio.optionName, revenue: 0 };
        }
        variantMap[oio.optionName].revenue += Number(oio.priceModifier) * oi.quantity;
      });
    });
    const variantContribution = Object.values(variantMap).sort((a, b) => b.revenue - a.revenue);

    return res.json({
      filters: { start_date: startDate, end_date: endDate },
      kpis: {
        financial: {
          revenue: revenuePeriod,
          revenueChange,
          cogs: totalCogs,
          grossProfit: revenuePeriod - totalCogs,
          netProfit: revenuePeriod - totalCogs - pettyCashTotal,
        },
        orders: {
          total: transactionsPeriod,
          avgBasket: avgBasketPeriod,
          avgBasketChange,
          voidCount: voidStats._count || 0,
          voidTotal: Number(voidStats._sum.total || 0),
        },
        operations: {
          estimatedBalance,
          pettyCash: pettyCashTotal,
          cashDiff: cashDifferences,
          lowStockCount: lowStockItems.length,
        },
      },
      salesTrend,
      expenseTrend,
      topMenus,
      paymentMethods,
      peakHours,
      orderTypes,
      categoryRevenue,
      lowStockItems,
      popularTables,
      slowMenus,
      stockProjection,
      cashierPerformance,
      variantContribution,
      recentOrders,
      recentPettyCash,
      activeShift,
      activityLogs,
      activeCashiers,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Gagal memuat dashboard.' });
  }
});

export default router;
