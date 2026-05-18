<script setup>
import { ref, computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import DatePicker from '@/Components/DatePicker.vue';
import { Line, Bar, Doughnut, Radar, Bubble, PolarArea } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  RadialLinearScale,
  PolarAreaController
} from 'chart.js';

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, ArcElement, RadialLinearScale, PolarAreaController
);

const props = defineProps({
    filters: Object,
    kpis: Object,
    salesTrend: Array,
    expenseTrend: Array,
    topMenus: Array,
    paymentMethods: Array,
    peakHours: Array,
    orderTypes: Array,
    categoryRevenue: Array,
    lowStockItems: Array,
    activeShift: Object,
    // Low Priority Data
    popularTables: Array,
    slowMenus: Array,
    stockProjection: Array,
    cashierPerformance: Array,
    variantContribution: Array,
    recentOrders: Array,
    recentPettyCash: Array,
});

const form = useForm({
    start_date: props.filters.start_date,
    end_date: props.filters.end_date,
});

const submitFilter = () => {
    form.get(route('dashboard'), {
        preserveState: true,
        preserveScroll: true,
    });
};

const formatPrice = (price) => {
    return Number(price).toLocaleString('id-ID');
};

// --- Pagination Logic ---
const orderPage = ref(1);
const pettyCashPage = ref(1);
const itemsPerPage = 5;

const pagedOrders = computed(() => {
    const start = (orderPage.value - 1) * itemsPerPage;
    return props.recentOrders.slice(start, start + itemsPerPage);
});

const pagedPettyCash = computed(() => {
    const start = (pettyCashPage.value - 1) * itemsPerPage;
    return props.recentPettyCash.slice(start, start + itemsPerPage);
});

const totalOrderPages = computed(() => Math.ceil(props.recentOrders.length / itemsPerPage));
const totalPettyCashPages = computed(() => Math.ceil(props.recentPettyCash.length / itemsPerPage));

const salesTrendData = computed(() => {
    const dates = props.salesTrend.map(item => item.date);
    const expenseDates = props.expenseTrend.map(item => item.date);
    const allDates = [...new Set([...dates, ...expenseDates])].sort();
    
    return {
        labels: allDates.map(date => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'Pendapatan',
                data: allDates.map(date => {
                    const found = props.salesTrend.find(item => item.date === date);
                    return found ? found.revenue : 0;
                }),
                borderColor: '#d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2
            },
            {
                label: 'Pengeluaran',
                data: allDates.map(date => {
                    const found = props.expenseTrend.find(item => item.date === date);
                    return found ? found.amount : 0;
                }),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Laba (Net)',
                data: allDates.map(date => {
                    const revenueFound = props.salesTrend.find(item => item.date === date);
                    const expenseFound = props.expenseTrend.find(item => item.date === date);
                    const rev = revenueFound ? revenueFound.revenue : 0;
                    const exp = expenseFound ? expenseFound.amount : 0;
                    return rev - exp;
                }),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#fff'
            }
        ]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            padding: 16,
            backgroundColor: '#1C1E23',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 16,
            displayColors: true,
            boxPadding: 6
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: { 
                font: { size: 11, weight: '700' },
                color: '#94a3b8',
                callback: (value) => 'Rp ' + (value >= 1000000 ? (value/1000000).toFixed(1) + 'jt' : Number(value).toLocaleString('id-ID'))
            }
        },
        x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11, weight: '700' }, color: '#94a3b8' }
        }
    }
};

const topMenusData = computed(() => {
    return {
        labels: props.topMenus.map(item => item.menu.name),
        datasets: [{
            label: 'Qty',
            data: props.topMenus.map(item => item.total_quantity),
            backgroundColor: '#d97706',
            borderRadius: 8,
            barThickness: 20
        }]
    };
});

const paymentMethodsData = computed(() => {
    const colors = { 'cash': '#d97706', 'qris': '#3b82f6', 'ewallet': '#10b981', 'transfer': '#8b5cf6' };
    return {
        labels: props.paymentMethods.map(item => item.payment_method.toUpperCase()),
        datasets: [{
            data: props.paymentMethods.map(item => item.count),
            backgroundColor: props.paymentMethods.map(item => colors[item.payment_method] || '#94a3b8'),
            borderWidth: 0,
            hoverOffset: 15
        }]
    };
});

