import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { isAuthenticated } from '../middleware/auth.js';
import { hasRole } from '../middleware/role.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.use(isAuthenticated, hasRole('admin'));

// GET /api/reports — All 7 report datasets
router.get('/', async (req, res) => {
  try {
    const startDate = typeof req.query.start_date === 'string' && req.query.start_date ? req.query.start_date : dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = typeof req.query.end_date === 'string' && req.query.end_date ? req.query.end_date : dayjs().endOf('month').format('YYYY-MM-DD');
    const search = typeof req.query.search === 'string' ? req.query.search : '';

    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    // 1. Daily Sales Summary
    const completedOrders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end }, status: 'completed' },
      select: { createdAt: true, total: true },
    });
    const salesByDate: Record<string, { date: string; total_orders: number; revenue: number }> = {};
    completedOrders.forEach(o => {
      const d = dayjs(o.createdAt).format('YYYY-MM-DD');
      if (!salesByDate[d]) salesByDate[d] = { date: d, total_orders: 0, revenue: 0 };
      salesByDate[d].total_orders += 1;
      salesByDate[d].revenue += Number(o.total);
    });
    const pettyCashByDate: Record<string, number> = {};
    const allPettyCash = await prisma.pettyCash.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, amount: true },
    });
    allPettyCash.forEach(p => {
      const d = dayjs(p.createdAt).format('YYYY-MM-DD');
      if (!pettyCashByDate[d]) pettyCashByDate[d] = 0;
      pettyCashByDate[d] += Number(p.amount);
    });
    const dailySales = Object.values(salesByDate).map((s: any) => ({
      ...s,
      petty_cash: pettyCashByDate[s.date] || 0,
      net_profit: s.revenue - (pettyCashByDate[s.date] || 0),
    })).sort((a: any, b: any) => b.date.localeCompare(a.date));

    // 2. Shift History
    const shifts = await prisma.shift.findMany({
      where: {
        openedAt: { gte: start, lte: end },
        ...(search ? { user: { name: { contains: String(search) } } } : {}),
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { openedAt: 'desc' },
    });
    const shiftsWithPetty = await Promise.all(shifts.map(async (s) => {
      const pc = await prisma.pettyCash.aggregate({
        where: { shiftId: s.id },
        _sum: { amount: true },
      });
      return {
        ...s,
        petty_cash_sum: Number(pc._sum.amount || 0),
        duration: s.closedAt ? dayjs(s.closedAt).diff(dayjs(s.openedAt), 'minute') : null,
      };
    }));

    // 3. Void Logs
    const voidWhere: any = { createdAt: { gte: start, lte: end }, status: 'void' };
    if (search) {
      voidWhere.OR = [
        { orderNumber: { contains: String(search) } },
        { voidReason: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
      ];
    }
    const voidLogs = await prisma.order.findMany({
      where: voidWhere,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Menu Performance
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: start, lte: end }, status: 'completed' } },
      include: {
        menu: {
          include: {
            category: true,
            recipes: { include: { rawMaterial: true } },
          },
        },
      },
    });
    const perfMap: Record<string, { id: number; name: string | undefined; category_name: string | undefined; total_qty: number; total_revenue: number; total_cogs: number; margin: number }> = {};
    orderItems.forEach(oi => {
      const mid = oi.menuId;
      if (search && !oi.menu?.name?.toLowerCase().includes(search.toLowerCase()) &&
          !oi.menu?.category?.name?.toLowerCase().includes(search.toLowerCase())) return;
      if (!perfMap[mid]) perfMap[mid] = { id: mid, name: oi.menu?.name, category_name: oi.menu?.category?.name, total_qty: 0, total_revenue: 0, total_cogs: 0, margin: 0 };
      perfMap[mid].total_qty += oi.quantity;
      perfMap[mid].total_revenue += Number(oi.subtotal);
    });
    // Calculate COGS per menu
    for (const key of Object.keys(perfMap)) {
      const menuId = parseInt(key);
      const menu = await prisma.menu.findUnique({ where: { id: menuId }, include: { recipes: { include: { rawMaterial: true } } } });
      if (menu) {
        let cogsPerUnit = 0;
        for (const r of menu.recipes) {
          if (r.rawMaterial) cogsPerUnit += Number(r.quantity) * Number(r.rawMaterial.costPerUnit);
        }
        perfMap[key].total_cogs = cogsPerUnit * perfMap[key].total_qty;
        perfMap[key].margin = perfMap[key].total_revenue - perfMap[key].total_cogs;
      }
    }
    const menuPerformance = Object.values(perfMap).sort((a, b) => b.total_qty - a.total_qty);

    // 5. Petty Cash Logs
    const pettyCashLogs = await prisma.pettyCash.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(search ? {
          OR: [
            { description: { contains: String(search) } },
            { user: { name: { contains: String(search) } } },
          ],
        } : {}),
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // 6. Order History
    const orderHistory = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(search ? {
          OR: [
            { orderNumber: { contains: String(search) } },
            { user: { name: { contains: String(search) } } },
          ],
        } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        cafeTable: true,
        orderItems: { include: { menu: { include: { recipes: { include: { rawMaterial: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 7. Stock Mutations
    const stockMutations = await prisma.stockMutation.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(search ? {
          OR: [
            { rawMaterial: { name: { contains: String(search) } } },
            { reference: { contains: String(search) } },
          ],
        } : {}),
      },
      include: { rawMaterial: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      filters: { start_date: startDate, end_date: endDate, search },
      dailySales,
      shifts: shiftsWithPetty,
      voidLogs,
      menuPerformance,
      pettyCashLogs,
      orderHistory,
      stockMutations,
    });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ message: 'Gagal memuat laporan.' });
  }
});

