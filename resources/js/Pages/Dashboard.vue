<script setup>
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import DatePicker from '@/Components/DatePicker.vue';
import { Line, Bar, Doughnut, Radar, Bubble } from 'vue-chartjs';
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
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, ArcElement, RadialLinearScale
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
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
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
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 2,
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
            padding: 12,
            backgroundColor: 'rgba(28, 25, 23, 0.9)',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            cornerRadius: 12,
            displayColors: true
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { 
                font: { size: 10, weight: 'bold' },
                color: '#94a3b8',
                callback: (value) => 'Rp ' + (value >= 1000000 ? (value/1000000).toFixed(1) + 'jt' : Number(value).toLocaleString('id-ID'))
            }
        },
        x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
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
            backgroundColor: '#f59e0b',
            borderRadius: 6
        }]
    };
});

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
        datasets: [{
            label: 'Populer',
            data: props.popularTables.map(item => ({
                x: item.cafe_table.number,
                y: item.count,
                r: Math.min(item.count * 5, 25)
            })),
            backgroundColor: 'rgba(217, 119, 6, 0.6)',
        }]
    };
});

const slowMenusData = computed(() => {
    return {
        labels: props.slowMenus.map(item => item.name),
        datasets: [{
            label: 'Qty Terjual',
            data: props.slowMenus.map(item => item.total_sold),
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            pointBackgroundColor: '#ef4444',
            borderWidth: 2
        }]
    };
});