const orderTypesData = computed(() => {
    return {
        labels: props.orderTypes.map(item => item.order_type === 'dine_in' ? 'DINE-IN' : 'TAKEAWAY'),
        datasets: [{
            data: props.orderTypes.map(item => item.count),
            backgroundColor: ['#d97706', '#1c1917'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };
});

const categoryRevenueData = computed(() => {
    return {
        labels: props.categoryRevenue.map(item => item.category_name),
        datasets: [{
            label: 'Revenue',
            data: props.categoryRevenue.map(item => item.revenue),
            backgroundColor: [
                '#d97706', // Brand Gold (Amber 600)
                '#f59e0b', // Amber 500
                '#1c1917', // Stone 900
                '#10b981', // Emerald 500
                '#8b5cf6', // Violet 500
                '#06b6d4'  // Cyan 500
            ],
            borderWidth: 0,
            borderRadius: 10,
            spacing: 4
        }]
    };
});

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => {
                    let label = context.label || '';
                    if (label) label += ': ';
                    if (context.parsed !== null) {
                        label += 'Rp ' + context.parsed.toLocaleString('id-ID');
                    }
                    return label;
                }
            }
        }
    },
    cutout: '82%'
};

const peakHoursData = computed(() => {
    return {
        labels: props.peakHours.map(item => `${item.hour}:00`),
        datasets: [{
            label: 'Pesanan',
            data: props.peakHours.map(item => item.count),
            backgroundColor: 'rgba(217, 119, 6, 0.4)',
            borderColor: '#d97706',
            borderWidth: 1,
            borderRadius: 4,
        }]
    };
});

const popularTablesData = computed(() => {
    return {
        labels: props.popularTables.map(item => `Meja ${item.cafe_table.number}`),
        datasets: [{
            label: 'Total Pesanan',
            data: props.popularTables.map(item => item.count),
            backgroundColor: 'rgba(217, 119, 6, 0.8)',
            borderRadius: 12,
            barThickness: 24,
        }]
    };
});

const slowMenusData = computed(() => {
    return {
        labels: props.slowMenus.map(item => item.name),
        datasets: [{
            label: 'Qty Terjual',
            data: props.slowMenus.map(item => item.total_sold),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 12,
            barThickness: 24,
        }]
    };
});

const cashierPerformanceData = computed(() => {
    return {
        labels: props.cashierPerformance.map(item => item.user.name),
        datasets: [{
            label: 'Revenue',
            data: props.cashierPerformance.map(item => item.revenue),
            backgroundColor: [
                'rgba(217, 119, 6, 0.7)', // Brand Gold (Amber 600)
                'rgba(245, 158, 11, 0.7)', // Amber 500
                'rgba(28, 25, 23, 0.7)',   // Stone 900
                'rgba(16, 185, 129, 0.7)', // Emerald 500
                'rgba(139, 92, 246, 0.7)'  // Violet 500
            ],
            borderWidth: 0
        }]
    };
});

const variantContributionData = computed(() => {
    return {
        labels: props.variantContribution.map(item => item.option_name),
        datasets: [{
            data: props.variantContribution.map(item => item.revenue),
            backgroundColor: ['#d97706', '#1c1917', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'],
            borderWidth: 0
        }]
    };
});

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { 
        legend: { display: false },
        tooltip: {
            padding: 12,
            backgroundColor: '#1C1E23',
            cornerRadius: 12
        }
    },
    scales: { 
        y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' } },
        x: { grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
    },
    borderRadius: 12,
    barThickness: 24
};

const verticalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
        y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { stepSize: 1, font: { size: 9 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } }
    }
};

const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        r: {
            angleLines: { color: 'rgba(0,0,0,0.05)' },
            grid: { color: 'rgba(0,0,0,0.05)' },
            pointLabels: { font: { size: 10, weight: 'bold' } },
            ticks: { display: false }
        }
    }
};
</script>