// GET /api/reports/export — CSV Export
router.get('/export', async (req, res) => {
  try {
    const { start_date, end_date, type, search } = req.query;
    const start_date_str = typeof start_date === 'string' && start_date ? start_date : dayjs().startOf('month').format('YYYY-MM-DD');
    const end_date_str = typeof end_date === 'string' && end_date ? end_date : dayjs().format('YYYY-MM-DD');
    const start = dayjs(start_date_str).startOf('day').toDate();
    const end = dayjs(end_date_str).endOf('day').toDate();

    let rows: any[][] = [];
    let headers: string[] = [];

    if (type === 'sales') {
      headers = ['Tanggal', 'Transaksi', 'Omzet Bruto', 'Petty Cash', 'Laba Bersih'];
      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: 'completed' },
        select: { createdAt: true, total: true },
      });
      const byDate: Record<string, { date: string; count: number; revenue: number }> = {};
      orders.forEach(o => {
        const d = dayjs(o.createdAt).format('YYYY-MM-DD');
        if (!byDate[d]) byDate[d] = { date: d, count: 0, revenue: 0 };
        byDate[d].count++; byDate[d].revenue += Number(o.total);
      });
      const pcs = await prisma.pettyCash.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true, amount: true } });
      const pcByDate: Record<string, number> = {};
      pcs.forEach(p => { const d = dayjs(p.createdAt).format('YYYY-MM-DD'); pcByDate[d] = (pcByDate[d] || 0) + Number(p.amount); });
      rows = Object.values(byDate).map(r => [r.date, r.count, r.revenue, pcByDate[r.date] || 0, r.revenue - (pcByDate[r.date] || 0)]);
    } else if (type === 'shifts') {
      headers = ['Kasir', 'Waktu Buka', 'Waktu Tutup', 'Tunai', 'Fisik', 'Selisih'];
      const shifts = await prisma.shift.findMany({
        where: { openedAt: { gte: start, lte: end } },
        include: { user: { select: { name: true } } },
        orderBy: { openedAt: 'desc' },
      });
      for (const s of shifts) {
        const pc = await prisma.pettyCash.aggregate({ where: { shiftId: s.id }, _sum: { amount: true } });
        const pcSum = Number(pc._sum.amount || 0);
        rows.push([
          s.user?.name, s.openedAt, s.closedAt,
          Number(s.totalCashSales), Number(s.closingCash || 0),
          Number(s.closingCash || 0) - (Number(s.openingCash) + Number(s.totalCashSales) - pcSum),
        ]);
      }
    } else if (type === 'voids') {
      headers = ['Waktu', 'No. Order', 'Kasir', 'Alasan', 'Nominal'];
      const voids = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: 'void' },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      rows = voids.map(v => [v.createdAt, v.orderNumber, v.user?.name, v.voidReason, Number(v.total)]);
    } else if (type === 'menu_performance') {
      headers = ['Nama Menu', 'Kategori', 'Qty Terjual', 'Total Omzet'];
      const items = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: start, lte: end }, status: 'completed' } },
        include: { menu: { include: { category: true } } },
      });
      const map: Record<number, { name: string | undefined; cat: string | undefined; qty: number; rev: number }> = {};
      items.forEach(oi => {
        const mid = oi.menuId;
        if (!map[mid]) map[mid] = { name: oi.menu?.name, cat: oi.menu?.category?.name, qty: 0, rev: 0 };
        map[mid].qty += oi.quantity; map[mid].rev += Number(oi.subtotal);
      });
      rows = Object.values(map).sort((a, b) => b.qty - a.qty).map(r => [r.name, r.cat, r.qty, r.rev]);
    } else if (type === 'expenses') {
      headers = ['Waktu', 'Kasir', 'Nominal', 'Catatan'];
      const pcs = await prisma.pettyCash.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      rows = pcs.map(p => [p.createdAt, p.user?.name, Number(p.amount), p.description]);
    } else if (type === 'transactions') {
      headers = ['Waktu', 'No. Order', 'Meja', 'Kasir', 'Metode', 'Total'];
      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { user: { select: { name: true } }, cafeTable: true },
        orderBy: { createdAt: 'desc' },
      });
      rows = orders.map(o => [o.createdAt, o.orderNumber, o.cafeTable?.number || 'Takeaway', o.user?.name, o.paymentMethod, Number(o.total)]);
    } else if (type === 'stock_mutations') {
      headers = ['Waktu', 'Bahan Baku', 'Tipe', 'Jumlah', 'Referensi', 'Catatan'];
      const mutations = await prisma.stockMutation.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { rawMaterial: true },
        orderBy: { createdAt: 'desc' },
      });
      rows = mutations.map(m => [m.createdAt, m.rawMaterial?.name, m.type === 'in' ? 'Masuk' : 'Keluar', Number(m.quantity), m.reference, m.notes]);
    }

    // Generate CSV
    const csvLines = [headers.join(',')];
    rows.forEach(row => {
      csvLines.push(row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-${type}-${start_date}.csv"`);
    return res.send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ message: 'Gagal mengekspor laporan.' });
  }
});

export default router;
