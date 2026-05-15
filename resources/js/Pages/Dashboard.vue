<script setup>
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { Line, Bar } from 'vue-chartjs';
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
  Filler
} from 'chart.js';

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler
);

const props = defineProps({
    filters: Object,
    kpis: Object,
    salesTrend: Array,
    topMenus: Array,
    lowStockItems: Array,
    activeShift: Object,
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
    return {
        labels: props.salesTrend.map(item => new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
        datasets: [{
            label: 'Pendapatan',
            data: props.salesTrend.map(item => item.revenue),
            borderColor: '#d97706',
            backgroundColor: 'rgba(217, 119, 6, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { callback: (value) => 'Rp ' + Number(value).toLocaleString('id-ID') }
        }
    }
};

const topMenusData = computed(() => {
    return {
        labels: props.topMenus.map(item => item.menu.name),
        datasets: [{
            label: 'Terjual (Qty)',
            data: props.topMenus.map(item => item.total_quantity),
            backgroundColor: '#d97706',
            borderRadius: 6,
        }]
    };
});

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
};
</script>

<template>
    <Head title="Dashboard Analitik" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 class="text-2xl font-serif font-bold text-[#292524] leading-tight">
                        Dashboard <span class="text-amber-600">Analitik</span>
                    </h2>
                    <p class="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
                        Periode: {{ new Date(filters.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }} - {{ new Date(filters.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                    </p>
                </div>
                
                <div class="flex flex-wrap items-center gap-4">
                    <form @submit.prevent="submitFilter" class="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <input v-model="form.start_date" type="date" class="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer">
                        <span class="text-slate-300">-</span>
                        <input v-model="form.end_date" type="date" class="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer">
                        <button type="submit" class="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl transition-all active:scale-90">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </button>
                    </form>

                    <div v-if="activeShift" class="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-amber-700 flex items-center gap-3">
                        <span class="relative flex h-3 w-3">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span class="text-[10px] font-black uppercase tracking-widest">Shift: {{ activeShift.user?.name }}</span>
                    </div>
                </div>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Revenue -->
                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div class="relative z-10">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Pendapatan</p>
                            <h3 class="text-3xl font-black text-slate-800">Rp {{ formatPrice(kpis.revenuePeriod) }}</h3>
                            <div class="mt-4 flex items-center gap-2">
                                <span :class="kpis.revenueChange >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'" class="px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                    <svg v-if="kpis.revenueChange >= 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                                    {{ Math.abs(kpis.revenueChange).toFixed(1) }}%
                                </span>
                                <span class="text-xs text-slate-400 font-medium">vs Periode Lalu</span>
                            </div>
                        </div>
                    </div>

                    <!-- Transactions -->
                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div class="relative z-10">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Transaksi</p>
                            <h3 class="text-3xl font-black text-slate-800">{{ kpis.transactionsPeriod }} <span class="text-lg text-slate-400">Order</span></h3>
                            <div class="mt-4 flex items-center gap-2">
                                <span class="text-xs text-slate-400 font-medium">Pesanan Sukses dalam Periode</span>
                            </div>
                        </div>
                    </div>

                    <!-- Petty Cash -->
                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div class="relative z-10">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kas Keluar (Petty Cash)</p>
                            <h3 class="text-3xl font-black text-slate-800">Rp {{ formatPrice(kpis.pettyCashPeriod) }}</h3>
                            <div class="mt-4 flex items-center gap-2">
                                <span class="text-xs text-slate-400 font-medium">Pengeluaran Periode Ini</span>
                            </div>
                        </div>
                    </div>

                    <!-- Estimated Balance -->
                    <div class="bg-slate-900 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                        <div class="absolute -right-6 -top-6 w-24 h-24 bg-slate-800 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                        <div class="relative z-10">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estimasi Saldo Laci</p>
                            <h3 class="text-3xl font-black text-white">Rp {{ formatPrice(kpis.estimatedBalance) }}</h3>
                            <div class="mt-4 flex items-center gap-2">
                                <span class="text-xs text-amber-500 font-medium">Aktual saat shift aktif</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Revenue Trend -->
                    <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Tren Penjualan</h3>
                        <div class="h-72">
                            <Line v-if="salesTrend.length > 0" :data="salesTrendData" :options="chartOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic">Data belum mencukupi</div>
                        </div>
                    </div>

                    <!-- Top Menus -->
                    <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Top 5 Menu Periode Ini</h3>
                        <div class="h-72">
                            <Bar v-if="topMenus.length > 0" :data="topMenusData" :options="barChartOptions" />
                            <div v-else class="h-full flex items-center justify-center text-slate-400 italic">Belum ada penjualan</div>
                        </div>
                    </div>
                </div>

                <!-- Low Stock Alert -->
                <div v-if="lowStockItems.length > 0" class="bg-red-50 border border-red-100 rounded-[2.5rem] p-8">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <h3 class="text-lg font-black text-red-800 uppercase tracking-widest">Peringatan Stok Menipis</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="item in lowStockItems" :key="item.id" class="bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p class="font-bold text-slate-800">{{ item.name }}</p>
                                <p class="text-[10px] uppercase font-black tracking-wider text-slate-400">Batas: {{ item.minimum_stock }} {{ item.unit }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-2xl font-black text-red-600">{{ item.current_stock }}</p>
                                <p class="text-[10px] uppercase font-black tracking-wider text-red-400">{{ item.unit }}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </AuthenticatedLayout>
</template>