<template>
    <Head title="Dashboard Analitik" />

    <AuthenticatedLayout>
        <div class="py-10 bg-[#F8F9FD] min-h-screen">
            <div class="max-w-[1600px] mx-auto px-6 lg:px-10 space-y-12">
                
                <!-- MODERN DASHBOARD HEADER -->
                <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6 animate-fade-in-up">
                    <div>
                        <h2 class="text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                            Insights <span class="text-amber-600 italic">Analitik</span>
                        </h2>
                        <p class="text-slate-400 text-xs mt-2 font-medium">
                            Pantau performa finansial, efisiensi operasional, dan aktivitas kasir Denjavas Cafe secara real-time.
                        </p>
                        <div class="flex flex-wrap items-center gap-3 mt-3">
                            <span class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Periode: {{ new Date(filters.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }} — {{ new Date(filters.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                            </span>
                            <span class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Terakhir Diperbarui: Hari Ini
                            </span>
                        </div>
                    </div>

                    <!-- Actions Area (Filters & Active Shift) -->
                    <div class="flex flex-wrap items-center gap-4">
                        <!-- Date Filter Form -->
                        <form @submit.prevent="submitFilter" class="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-amber-300">
                            <div class="flex items-center gap-2 px-2">
                                <DatePicker 
                                    v-model="form.start_date" 
                                    placeholder="Mulai"
                                    class="!w-48 sm:!w-56"
                                />
                                <span class="text-slate-300 font-light">—</span>
                                <DatePicker 
                                    v-model="form.end_date" 
                                    placeholder="Selesai"
                                    class="!w-48 sm:!w-56"
                                />
                            </div>
                            <button type="submit" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </button>
                        </form>

                        <!-- Active Shift Status Card -->
                        <div v-if="activeShift" class="group bg-white border border-slate-100 px-5 py-3 rounded-[2rem] shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                            <div class="relative flex h-3.5 w-3.5">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Shift Aktif</span>
                                <span class="text-xs font-bold text-slate-700 mt-1">{{ activeShift.user?.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION: OVERVIEW -->
                <div class="flex items-center gap-4 animate-fade-in-up">
                    <div class="h-px flex-grow bg-slate-200/50"></div>
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">Ringkasan Performa</span>
                    <div class="h-px flex-grow bg-slate-200/50"></div>
                </div>

                <!-- MAIN KPI GRID (DEALDECK STYLE) -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Primary Card: Total Sales -->
                    <div class="lg:col-span-1 bg-gradient-to-br from-amber-500 to-amber-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-amber-200 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
                        <div class="flex items-start justify-between mb-8 relative z-10">
                            <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h.01"/><path d="M11 15h.01"/></svg>
                            </div>
                            <div class="bg-emerald-400 text-[#064e3b] px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg shadow-emerald-900/10">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="18 15 12 9 6 15"/></svg>
                                {{ kpis.financial.revenueChange >= 0 ? '+' : '' }}{{ kpis.financial.revenueChange.toFixed(1) }}%
                            </div>
                        </div>
                        <p class="text-amber-100 text-[11px] font-black uppercase tracking-widest relative z-10">Total Revenue</p>
                        <h3 class="text-4xl font-black mt-2 tracking-tighter relative z-10">Rp {{ formatPrice(kpis.financial.revenue) }}</h3>
                        <p class="text-amber-200 text-[9px] font-bold mt-4 uppercase tracking-widest relative z-10">Revenue vs last period</p>
                    </div>

                    <!-- Secondary Cards Grid -->
                    <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Card: Total Orders -->
                        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div class="flex items-start justify-between mb-8">
                                <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                </div>
                                <div class="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="18 15 12 9 6 15"/></svg>
                                    +12.4%
                                </div>
                            </div>
                            <p class="text-slate-400 text-[11px] font-black uppercase tracking-widest">Total Orders</p>
                            <h3 class="text-3xl font-black text-[#1C1E23] mt-2 tracking-tighter">{{ kpis.orders.total }}</h3>
                            <p class="text-slate-300 text-[9px] font-bold mt-4 uppercase tracking-widest">Orders vs last period</p>
                        </div>

                        <!-- Card: Net Profit -->
                        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div class="flex items-start justify-between mb-8">
                                <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                                </div>
                                <div :class="kpis.financial.revenueChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'" class="px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                                    <svg v-if="kpis.financial.revenueChange >= 0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="18 15 12 9 6 15"/></svg>
                                    <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="6 9 12 15 18 9"/></svg>
                                    {{ Math.abs(kpis.financial.revenueChange).toFixed(1) }}%
                                </div>
                            </div>
                            <p class="text-slate-400 text-[11px] font-black uppercase tracking-widest">Net Profit</p>
                            <h3 class="text-3xl font-black text-[#1C1E23] mt-2 tracking-tighter">Rp {{ formatPrice(kpis.financial.netProfit) }}</h3>
                            <p class="text-slate-300 text-[9px] font-bold mt-4 uppercase tracking-widest">Profit vs last period</p>
                        </div>

                        <!-- Card: Avg Basket -->
                        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div class="flex items-start justify-between mb-8">
                                <div class="w-12 h-12 bg-stone-100 text-stone-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                </div>
                                <div class="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="18 15 12 9 6 15"/></svg>
                                    {{ kpis.orders.avgBasketChange.toFixed(1) }}%
                                </div>
                            </div>
                            <p class="text-slate-400 text-[11px] font-black uppercase tracking-widest">Avg Basket Size</p>
                            <h3 class="text-3xl font-black text-[#1C1E23] mt-2 tracking-tighter">Rp {{ formatPrice(kpis.orders.avgBasket) }}</h3>
                            <p class="text-slate-300 text-[9px] font-bold mt-4 uppercase tracking-widest">Basket vs last period</p>
                        </div>
                    </div>
                </div>

                <!-- SECTION: FINANCIAL -->
                <div class="flex items-center gap-4 pt-4">
                    <div class="w-2 h-6 bg-amber-500 rounded-full"></div>
                    <span class="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Analisis Finansial & Produk</span>
                </div>

                <!-- ANALYTICS GRID ROW 1: TRENDS & CATEGORIES -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div class="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
                        <div class="flex items-center justify-between mb-10">
                            <div>
                                <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Financial Trends</h3>
                                <p class="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Revenue and Expenses analysis</p>
                            </div>
                            <div class="flex items-center gap-6">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-slate-200"></div>
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div class="h-[400px]">
                            <Line :data="salesTrendData" :options="chartOptions" />
                        </div>
                    </div>

                    <div class="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50 flex flex-col">
                        <h3 class="text-xl font-black text-[#1C1E23] tracking-tight mb-8">Kategori Terlaris</h3>
                        <div class="h-[250px] relative flex items-center justify-center">
                            <Doughnut :data="categoryRevenueData" :options="doughnutOptions" />
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="text-3xl font-black text-[#1C1E23]">{{ categoryRevenue.length }}</span>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Kategori</span>
                            </div>
                        </div>
                        <div class="mt-8 space-y-4 flex-grow overflow-y-auto pr-2">
                            <div v-for="(item, idx) in categoryRevenue.slice(0, 4)" :key="idx" class="flex items-center justify-between group">
                                <div class="flex items-center gap-3">
                                    <div :style="{ backgroundColor: ['#D97706', '#F59E0B', '#1C1917', '#10B981'][idx] }" class="w-2 h-2 rounded-full"></div>
                                    <span class="text-sm font-bold text-slate-600 group-hover:text-amber-600 transition-colors">{{ item.category_name }}</span>
                                </div>
                                <span class="text-xs font-black text-[#1C1E23]">Rp {{ formatPrice(item.revenue) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION: OPERATIONAL -->
                <div class="flex items-center gap-4 pt-4">
                    <div class="w-2 h-6 bg-amber-500 rounded-full"></div>
                    <span class="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Wawasan Operasional</span>
                </div>

                <!-- ANALYTICS GRID ROW 2: BUBBLES & RADAR (INSIGHTS) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div class="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
                        <div class="mb-8">
                            <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Meja Populer</h3>
                            <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Distribusi Penggunaan Meja</p>
                        </div>
                        <div class="h-64">
                            <Bar v-if="popularTables.length > 0" :data="popularTablesData" :options="barChartOptions" />
                        </div>
                    </div>
                    <div class="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <div class="mb-8">
                                <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Performa Kasir</h3>
                                <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Kontribusi Revenue per Kasir</p>
                            </div>
                            <div class="h-64">
                                <PolarArea v-if="cashierPerformance.length > 0" :data="cashierPerformanceData" :options="radarOptions" />
                            </div>
                        </div>
                        <div>
                            <div class="mb-8">
                                <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Menu Kurang Laku</h3>
                                <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Analisis Menu Tidak Diminati</p>
                            </div>
                            <div class="h-64">
                                <Bar v-if="slowMenus.length > 0" :data="slowMenusData" :options="barChartOptions" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION: INVENTORY & ACTIVITY -->
                <div class="flex items-center gap-4 pt-4">
                    <div class="w-2 h-6 bg-emerald-500 rounded-full"></div>
                    <span class="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Manajemen Stok & Aktivitas</span>
                </div>

                <!-- ANALYTICS GRID ROW 3: STOCK & VARIANTS -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
                        <div class="mb-8">
                            <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Proyeksi Stok</h3>
                            <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Estimasi Hari Habis Persediaan</p>
                        </div>
                        <div class="space-y-6">
                            <div v-for="item in stockProjection.slice(0, 5)" :key="item.id" class="flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                        {{ item.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-black text-[#1C1E23]">{{ item.name }}</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ item.current_stock }} {{ item.unit }} Left</p>
                                    </div>
                                </div>
                                <span :class="item.days_remaining < 3 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    {{ item.days_remaining }} Days Left
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
                        <div class="mb-8">
                            <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Kontribusi Varian</h3>
                            <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Pendapatan dari Opsi & Topping</p>
                        </div>
                        <div class="space-y-6">
                            <div v-for="(variant, idx) in variantContribution.slice(0, 5)" :key="idx" class="space-y-2">
                                <div class="flex justify-between items-center">
                                    <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest">{{ variant.option_name }}</span>
                                    <span class="text-xs font-black text-[#1C1E23]">Rp {{ formatPrice(variant.revenue) }}</span>
                                </div>
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-amber-600 rounded-full" :style="{ width: (variant.revenue / variantContribution[0].revenue * 100) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CRITICAL INVENTORY NOTIFICATION -->
                <div v-if="lowStockItems.length > 0" class="bg-red-50 rounded-[3rem] p-10 border border-red-100 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            </div>
                            <h3 class="text-2xl font-black text-red-900 tracking-tight">Critical Inventory <span class="text-red-400 font-bold ml-2">Needs Attention</span></h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div v-for="item in lowStockItems.slice(0, 4)" :key="item.id" class="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm flex items-center justify-between group hover:scale-105 transition-transform">
                                <div>
                                    <p class="text-sm font-black text-red-900">{{ item.name }}</p>
                                    <p class="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Min: {{ item.minimum_stock }} {{ item.unit }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-black text-red-600 tracking-tight">{{ item.current_stock }}</p>
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Current</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RECENT ACTIVITY GRID: TRANSACTIONS & PETTY CASH -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                    <div class="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-xl font-black text-[#1C1E23] tracking-tight">Recent Transactions</h3>
                                <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Monitor Pesanan Real-time</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button @click="orderPage--" :disabled="orderPage === 1" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg></button>
                                <button @click="orderPage++" :disabled="orderPage === totalOrderPages" class="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 shadow-lg shadow-amber-200 disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6" transform="rotate(180 12 12)"/></svg></button>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div v-for="order in pagedOrders" :key="order.id" class="flex items-center justify-between p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                <div class="flex items-center gap-5">
                                    <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xs">#{{ order.order_number.slice(-2) }}</div>
                                    <div>
                                        <p class="text-sm font-black text-[#1C1E23]">{{ order.order_number }}</p>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ order.user?.name }} • {{ order.payment_method }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-black text-[#1C1E23]">Rp {{ formatPrice(order.total) }}</p>
                                    <span :class="order.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{{ order.status }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-4 bg-[#1C1E23] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                        <div class="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                        <div class="mb-8">
                            <h3 class="text-xl font-black text-white tracking-tight">Kas Keluar Terakhir</h3>
                            <p class="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-widest">Audit Pengeluaran Terbaru</p>
                        </div>
                        <div class="space-y-6">
                            <div v-for="pc in pagedPettyCash" :key="pc.id" class="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                                <div>
                                    <p class="text-xs font-bold text-slate-300">{{ pc.notes || 'No description' }}</p>
                                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{{ new Date(pc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
                                </div>
                                <span class="text-xs font-black text-red-400">-Rp {{ formatPrice(pc.amount) }}</span>
                            </div>
                        </div>
                        <div class="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
                            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Page {{ pettyCashPage }} / {{ totalPettyCashPages }}</span>
                            <div class="flex gap-2">
                                <button @click="pettyCashPage--" :disabled="pettyCashPage === 1" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 disabled:opacity-20"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg></button>
                                <button @click="pettyCashPage++" :disabled="pettyCashPage === totalPettyCashPages" class="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-20"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6" transform="rotate(180 12 12)"/></svg></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.delay-75 { animation-delay: 0.1s; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #E7E5E4; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #D6D3D1; }
</style>