const cashierPerformanceData = computed(() => {
    return {
        labels: props.cashierPerformance.map(item => item.user.name),
        datasets: [{
            label: 'Revenue',
            data: props.cashierPerformance.map(item => item.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            borderWidth: 2
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

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '75%'
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { 
        y: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } },
        x: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 9 } } }
    }
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

const bubbleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { title: { display: true, text: 'Frekuensi', font: { size: 10 } } },
        x: { title: { display: true, text: 'No. Meja', font: { size: 10 } } }
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
        <template #header>
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div class="animate-fade-in-up">
                    <h2 class="text-3xl font-serif font-bold text-[#1C1917] tracking-tight leading-tight">
                        Insights <span class="text-amber-600 italic">Analitik</span>
                    </h2>
                    <p class="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black mt-2">
                        Periode: {{ new Date(filters.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }} - {{ new Date(filters.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                    </p>
                </div>
                
                <div class="flex flex-wrap items-center gap-4 animate-fade-in-up delay-75">
                    <form @submit.prevent="submitFilter" class="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm transition-all focus-within:shadow-md focus-within:border-amber-300">
                        <div class="flex items-center gap-2 px-1">
                            <DatePicker 
                                v-model="form.start_date" 
                                placeholder="Mulai"
                                class="!w-60"
                            />
                            <span class="text-slate-300 font-light">—</span>
                            <DatePicker 
                                v-model="form.end_date" 
                                placeholder="Selesai"
                                class="!w-60"
                            />
                        </div>
                        <button type="submit" class="bg-[#1C1917] hover:bg-black text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-black/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </button>
                    </form>

                    <div v-if="activeShift" class="group bg-white border border-slate-200/60 px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                        <div class="relative flex h-3 w-3">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Shift Aktif</span>
                            <span class="text-xs font-bold text-slate-700 mt-0.5">{{ activeShift.user?.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div class="py-12 bg-[#FAFAF9]/50 min-h-screen">
            <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                               <!-- KPI CARDS SECTION (Unified Design) -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    <!-- Revenue KPI -->
                    <div class="group relative bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" class="text-amber-600"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 12c-2.67 0-5.33-1.33-5.33-4v-1c0-.55.45-1 1-1h8.67c.55 0 1 .45 1 1v1c0 2.67-2.67 4-5.33 4z"/></svg>
                        </div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-sm font-bold text-slate-400">Rp</span>
                            <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ formatPrice(kpis.revenuePeriod) }}</h3>
                        </div>
                        <div class="mt-6 flex items-center gap-3">
                            <div :class="kpis.revenueChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'" class="px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                                <svg v-if="kpis.revenueChange >= 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                                {{ Math.abs(kpis.revenueChange).toFixed(1) }}%
                            </div>
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">vs Prev</span>
                        </div>
                    </div>

                    <!-- Transactions KPI -->
                    <div class="group relative bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Volume</p>
                        <div class="flex items-baseline gap-2">
                            <h3 class="text-4xl font-black text-slate-900 tracking-tight">{{ kpis.transactionsPeriod }}</h3>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Orders</span>
                        </div>
                        <div class="mt-6 flex items-center gap-2">
                            <div class="flex -space-x-2">
                                <div v-for="i in 3" :key="i" class="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">{{ i }}</div>
                            </div>
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-2">Success</span>
                        </div>
                    </div>

                    <!-- Expenses KPI -->
                    <div class="group relative bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Expenses</p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase">Rp</span>
                            <h3 class="text-3xl font-black text-red-600 tracking-tight">{{ formatPrice(kpis.totalExpenses || 0) }}</h3>
                        </div>
                        <div class="mt-6 flex items-center gap-3">
                            <div class="px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                                COGS + Petty Cash
                            </div>
                        </div>
                    </div>

                    <!-- Net Profit KPI (Accent Card) -->
                    <div class="group relative bg-[#1C1917] rounded-[2rem] p-8 shadow-2xl transition-all hover:shadow-black/20 hover:-translate-y-1 overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Estimated Profit</p>
                        <div class="flex items-baseline gap-1 text-white">
                            <span class="text-sm font-bold opacity-40">Rp</span>
                            <h3 class="text-3xl font-black text-amber-500 tracking-tight">{{ formatPrice(kpis.netProfit || 0) }}</h3>
                        </div>
                        <div class="mt-6 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center justify-between">
                            <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Net Growth</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-amber-500"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        </div>
                    </div>
                </div>

                <!-- MAIN CHARTS SECTION -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Financial Performance Chart -->
                    <div class="lg:col-span-8 bg-white rounded-[2rem] p-10 border border-slate-200/50 shadow-sm relative overflow-hidden transition-all hover:shadow-lg">
                        <div class="flex items-center justify-between mb-10">
                            <div>
                                <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Performa Finansial</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tren Pendapatan & Pengeluaran Harian</p>
                            </div>
                            <div class="flex items-center gap-6">
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Income</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 rounded-full border-2 border-red-400 border-dashed"></div>
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expenses</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Profit</span>
                                </div>
                            </div>
                        </div>
                        <div class="h-96 w-full">
                            <Line v-if="salesTrend.length > 0 || expenseTrend.length > 0" :data="salesTrendData" :options="chartOptions" />
                            <div v-else class="h-full flex flex-col items-center justify-center space-y-4 text-slate-400 italic text-xs">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                                <span>Data transaksi belum tersedia</span>
                            </div>
                        </div>
                    </div>

                    <!-- Distributions Section -->
                    <div class="lg:col-span-4 grid grid-cols-1 gap-8">
                        <!-- Payment Methods Chart -->
                        <div class="bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg flex flex-col">
                            <div class="mb-6 text-center lg:text-left">
                                <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Metode Bayar</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Preferensi Transaksi</p>
                            </div>
                            <div class="h-44 relative flex-grow flex items-center justify-center">
                                <div class="w-full h-full max-w-[200px] max-h-[200px]">
                                    <Doughnut v-if="paymentMethods.length > 0" :data="paymentMethodsData" :options="doughnutOptions" />
                                </div>
                                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                    <span class="text-xl font-black text-slate-800">{{ kpis.transactionsPeriod }}</span>
                                </div>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2 justify-center">
                                <div v-for="(method, idx) in paymentMethods" :key="idx" class="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: ['#d97706', '#3b82f6', '#10b981', '#8b5cf6'][idx] || '#94a3b8' }"></div>
                                    <span class="text-[8px] font-black text-slate-600 uppercase">{{ method.payment_method }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Order Types Chart -->
                        <div class="bg-[#1C1917] rounded-[2rem] p-8 shadow-xl flex flex-col">
                            <div class="mb-6">
                                <h3 class="text-sm font-serif font-bold text-white tracking-tight">Tipe Pesanan</h3>
                                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Dine-in vs Takeaway</p>
                            </div>
                            <div class="h-44 relative flex-grow flex items-center justify-center">
                                <div v-full h-full>
                                    <Doughnut v-if="orderTypes.length > 0" :data="orderTypesData" :options="doughnutOptions" />
                                </div>
                                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span class="text-amber-500 font-serif italic text-2xl">v</span>
                                </div>
                            </div>
                            <div class="mt-4 flex gap-4 justify-center">
                                <div v-for="type in orderTypes" :key="type.order_type" class="flex flex-col items-center">
                                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">{{ type.order_type === 'dine_in' ? 'In' : 'Out' }}</span>
                                    <span class="text-sm font-black text-white">{{ type.count }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DEEP INSIGHTS SECTION (Low Priority Features) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Popular Tables Bubble Chart -->
                    <div class="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg">
                        <div class="mb-8">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Meja Populer</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Distribusi Penggunaan Meja</p>
                        </div>
                        <div class="h-64">
                            <Bubble v-if="popularTables.length > 0" :data="popularTablesData" :options="bubbleOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic text-xs">No Table Data</div>
                        </div>
                    </div>

                    <!-- Cashier Performance Radar Chart -->
                    <div class="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg">
                        <div class="mb-8">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Performa Kasir</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kontribusi Revenue per Kasir</p>
                        </div>
                        <div class="h-64">
                            <Radar v-if="cashierPerformance.length > 0" :data="cashierPerformanceData" :options="radarOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic text-xs">No Staff Data</div>
                        </div>
                    </div>

                    <!-- Slow Menus Radar Chart -->
                    <div class="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg">
                        <div class="mb-8">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Menu Kurang Diminati</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Analisis Menu Tidak Laku</p>
                        </div>
                        <div class="h-64">
                            <Radar v-if="slowMenus.length > 0" :data="slowMenusData" :options="radarOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic text-xs">No Slow Menus</div>
                        </div>
                    </div>
                </div>

                <!-- STOCK PROJECTION & VARIANT CONTRIBUTION -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Stock Projection Indicators -->
                    <div class="bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg">
                        <div class="mb-10">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Proyeksi Persediaan</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estimasi Hari Habis Stok</p>
                        </div>
                        <div class="space-y-6">
                            <div v-for="item in stockProjection.slice(0, 5)" :key="item.id" class="flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                        {{ item.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-slate-800">{{ item.name }}</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">{{ item.current_stock }} {{ item.unit }} Tersisa</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span :class="item.days_remaining < 3 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {{ item.days_remaining > 30 ? '> 30' : item.days_remaining }} Hari Lagi
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Variant Contribution Treemap-like Bar Chart -->
                    <div class="bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg flex flex-col">
                        <div class="mb-10">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Kontribusi Varian</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Revenue dari Topping/Opsi</p>
                        </div>
                        <div class="flex-grow flex flex-col justify-center space-y-4">
                            <div v-for="(variant, idx) in variantContribution.slice(0, 6)" :key="idx" class="relative">
                                <div class="flex justify-between items-center mb-1 relative z-10 px-1">
                                    <span class="text-[11px] font-bold text-slate-700">{{ variant.option_name }}</span>
                                    <span class="text-[11px] font-black text-slate-900">Rp {{ formatPrice(variant.revenue) }}</span>
                                </div>
                                <div class="w-full h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                    <div class="h-full bg-amber-500/20 border-r-2 border-amber-500 transition-all duration-1000" :style="{ width: (variant.revenue / variantContribution[0].revenue * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div v-if="variantContribution.length === 0" class="h-full flex items-center justify-center text-slate-400 italic text-xs">No Variant Data</div>
                        </div>
                    </div>
                </div>

                <!-- OPERATIONS SECTION (Original Category & Peak Hours) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Revenue per Category -->
                    <div class="bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg flex flex-col">
                        <div class="mb-8">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Profit Kategori</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kontribusi per Kelompok</p>
                        </div>
                        <div class="h-80 w-full">
                            <Bar v-if="categoryRevenue.length > 0" :data="categoryRevenueData" :options="barChartOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic text-xs">No Category Data</div>
                        </div>
                    </div>

                    <!-- Peak Hours -->
                    <div class="bg-white rounded-[2rem] p-8 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg flex flex-col">
                        <div class="mb-8">
                            <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Analisis Waktu</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Jam Sibuk Operasional</p>
                        </div>
                        <div class="h-80 w-full">
                            <Bar v-if="peakHours.length > 0" :data="peakHoursData" :options="verticalBarOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic text-xs">Data belum mencukupi</div>
                        </div>
                    </div>
                </div>

                <!-- CRITICAL INVENTORY SECTION -->
                <div v-if="lowStockItems.length > 0" class="space-y-6">
                    <div class="flex items-center justify-between px-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-8 bg-red-500 rounded-full"></div>
                            <div>
                                <h3 class="text-xl font-serif font-bold text-slate-900 tracking-tight">Critical Inventory</h3>
                                <p class="text-[10px] font-black text-red-500 uppercase tracking-widest">Restock diperlukan segera</p>
                            </div>
                        </div>
                        <Link :href="route('admin.raw-materials.index')" class="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                            Lihat Semua Stok
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
                        </Link>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div v-for="item in lowStockItems" :key="item.id" class="group bg-white rounded-[2rem] p-8 border border-red-100 shadow-sm transition-all hover:shadow-xl hover:border-red-200 overflow-hidden">
                            <div class="flex justify-between items-start mb-6">
                                <p class="font-bold text-slate-800 text-lg">{{ item.name }}</p>
                                <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div></div>
                            </div>
                            <div class="flex items-end justify-between">
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Available</span>
                                    <span class="text-4xl font-black text-red-600 tracking-tighter">{{ item.current_stock }}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Min Level</span>
                                    <p class="text-sm font-bold text-slate-500">{{ item.minimum_stock }} {{ item.unit }}</p>
                                </div>
                            </div>
                            <div class="mt-6 w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div class="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000" :style="{ width: Math.min((item.current_stock / item.minimum_stock) * 100, 100) + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RECENT ACTIVITY SECTION (Live Feed) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Recent Transactions -->
                    <div class="lg:col-span-8 bg-white rounded-[2rem] p-10 border border-slate-200/50 shadow-sm transition-all hover:shadow-lg">
                        <div class="flex items-center justify-between mb-10">
                            <div>
                                <h3 class="text-lg font-serif font-bold text-slate-900 tracking-tight">Transaksi Terakhir</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monitor Pesanan Real-time</p>
                            </div>
                            <Link :href="route('pos.history')" class="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Lihat Semua</Link>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="border-b border-slate-100">
                                        <th class="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Waktu</th>
                                        <th class="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Order #</th>
                                        <th class="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Kasir</th>
                                        <th class="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Total</th>
                                        <th class="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50">
                                    <tr v-for="order in recentOrders" :key="order.id" class="group hover:bg-slate-50 transition-colors">
                                        <td class="py-4 text-xs font-bold text-slate-400">
                                            {{ new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                                        </td>
                                        <td class="py-4 text-xs font-black text-slate-800 tracking-tight">{{ order.order_number }}</td>
                                        <td class="py-4 text-xs text-slate-500 font-medium">{{ order.user?.name }}</td>
                                        <td class="py-4 text-xs font-black text-slate-900 text-right">Rp {{ formatPrice(order.total) }}</td>
                                        <td class="py-4 text-center">
                                            <span :class="order.status === 'completed' ? 'bg-green-50 text-green-600' : (order.status === 'void' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                {{ order.status }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Recent Petty Cash -->
                    <div class="lg:col-span-4 bg-[#1C1917] rounded-[2rem] p-10 shadow-xl flex flex-col">
                        <div class="mb-10">
                            <h3 class="text-lg font-serif font-bold text-white tracking-tight">Kas Keluar Terakhir</h3>
                            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit Pengeluaran Terbaru</p>
                        </div>
                        <div class="space-y-6 flex-grow">
                            <div v-for="pc in recentPettyCash" :key="pc.id" class="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                                <div class="flex flex-col">
                                    <span class="text-xs font-bold text-slate-300 leading-tight">{{ pc.notes || 'No description' }}</span>
                                    <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                        {{ new Date(pc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }} • {{ new Date(pc.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                                    </span>
                                </div>
                                <span class="text-xs font-black text-red-400 tracking-tighter">-Rp {{ formatPrice(pc.amount) }}</span>
                            </div>
                            <div v-if="recentPettyCash.length === 0" class="h-full flex items-center justify-center text-slate-600 italic text-xs">No Recent Petty Cash</div>
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
