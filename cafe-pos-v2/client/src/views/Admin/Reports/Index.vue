<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
import api from '@/utils/api';

const filters = ref({ start_date: '', end_date: '', search: '' });
const dailySales = ref([]);
const shifts = ref([]);
const voidLogs = ref([]);
const menuPerformance = ref([]);
const pettyCashLogs = ref([]);
const orderHistory = ref([]);
const stockMutations = ref([]);
const isLoading = ref(true);

const form = ref({
    start_date: '',
    end_date: '',
});

const search = ref('');
const activeTab = ref('sales');

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/reports', {
            params: {
                start_date: form.value.start_date,
                end_date: form.value.end_date,
                search: search.value
            }
        });
        
        const data = response.data;
        filters.value = data.filters || { start_date: '', end_date: '', search: '' };
        
        // initialize form if empty
        if (!form.value.start_date) form.value.start_date = filters.value.start_date;
        if (!form.value.end_date) form.value.end_date = filters.value.end_date;
        if (!search.value && filters.value.search) search.value = filters.value.search;

        dailySales.value = data.dailySales || [];
        shifts.value = data.shifts || [];
        voidLogs.value = data.voidLogs || [];
        menuPerformance.value = data.menuPerformance || [];
        pettyCashLogs.value = data.pettyCashLogs || [];
        orderHistory.value = data.orderHistory || [];
        stockMutations.value = data.stockMutations || [];
        
    } catch (e) {
        console.error("Failed to fetch reports", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    // Set default dates if needed, or let backend handle it, then fetch
    fetchData();
});

const submitFilter = () => {
    fetchData();
};

// Vanilla Debounce
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

const performSearch = debounce(() => {
    fetchData();
}, 300);

watch(search, () => {
    performSearch();
});

const isExportOpen = ref(false);
const isReportDropdownOpen = ref(false);

const handleExport = (format) => {
    isExportOpen.value = false;
    let exportType = activeTab.value;
    if (activeTab.value === 'performance') exportType = 'menu_performance';
    if (activeTab.value === 'expenses') exportType = 'expenses';
    if (activeTab.value === 'transactions') exportType = 'transactions';
    if (activeTab.value === 'inventory') exportType = 'stock_mutations';
    
    // Construct export URL
    const query = new URLSearchParams({
        format: format,
        start_date: form.value.start_date || '',
        end_date: form.value.end_date || '',
        type: exportType,
        search: search.value || ''
    }).toString();
    
    window.open(`/api/reports/export?${query}`, '_blank');
};

const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
};

const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? '0' : num.toLocaleString('id-ID');
};

const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    });
};

const showOrderDetail = ref(false);
const selectedOrder = ref(null);

const viewOrder = (order) => {
    selectedOrder.value = order;
    showOrderDetail.value = true;
};

// --- Sorting Logic ---
const sortKey = ref('');
const sortDir = ref('asc');

const toggleSort = (key) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortDir.value = 'asc';
    }
};

const getSortedData = (data, key, dir) => {
    if (!key) return data;
    
    return [...data].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        
        // Handle nested properties (e.g., user.name)
        if (key.includes('.')) {
            valA = key.split('.').reduce((obj, i) => obj?.[i], a);
            valB = key.split('.').reduce((obj, i) => obj?.[i], b);
        }

        // Normalize null/undefined values safely
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        // Safely check if string comparison is needed
        const isStringA = typeof valA === 'string';
        const isStringB = typeof valB === 'string';

        if (isStringA || isStringB) {
            const strA = String(valA);
            const strB = String(valB);
            return dir === 'asc' 
                ? strA.localeCompare(strB) 
                : strB.localeCompare(strA);
        }
        
        return dir === 'asc' ? valA - valB : valB - valA;
    });
};

const sortedDailySales = computed(() => getSortedData(dailySales.value, sortKey.value || 'date', sortDir.value));
const sortedShifts = computed(() => getSortedData(shifts.value, sortKey.value || 'openedAt', sortDir.value));
const sortedMenuPerformance = computed(() => getSortedData(menuPerformance.value, sortKey.value || 'totalQty', sortDir.value));
const sortedPettyCashLogs = computed(() => getSortedData(pettyCashLogs.value, sortKey.value || 'createdAt', sortDir.value));
const sortedVoidLogs = computed(() => getSortedData(voidLogs.value, sortKey.value || 'createdAt', sortDir.value));
const sortedOrderHistory = computed(() => getSortedData(orderHistory.value, sortKey.value || 'createdAt', sortDir.value));
const sortedStockMutations = computed(() => getSortedData(stockMutations.value, sortKey.value || 'createdAt', sortDir.value));

// --- Pagination Logic ---
const perPage = 10;
const pages = ref({
    sales: 1,
    shifts: 1,
    performance: 1,
    expenses: 1,
    voids: 1,
    transactions: 1,
    inventory: 1,
});

const paginate = (data, page) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
};

const totalPages = (data) => Math.max(1, Math.ceil(data.length / perPage));

const goPage = (tab, page) => {
    const max = totalPages(getFullDataForTab(tab));
    pages.value[tab] = Math.max(1, Math.min(page, max));
};

const getFullDataForTab = (tab) => {
    const map = {
        sales: sortedDailySales.value,
        shifts: sortedShifts.value,
        performance: filteredMenuPerformance.value,
        expenses: sortedPettyCashLogs.value,
        voids: sortedVoidLogs.value,
        transactions: sortedOrderHistory.value,
        inventory: sortedStockMutations.value,
    };
    return map[tab] || [];
};

// Reset pages when tab changes
watch(activeTab, () => {
    sortKey.value = '';
    sortDir.value = 'asc';
});

const pagedDailySales = computed(() => paginate(sortedDailySales.value, pages.value.sales));
const pagedShifts = computed(() => paginate(sortedShifts.value, pages.value.shifts));
const pagedPettyCashLogs = computed(() => paginate(sortedPettyCashLogs.value, pages.value.expenses));
const pagedVoidLogs = computed(() => paginate(sortedVoidLogs.value, pages.value.voids));
const pagedOrderHistory = computed(() => paginate(sortedOrderHistory.value, pages.value.transactions));
const pagedStockMutations = computed(() => paginate(sortedStockMutations.value, pages.value.inventory));
const pagedMenuPerformance = computed(() => paginate(filteredMenuPerformance.value, pages.value.performance));

const resetFilters = () => {
    search.value = '';
    form.value.start_date = '';
    form.value.end_date = '';
    selectedCategory.value = 'all';
    Object.keys(pages.value).forEach(k => pages.value[k] = 1);
    fetchData(); // This will fetch with default dates from backend
};

const selectedCategory = ref('all');
const categories = computed(() => {
    const cats = new Set(menuPerformance.value.map(m => m.category_name));
    return ['all', ...Array.from(cats)];
});

const filteredMenuPerformance = computed(() => {
    if (selectedCategory.value === 'all') return sortedMenuPerformance.value;
    return sortedMenuPerformance.value.filter(m => m.category_name === selectedCategory.value);
});

// --- Row Expansion Logic ---
const expandedDailySales = ref(null);
const expandedShift = ref(null);

const toggleDailySales = (date) => {
    expandedDailySales.value = expandedDailySales.value === date ? null : date;
};

const toggleShift = (id) => {
    expandedShift.value = expandedShift.value === id ? null : id;
};

const getOrdersForDate = (date) => {
    return orderHistory.value.filter(o => String(o.createdAt || o.createdAt).startsWith(date));
};


// --- Summary Calculations ---
const totals = computed(() => {
    return {
        dailySales: {
            orders: dailySales.value.reduce((sum, item) => sum + safeNumber(item.total_orders), 0),
            revenue: dailySales.value.reduce((sum, item) => sum + safeNumber(item.revenue), 0),
            petty: dailySales.value.reduce((sum, item) => sum + safeNumber(item.petty_cash), 0),
            net: dailySales.value.reduce((sum, item) => sum + safeNumber(item.net_profit), 0),
        },
        shifts: {
            sales: shifts.value.reduce((sum, item) => sum + safeNumber(item.totalCashSales || item.totalCashSales), 0),
            physical: shifts.value.reduce((sum, item) => sum + safeNumber(item.closingCash || item.closingCash), 0),
            diff: shifts.value.reduce((sum, item) => {
                if (!item.closedAt && !item.closedAt) return sum;
                const expected = safeNumber(item.opening_balance || item.openingBalance) + safeNumber(item.totalCashSales || item.totalCashSales) - safeNumber(item.petty_cash_sum);
                return sum + (safeNumber(item.closingCash || item.closingCash) - expected);
            }, 0)
        },
        performance: {
            qty: filteredMenuPerformance.value.reduce((sum, item) => sum + safeNumber(item.totalQty), 0),
            revenue: filteredMenuPerformance.value.reduce((sum, item) => sum + safeNumber(item.totalRevenue), 0),
        },
        expenses: pettyCashLogs.value.reduce((sum, item) => sum + safeNumber(item.amount), 0),
        voids: voidLogs.value.reduce((sum, item) => sum + safeNumber(item.total), 0),
        transactions: orderHistory.value.reduce((sum, item) => sum + safeNumber(item.total), 0)
    };
});

const profitability = computed(() => {
    const total_cogs = filteredMenuPerformance.value.reduce((sum, item) => sum + safeNumber(item.total_cogs), 0);
    const gross_profit = filteredMenuPerformance.value.reduce((sum, item) => sum + safeNumber(item.margin), 0);
    return {
        total_cogs,
        gross_profit
    };
});
</script>

<template>

            <div class="py-6 sm:py-8 lg:py-12 bg-[#FAFAF9]/50 min-h-screen">
            <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
                <!-- MODERN PAGE HEADER -->
                <div class="flex flex-col gap-2 mb-6 lg:mb-8 animate-fade-in">
                    <div>
                        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                            Insights <span class="text-amber-600 italic">Analitik</span>
                        </h2>
                        <p class="text-slate-400 text-[10px] sm:text-xs mt-1.5 font-medium">
                            Pantau performa finansial, efisiensi operasional, dan aktivitas kasir Denjavas Cafe secara real-time.
                        </p>
                        <div class="flex items-center gap-3 mt-2 text-[10px] sm:text-xs font-bold text-slate-500">
                            <span>Periode: {{ formatDate(form.start_date) }} — {{ formatDate(form.end_date) }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Centered Report Selector Dropdown -->
                <div class="flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4 animate-fade-in-up relative z-20">
                    <div class="relative w-full sm:max-w-md">
                        <button 
                            @click="isReportDropdownOpen = !isReportDropdownOpen"
                            class="w-full bg-white border-2 border-slate-100 rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between shadow-xl shadow-slate-200/40 hover:border-amber-500/50 transition-all group active:scale-95"
                        >
                            <div class="flex items-center gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 text-white transition-transform group-hover:scale-110">
                                    <svg v-if="activeTab === 'dashboard'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                                    <svg v-else-if="activeTab === 'sales'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    <svg v-else-if="activeTab === 'performance'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <svg v-else-if="activeTab === 'inventory'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                                    <svg v-else-if="activeTab === 'shifts'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                                    <svg v-else-if="activeTab === 'transactions'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                    <svg v-else-if="activeTab === 'expenses'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                </div>
                                <div class="text-left">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Pilih Jenis Laporan</p>
                                    <h4 class="text-base sm:text-xl font-serif font-black text-slate-900 leading-none">
                                        {{ 
                                            activeTab === 'sales' ? 'Penjualan Harian' : 
                                            activeTab === 'shifts' ? 'Riwayat Shift' : 
                                            activeTab === 'transactions' ? 'Riwayat Transaksi' : 
                                            activeTab === 'performance' ? 'Performa Menu' : 
                                            activeTab === 'inventory' ? 'Audit Stok Bahan' : 
                                            activeTab === 'expenses' ? 'Buku Kas Keluar' : 'Log Void' 
                                        }}
                                    </h4>
                                </div>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="{'rotate-180': isReportDropdownOpen}" class="text-slate-300 transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                        </button>

                        <!-- Dropdown Menu -->
                        <Transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="transform scale-95 opacity-0 -translate-y-4"
                            enter-to-class="transform scale-100 opacity-100 translate-y-0"
                            leave-active-class="transition duration-150 ease-in"
                            leave-from-class="transform scale-100 opacity-100 translate-y-0"
                            leave-to-class="transform scale-95 opacity-0 -translate-y-4"
                        >
                            <div v-if="isReportDropdownOpen" class="absolute inset-x-0 mt-2 sm:mt-4 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-slate-100 py-2 sm:py-4 z-[100] overflow-hidden">
                                <button 
                                    v-for="tab in [
                                        {id: 'sales', label: 'Penjualan Harian'},
                                        {id: 'performance', label: 'Performa Menu'},
                                        {id: 'inventory', label: 'Audit Stok Bahan'},
                                        {id: 'shifts', label: 'Riwayat Shift'},
                                        {id: 'transactions', label: 'Riwayat Transaksi'},
                                        {id: 'expenses', label: 'Buku Kas Keluar'},
                                        {id: 'voids', label: 'Log Void'}
                                    ]" 
                                    :key="tab.id"
                                    @click="activeTab = tab.id; isReportDropdownOpen = false"
                                    class="w-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                >
                                    <div class="flex items-center gap-4">
                                        <span class="text-xl grayscale group-hover:grayscale-0 transition-all">{{ tab.icon }}</span>
                                        <span :class="activeTab === tab.id ? 'text-amber-600 font-black' : 'text-slate-600 font-bold'" class="text-sm tracking-wide">{{ tab.label }}</span>
                                    </div>
                                    <div v-if="activeTab === tab.id" class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                </button>
                            </div>
                        </Transition>
                    </div>

                     <!-- Toolbar: Filter, Search, and Export -->
                     <div class="flex flex-col gap-3 sm:gap-4 w-full delay-100">
                         <!-- Date Filter -->
                         <form @submit.prevent="submitFilter" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-2 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm">
                             <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
                                 <DatePicker 
                                     v-model="form.start_date" 
                                     label="Mulai"
                                     placeholder="Awal"
                                     class="w-full"
                                 />
                                 <span class="text-slate-300 font-bold px-1 text-xs uppercase tracking-widest text-center hidden sm:block">to</span>
                                 <DatePicker 
                                     v-model="form.end_date" 
                                     label="Sampai"
                                     placeholder="Akhir"
                                     class="w-full"
                                 />
                             </div>
                             <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-600/20 active:scale-95 text-center whitespace-nowrap">
                                 Filter
                             </button>
                         </form>
 
                         <div class="flex items-center gap-2 sm:gap-3 w-full">
                             <!-- Search Input -->
                             <div class="relative group flex-1 min-w-0">
                                 <span class="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="sm:w-[22px] sm:h-[22px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                 </span>
                                 <input 
                                     v-model="search" 
                                     type="text" 
                                     :placeholder="'Cari dalam ' + (activeTab === 'sales' ? 'Penjualan' : (activeTab === 'shifts' ? 'Shift' : (activeTab === 'transactions' ? 'Transaksi' : 'Laporan'))) + '...'" 
                                     class="w-full bg-white border border-slate-200 rounded-2xl sm:rounded-[2rem] pl-12 sm:pl-16 pr-6 sm:pr-8 py-3 sm:py-[1.125rem] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-xs sm:text-sm font-bold shadow-sm"
                                 >
                                 <button 
                                     v-if="search" 
                                     @click="search = ''"
                                     class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                                 >
                                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                 </button>
                             </div>
 
                             <!-- Export Dropdown (Icon Only) -->
                             <div class="relative flex-shrink-0">
                                 <button 
                                     @click="isExportOpen = !isExportOpen"
                                     title="Export Laporan"
                                     class="w-11 h-11 sm:w-[60px] sm:h-[60px] bg-slate-900 text-white rounded-xl sm:rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group flex-shrink-0"
                                 >
                                     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:scale-110 transition-transform"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                 </button>
 
                                 <Transition
                                     enter-active-class="transition duration-200 ease-out"
                                     enter-from-class="transform scale-95 opacity-0 -translate-y-4"
                                     enter-to-class="transform scale-100 opacity-100 translate-y-0"
                                     leave-active-class="transition duration-150 ease-in"
                                     leave-from-class="transform scale-100 opacity-100 translate-y-0"
                                     leave-to-class="transform scale-95 opacity-0 -translate-y-4"
                                 >
                                     <div v-if="isExportOpen" class="absolute right-0 mt-4 w-56 bg-white rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-[90] overflow-hidden">
                                         <button @click="handleExport('pdf')" class="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors group">
                                             <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                             </div>
                                             <div class="flex flex-col">
                                                 <span class="text-[10px] font-black uppercase text-slate-700 tracking-wider">Format PDF</span>
                                                 <span class="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Siap Cetak</span>
                                             </div>
                                         </button>
                                         <button @click="handleExport('excel')" class="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors group border-t border-slate-50">
                                             <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                             </div>
                                             <div class="flex flex-col">
                                                 <span class="text-[10px] font-black uppercase text-slate-700 tracking-wider">Format Excel</span>
                                                 <span class="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Olah Data</span>
                                             </div>
                                         </button>
                                     </div>
                                 </Transition>
                             </div>
 
                             <!-- Reset Button (Icon Only) -->
                             <button 
                                 @click="resetFilters"
                                 title="Reset Semua Filter"
                                 class="w-11 h-11 sm:w-[60px] sm:h-[60px] bg-white text-slate-400 rounded-xl sm:rounded-2xl border-2 border-slate-100 hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center shadow-sm active:scale-95 group flex-shrink-0"
                             >
                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:rotate-180 transition-transform duration-500"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                             </button>
                         </div>
                     </div>
                </div>

                <!-- Tab Content -->
                <div class="bg-white rounded-[2rem] border border-slate-200/50 shadow-sm overflow-hidden transition-all delay-200">
                    


                    <!-- INVENTORY AUDIT TABLE -->
                    <div v-if="activeTab === 'inventory'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-serif font-bold text-slate-900">Audit Stok (Stock Ledger)</h3>
                                <p class="text-xs text-slate-500 mt-1">Log mutasi keluar masuk bahan baku</p>
                            </div>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('createdAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            Waktu
                                        </th>
                                        <th @click="toggleSort('rawMaterial.name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            Bahan Baku
                                        </th>
                                        <th @click="toggleSort('type')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-amber-600 transition-colors">
                                            Tipe
                                        </th>
                                        <th @click="toggleSort('quantity')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            Jumlah
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referensi / Catatan</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="mutation in pagedStockMutations" :key="mutation.id" class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(mutation.createdAt) }}</td>
                                        <td class="px-8 py-5">
                                            <span class="text-sm font-bold text-slate-800">{{ mutation.rawMaterial?.name }}</span>
                                        </td>
                                        <td class="px-8 py-5 text-center">
                                            <span 
                                                :class="mutation.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'" 
                                                class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                            >
                                                {{ mutation.type === 'in' ? 'Stok Masuk' : 'Stok Keluar' }}
                                            </span>
                                        </td>
                                        <td class="px-8 py-5 text-sm font-black text-right" :class="mutation.type === 'in' ? 'text-emerald-600' : 'text-red-600'">
                                            {{ mutation.type === 'in' ? '+' : '-' }}{{ mutation.quantity }}
                                        </td>
                                        <td class="px-8 py-5">
                                            <p class="text-xs font-bold text-slate-600">{{ mutation.reference }}</p>
                                            <p class="text-[9px] text-slate-400 italic">{{ mutation.notes }}</p>
                                        </td>
                                    </tr>
                                    <tr v-if="stockMutations.length === 0">
                                        <td colspan="5" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada mutasi stok pada periode ini</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <div 
                                v-for="mutation in pagedStockMutations" 
                                :key="mutation.id" 
                                class="py-5 flex flex-col gap-3"
                            >
                                <div class="flex items-start justify-between">
                                    <div>
                                        <span class="text-sm font-bold text-slate-800 block">{{ mutation.rawMaterial?.name }}</span>
                                        <span class="text-[10px] text-slate-500 font-medium">{{ formatDateTime(mutation.createdAt) }}</span>
                                    </div>
                                    <span 
                                        :class="mutation.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'" 
                                        class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                    >
                                        {{ mutation.type === 'in' ? 'Stok Masuk' : 'Stok Keluar' }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-baseline">
                                    <div class="text-[10px] text-slate-500 font-medium pr-4">
                                        <p class="font-bold text-slate-600 mb-0.5">{{ mutation.reference }}</p>
                                        <p class="text-[9px] text-slate-400 italic">{{ mutation.notes }}</p>
                                    </div>
                                    <span class="text-base font-black whitespace-nowrap" :class="mutation.type === 'in' ? 'text-emerald-600' : 'text-red-600'">
                                        {{ mutation.type === 'in' ? '+' : '-' }}{{ mutation.quantity }}
                                    </span>
                                </div>
                            </div>
                            <div v-if="stockMutations.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada mutasi stok pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedStockMutations.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.inventory }} dari {{ totalPages(sortedStockMutations) }} &middot; {{ sortedStockMutations.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('inventory', pages.inventory - 1)" :disabled="pages.inventory <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.inventory <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedStockMutations)" :key="p" @click="goPage('inventory', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.inventory === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('inventory', pages.inventory + 1)" :disabled="pages.inventory >= totalPages(sortedStockMutations)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.inventory >= totalPages(sortedStockMutations) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- SALES REPORT TABLE -->
                    <div v-if="activeTab === 'sales'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-serif font-bold text-slate-900">Ringkasan Penjualan Harian</h3>
                                <p class="text-xs text-slate-500 mt-1">Akumulasi pendapatan dan pengeluaran per hari</p>
                            </div>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('date')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Tanggal
                                                <svg v-if="sortKey === 'date'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('total_orders')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-center gap-2">
                                                Transaksi
                                                <svg v-if="sortKey === 'total_orders'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('revenue')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Omzet Bruto
                                                <svg v-if="sortKey === 'revenue'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('petty_cash')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Petty Cash
                                                <svg v-if="sortKey === 'petty_cash'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('net_profit')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Laba Bersih
                                                <svg v-if="sortKey === 'net_profit'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <template v-for="day in pagedDailySales" :key="day.date">
                                        <tr 
                                            @click="toggleDailySales(day.date)"
                                            class="hover:bg-amber-50/50 transition-all cursor-pointer group"
                                            :class="{'bg-amber-50/30': expandedDailySales === day.date}"
                                        >
                                            <td class="px-8 py-5 text-sm font-bold text-slate-800 flex items-center gap-3">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="expandedDailySales === day.date ? 'rotate-90' : ''" class="text-amber-500 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                                                {{ formatDate(day.date) }}
                                            </td>
                                            <td class="px-8 py-5 text-sm font-black text-slate-500 text-center">{{ day.total_orders }}</td>
                                            <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">Rp {{ formatPrice(day.revenue) }}</td>
                                            <td class="px-8 py-5 text-sm font-bold text-red-500 text-right">- Rp {{ formatPrice(day.petty_cash) }}</td>
                                            <td class="px-8 py-5 text-sm font-black text-emerald-600 text-right">Rp {{ formatPrice(day.net_profit) }}</td>
                                        </tr>
                                        
                                        <!-- Expanded Transaction List -->
                                        <tr v-if="expandedDailySales === day.date">
                                            <td colspan="5" class="bg-slate-50 px-12 py-8 shadow-inner">
                                                <div class="space-y-4 animate-fade-in">
                                                    <div class="flex items-center justify-between mb-4">
                                                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Transaksi Hari Ini</p>
                                                    </div>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div 
                                                            v-for="order in getOrdersForDate(day.date)" 
                                                            :key="order.id"
                                                            class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <p class="text-xs font-black text-slate-800">#{{ order.orderNumber }}</p>
                                                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{{ formatDateTime(order.createdAt).split(',')[1] }} • {{ order.paymentMethod }}</p>
                                                            </div>
                                                            <p class="text-sm font-black text-amber-600">Rp {{ formatPrice(order.total) }}</p>
                                                        </div>
                                                        <div v-if="getOrdersForDate(day.date).length === 0" class="col-span-full py-10 text-center text-slate-400 italic text-xs">
                                                            Data transaksi detail tidak ditemukan dalam filter saat ini
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr v-if="dailySales.length === 0">
                                        <td colspan="5" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada data penjualan pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="dailySales.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                                    <tr>
                                        <td class="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Total Periode</td>
                                        <td class="px-8 py-4 text-sm font-black text-center">{{ totals.dailySales.orders }}</td>
                                        <td class="px-8 py-4 text-sm font-black text-right text-amber-400">Rp {{ formatPrice(totals.dailySales.revenue) }}</td>
                                        <td class="px-8 py-4 text-sm font-bold text-right text-red-400">- Rp {{ formatPrice(totals.dailySales.petty) }}</td>
                                        <td class="px-8 py-4 text-sm font-black text-right text-emerald-400">Rp {{ formatPrice(totals.dailySales.net) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <template v-for="day in pagedDailySales" :key="day.date">
                                <div 
                                    @click="toggleDailySales(day.date)"
                                    class="py-5 flex flex-col gap-3 cursor-pointer"
                                >
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="expandedDailySales === day.date ? 'rotate-90' : ''" class="text-amber-500 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                                            <span class="text-sm font-bold text-slate-800">{{ formatDate(day.date) }}</span>
                                        </div>
                                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-lg">
                                            {{ day.total_orders }} Transaksi
                                        </span>
                                    </div>
                                    
                                    <div class="grid grid-cols-3 gap-2 text-right">
                                        <div class="text-left">
                                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Omzet Bruto</span>
                                            <span class="text-xs font-black text-slate-900">Rp {{ formatPrice(day.revenue) }}</span>
                                        </div>
                                        <div>
                                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Petty Cash</span>
                                            <span class="text-xs font-bold text-red-500">- Rp {{ formatPrice(day.petty_cash) }}</span>
                                        </div>
                                        <div>
                                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Laba Bersih</span>
                                            <span class="text-xs font-black text-emerald-600">Rp {{ formatPrice(day.net_profit) }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Expanded Transaction List on Mobile -->
                                <div v-if="expandedDailySales === day.date" class="bg-slate-50 -mx-6 px-6 py-5 border-y border-slate-100 space-y-3">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Detail Transaksi</p>
                                    <div class="flex flex-col gap-2">
                                        <div 
                                            v-for="order in getOrdersForDate(day.date)" 
                                            :key="order.id"
                                            class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
                                        >
                                            <div>
                                                <p class="text-xs font-black text-slate-800">#{{ order.orderNumber }}</p>
                                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{{ formatDateTime(order.createdAt).split(',')[1] }} • {{ order.paymentMethod }}</p>
                                            </div>
                                            <p class="text-xs font-black text-amber-600">Rp {{ formatPrice(order.total) }}</p>
                                        </div>
                                        <div v-if="getOrdersForDate(day.date).length === 0" class="py-6 text-center text-slate-400 italic text-xs">
                                            Tidak ada transaksi detail
                                        </div>
                                    </div>
                                </div>
                            </template>
                            
                            <!-- Mobile Total Period Footer -->
                            <div v-if="dailySales.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white space-y-4">
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Periode</p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Transaksi</span>
                                        <span class="text-sm font-black">{{ totals.dailySales.orders }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Bruto</span>
                                        <span class="text-sm font-black text-amber-400">Rp {{ formatPrice(totals.dailySales.revenue) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Petty Cash</span>
                                        <span class="text-sm font-bold text-red-400">- Rp {{ formatPrice(totals.dailySales.petty) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Laba Bersih</span>
                                        <span class="text-sm font-black text-emerald-400">Rp {{ formatPrice(totals.dailySales.net) }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="dailySales.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada data penjualan pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedDailySales.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.sales }} dari {{ totalPages(sortedDailySales) }} &middot; {{ sortedDailySales.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('sales', pages.sales - 1)" :disabled="pages.sales <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.sales <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedDailySales)" :key="p" @click="goPage('sales', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.sales === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('sales', pages.sales + 1)" :disabled="pages.sales >= totalPages(sortedDailySales)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.sales >= totalPages(sortedDailySales) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- SHIFT HISTORY TABLE -->
                    <div v-if="activeTab === 'shifts'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100">
                            <h3 class="text-xl font-serif font-bold text-slate-900">Riwayat & Audit Shift</h3>
                            <p class="text-xs text-slate-500 mt-1">Detail pertanggungjawaban kasir per sesi</p>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('user.name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Kasir
                                                <svg v-if="sortKey === 'user.name'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('openedAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Waktu Buka
                                                <svg v-if="sortKey === 'openedAt'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('closedAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Waktu Tutup
                                                <svg v-if="sortKey === 'closedAt'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('totalCashSales')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Sales Tunai
                                                <svg v-if="sortKey === 'totalCashSales'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('closingCash')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Uang Fisik
                                                <svg v-if="sortKey === 'closingCash'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <template v-for="shift in pagedShifts" :key="shift.id">
                                        <tr 
                                            @click="toggleShift(shift.id)"
                                            class="hover:bg-amber-50/50 transition-all cursor-pointer group"
                                            :class="{'bg-amber-50/30': expandedShift === shift.id}"
                                        >
                                            <td class="px-8 py-5">
                                                <div class="flex items-center gap-3">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="expandedShift === shift.id ? 'rotate-90' : ''" class="text-amber-500 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                                                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                                                        {{ shift.user.name.charAt(0) }}
                                                    </div>
                                                    <span class="text-sm font-bold text-slate-800">{{ shift.user.name }}</span>
                                                </div>
                                            </td>
                                            <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(shift.openedAt) }}</td>
                                            <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(shift.closedAt) }}</td>
                                            <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">Rp {{ formatPrice(shift.totalCashSales) }}</td>
                                            <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">Rp {{ formatPrice(shift.closingCash || 0) }}</td>
                                            <td class="px-8 py-5 text-center">
                                                <span 
                                                    v-if="shift.closedAt"
                                                    :class="safeNumber(shift.closingCash) - (safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum)) === 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'" 
                                                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    {{ formatPrice(safeNumber(shift.closingCash) - (safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum))) }}
                                                </span>
                                                <span v-else class="text-[9px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                            </td>
                                        </tr>

                                        <!-- Expanded Shift Breakdown -->
                                        <tr v-if="expandedShift === shift.id">
                                            <td colspan="6" class="bg-slate-900 px-12 py-10 shadow-2xl overflow-hidden relative">
                                                <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 animate-fade-in">
                                                    <div>
                                                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ringkasan Saldo</p>
                                                        <div class="space-y-3">
                                                            <div class="flex justify-between text-xs text-slate-400">
                                                                <span>Modal Awal:</span>
                                                                <span class="font-black text-white">Rp {{ formatPrice(shift.opening_balance) }}</span>
                                                            </div>
                                                            <div class="flex justify-between text-xs text-slate-400">
                                                                <span>Total Penjualan:</span>
                                                                <span class="font-black text-white">Rp {{ formatPrice(shift.totalCashSales) }}</span>
                                                            </div>
                                                            <div class="flex justify-between text-xs text-slate-400">
                                                                <span>Petty Cash:</span>
                                                                <span class="font-black text-red-400">- Rp {{ formatPrice(shift.petty_cash_sum || 0) }}</span>
                                                            </div>
                                                            <div class="h-px bg-slate-800"></div>
                                                            <div class="flex justify-between text-sm font-black text-amber-500">
                                                                <span>Ekspektasi:</span>
                                                                <span>Rp {{ formatPrice(safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum)) }}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="md:col-span-2">
                                                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Breakdown Metode Pembayaran</p>
                                                        <div class="grid grid-cols-2 gap-4">
                                                            <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                                                <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Tunai (Laci)</p>
                                                                <p class="text-xl font-black text-white">Rp {{ formatPrice(shift.totalCashSales) }}</p>
                                                            </div>
                                                            <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                                                <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">QRIS / Non-Tunai</p>
                                                                <p class="text-xl font-black text-white">Rp {{ formatPrice(shift.total_non_cash_sales || 0) }}</p>
                                                            </div>
                                                        </div>
                                                        <p class="text-[8px] text-slate-500 italic mt-4">* Data di atas adalah hasil audit sistem berdasarkan pesanan lunas selama shift berlangsung.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr v-if="shifts.length === 0">
                                        <td colspan="6" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada riwayat shift pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="shifts.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                                    <tr>
                                        <td colspan="3" class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Akumulasi Kas Masuk & Audit</td>
                                        <td class="px-8 py-4 text-sm font-black text-right text-amber-400">Rp {{ formatPrice(totals.shifts.sales) }}</td>
                                        <td class="px-8 py-4 text-sm font-black text-right">Rp {{ formatPrice(totals.shifts.physical) }}</td>
                                        <td class="px-8 py-4 text-center">
                                            <span 
                                                :class="totals.shifts.diff === 0 ? 'text-emerald-400' : 'text-red-400'" 
                                                class="text-xs font-black"
                                            >
                                                {{ totals.shifts.diff > 0 ? '+' : '' }}{{ formatPrice(totals.shifts.diff) }}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <template v-for="shift in pagedShifts" :key="shift.id">
                                <div 
                                    @click="toggleShift(shift.id)"
                                    class="py-5 flex flex-col gap-3 cursor-pointer"
                                >
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="expandedShift === shift.id ? 'rotate-90' : ''" class="text-amber-500 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                                            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                                                {{ shift.user.name.charAt(0) }}
                                            </div>
                                            <span class="text-sm font-bold text-slate-800">{{ shift.user.name }}</span>
                                        </div>
                                        <span 
                                            v-if="shift.closedAt"
                                            :class="safeNumber(shift.closingCash) - (safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum)) === 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'" 
                                            class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Selisih: {{ formatPrice(safeNumber(shift.closingCash) - (safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum))) }}
                                        </span>
                                        <span v-else class="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Buka:</span>
                                            <span class="font-bold text-slate-600">{{ formatDateTime(shift.openedAt).split(',')[1] || formatDateTime(shift.openedAt) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Tutup:</span>
                                            <span class="font-bold text-slate-600">{{ shift.closedAt ? (formatDateTime(shift.closedAt).split(',')[1] || formatDateTime(shift.closedAt)) : '-' }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Tunai:</span>
                                            <span class="font-bold text-slate-900">Rp {{ formatPrice(shift.totalCashSales) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Fisik:</span>
                                            <span class="font-bold text-slate-900">Rp {{ formatPrice(shift.closingCash || 0) }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Expanded Shift Breakdown on Mobile -->
                                <div v-if="expandedShift === shift.id" class="bg-slate-900 text-white -mx-6 px-6 py-6 border-y border-slate-800 space-y-6 relative overflow-hidden">
                                    <div class="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                                    <div class="space-y-4 relative z-10">
                                        <div>
                                            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Ringkasan Saldo</p>
                                            <div class="space-y-2 text-xs">
                                                <div class="flex justify-between text-slate-400">
                                                    <span>Modal Awal:</span>
                                                    <span class="font-black text-white">Rp {{ formatPrice(shift.opening_balance) }}</span>
                                                </div>
                                                <div class="flex justify-between text-slate-400">
                                                    <span>Total Penjualan:</span>
                                                    <span class="font-black text-white">Rp {{ formatPrice(shift.totalCashSales) }}</span>
                                                </div>
                                                <div class="flex justify-between text-slate-400">
                                                    <span>Petty Cash:</span>
                                                    <span class="font-black text-red-400">- Rp {{ formatPrice(shift.petty_cash_sum || 0) }}</span>
                                                </div>
                                                <div class="h-px bg-slate-800 my-1"></div>
                                                <div class="flex justify-between font-black text-amber-500">
                                                    <span>Ekspektasi:</span>
                                                    <span>Rp {{ formatPrice(safeNumber(shift.opening_balance) + safeNumber(shift.totalCashSales) - safeNumber(shift.petty_cash_sum)) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 font-semibold">Metode Pembayaran</p>
                                            <div class="grid grid-cols-2 gap-3">
                                                <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Tunai (Laci)</p>
                                                    <p class="text-sm font-black text-white">Rp {{ formatPrice(shift.totalCashSales) }}</p>
                                                </div>
                                                <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">QRIS / Non-Tunai</p>
                                                    <p class="text-sm font-black text-white">Rp {{ formatPrice(shift.total_non_cash_sales || 0) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            
                            <!-- Mobile Accumulated Footer -->
                            <div v-if="shifts.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white space-y-4">
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Periode</p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Akumulasi Tunai</span>
                                        <span class="text-sm font-black text-amber-400">Rp {{ formatPrice(totals.shifts.sales) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Akumulasi Fisik</span>
                                        <span class="text-sm font-black">Rp {{ formatPrice(totals.shifts.physical) }}</span>
                                    </div>
                                    <div class="col-span-2">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Selisih</span>
                                        <span :class="totals.shifts.diff === 0 ? 'text-emerald-400' : 'text-red-400'" class="text-base font-black">
                                            {{ totals.shifts.diff > 0 ? '+' : '' }}{{ formatPrice(totals.shifts.diff) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="shifts.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada riwayat shift pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedShifts.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.shifts }} dari {{ totalPages(sortedShifts) }} &middot; {{ sortedShifts.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('shifts', pages.shifts - 1)" :disabled="pages.shifts <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.shifts <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedShifts)" :key="p" @click="goPage('shifts', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.shifts === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('shifts', pages.shifts + 1)" :disabled="pages.shifts >= totalPages(sortedShifts)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.shifts >= totalPages(sortedShifts) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- MENU PERFORMANCE TABLE -->
                    <div v-if="activeTab === 'performance'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-serif font-bold text-slate-900">Analisis Performa Menu</h3>
                                <p class="text-xs text-slate-500 mt-1">Ranking menu terlaris dan kontribusi pendapatan</p>
                            </div>
                            
                            <!-- Category Filter Chips -->
                            <div class="flex flex-wrap gap-2">
                                <button 
                                    v-for="cat in categories" 
                                    :key="cat"
                                    @click="selectedCategory = cat"
                                    :class="selectedCategory === cat ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                                    class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {{ cat }}
                                </button>
                            </div>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Nama Menu
                                                <svg v-if="sortKey === 'name'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('totalQty')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-center gap-2">
                                                Qty Terjual
                                                <svg v-if="sortKey === 'totalQty'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('totalRevenue')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Total Revenue
                                                <svg v-if="sortKey === 'totalRevenue'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('total_cogs')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            Total HPP
                                        </th>
                                        <th @click="toggleSort('margin')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            Margin Laba
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="(menu, index) in pagedMenuPerformance" :key="menu.name" class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-8 py-5">
                                            <div class="flex items-center gap-3">
                                                <span class="text-xs font-black text-slate-300 w-4">#{{ (pages.performance - 1) * perPage + index + 1 }}</span>
                                                <div>
                                                    <span class="text-sm font-bold text-slate-800">{{ menu.name }}</span>
                                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ menu.category_name }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-8 py-5 text-sm font-black text-slate-600 text-center">{{ menu.totalQty }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">Rp {{ formatPrice(menu.totalRevenue) }}</td>
                                        <td class="px-8 py-5 text-sm font-bold text-red-400 text-right">Rp {{ formatPrice(menu.total_cogs) }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-emerald-600 text-right">
                                            Rp {{ formatPrice(menu.margin) }}
                                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {{ menu.totalRevenue ? ((menu.margin / menu.totalRevenue) * 100).toFixed(1) : '0.0' }}%
                                            </p>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredMenuPerformance.length === 0">
                                        <td colspan="5" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada data performa menu pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="filteredMenuPerformance.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white">
                                    <tr>
                                        <td class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Volume & Revenue</td>
                                        <td class="px-8 py-4 text-sm font-black text-center text-amber-400">{{ totals.performance.qty }}</td>
                                        <td class="px-8 py-4 text-sm font-black text-right text-emerald-400">Rp {{ formatPrice(totals.performance.revenue) }}</td>
                                        <td class="px-8 py-4 text-sm font-bold text-right text-red-400">Rp {{ formatPrice(profitability.total_cogs) }}</td>
                                        <td class="px-8 py-4 text-sm font-black text-right text-emerald-400">Rp {{ formatPrice(profitability.gross_profit) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <div 
                                v-for="(menu, index) in pagedMenuPerformance" 
                                :key="menu.name" 
                                class="py-5 flex flex-col gap-3"
                            >
                                <div class="flex items-start justify-between">
                                    <div class="flex items-start gap-3">
                                        <span class="text-xs font-black text-slate-300 mt-1">#{{ (pages.performance - 1) * perPage + index + 1 }}</span>
                                        <div>
                                            <span class="text-sm font-bold text-slate-800 block">{{ menu.name }}</span>
                                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ menu.category_name }}</span>
                                        </div>
                                    </div>
                                    <span class="text-xs font-black text-slate-600 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-lg">
                                        {{ menu.totalQty }} Terjual
                                    </span>
                                </div>
                                
                                <div class="grid grid-cols-3 gap-2 text-right">
                                    <div class="text-left">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Revenue</span>
                                        <span class="text-xs font-black text-slate-900">Rp {{ formatPrice(menu.totalRevenue) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total HPP</span>
                                        <span class="text-xs font-bold text-red-500">Rp {{ formatPrice(menu.total_cogs) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Margin Laba</span>
                                        <span class="text-xs font-black text-emerald-600">
                                            Rp {{ formatPrice(menu.margin) }}
                                            <span class="text-[8px] font-bold text-slate-400 block mt-0.5">
                                                {{ menu.totalRevenue ? ((menu.margin / menu.totalRevenue) * 100).toFixed(1) : '0.0' }}%
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Mobile Total Period Footer -->
                            <div v-if="filteredMenuPerformance.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white space-y-4">
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Periode</p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Qty</span>
                                        <span class="text-sm font-black text-amber-400">{{ totals.performance.qty }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Revenue</span>
                                        <span class="text-sm font-black text-emerald-400">Rp {{ formatPrice(totals.performance.revenue) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total HPP</span>
                                        <span class="text-sm font-bold text-red-400">Rp {{ formatPrice(profitability.total_cogs) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Gross Profit</span>
                                        <span class="text-sm font-black text-emerald-400">Rp {{ formatPrice(profitability.gross_profit) }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="filteredMenuPerformance.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada data performa menu pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="filteredMenuPerformance.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.performance }} dari {{ totalPages(filteredMenuPerformance) }} &middot; {{ filteredMenuPerformance.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('performance', pages.performance - 1)" :disabled="pages.performance <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.performance <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(filteredMenuPerformance)" :key="p" @click="goPage('performance', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.performance === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('performance', pages.performance + 1)" :disabled="pages.performance >= totalPages(filteredMenuPerformance)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.performance >= totalPages(filteredMenuPerformance) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- PETTY CASH LOGS TABLE -->
                    <div v-if="activeTab === 'expenses'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100">
                            <h3 class="text-xl font-serif font-bold text-slate-900">Buku Kas Keluar (Petty Cash)</h3>
                            <p class="text-xs text-slate-500 mt-1">Audit seluruh pengeluaran operasional laci kasir</p>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('createdAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Waktu
                                                <svg v-if="sortKey === 'createdAt'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('user.name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Kasir
                                                <svg v-if="sortKey === 'user.name'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
                                        <th @click="toggleSort('amount')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Nominal
                                                <svg v-if="sortKey === 'amount'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="log in pagedPettyCashLogs" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(log.createdAt) }}</td>
                                        <td class="px-8 py-5 text-sm font-bold text-slate-700">{{ log.user?.name }}</td>
                                        <td class="px-8 py-5 text-sm text-slate-500 italic">{{ log.notes || 'Tanpa keterangan' }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-red-600 text-right">- Rp {{ formatPrice(log.amount) }}</td>
                                    </tr>
                                    <tr v-if="pettyCashLogs.length === 0">
                                        <td colspan="4" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada catatan kas keluar pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="pettyCashLogs.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white">
                                    <tr>
                                        <td colspan="3" class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Kas Keluar:</td>
                                        <td class="px-8 py-4 text-sm font-black text-red-400 text-right">- Rp {{ formatPrice(totals.expenses) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <div 
                                v-for="log in pagedPettyCashLogs" 
                                :key="log.id" 
                                class="py-5 flex flex-col gap-2"
                            >
                                <div class="flex items-start justify-between">
                                    <div>
                                        <span class="text-sm font-bold text-slate-800 block">{{ log.user?.name }}</span>
                                        <span class="text-[10px] text-slate-500 font-medium">{{ formatDateTime(log.createdAt) }}</span>
                                    </div>
                                    <span class="text-sm font-black text-red-600">
                                        - Rp {{ formatPrice(log.amount) }}
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 italic">{{ log.notes || 'Tanpa keterangan' }}</p>
                            </div>
                            
                            <!-- Mobile Total Period Footer -->
                            <div v-if="pettyCashLogs.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white flex justify-between items-center">
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Kas Keluar:</span>
                                <span class="text-base font-black text-red-400">- Rp {{ formatPrice(totals.expenses) }}</span>
                            </div>
                            
                            <div v-if="pettyCashLogs.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada catatan kas keluar pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedPettyCashLogs.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.expenses }} dari {{ totalPages(sortedPettyCashLogs) }} &middot; {{ sortedPettyCashLogs.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('expenses', pages.expenses - 1)" :disabled="pages.expenses <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.expenses <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedPettyCashLogs)" :key="p" @click="goPage('expenses', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.expenses === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('expenses', pages.expenses + 1)" :disabled="pages.expenses >= totalPages(sortedPettyCashLogs)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.expenses >= totalPages(sortedPettyCashLogs) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- VOID LOGS TABLE -->
                    <div v-if="activeTab === 'voids'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100">
                            <h3 class="text-xl font-serif font-bold text-slate-900">Log Pembatalan Pesanan (Void Audit)</h3>
                            <p class="text-xs text-slate-500 mt-1">Transparansi alasan pembatalan oleh staf</p>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('createdAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Waktu
                                                <svg v-if="sortKey === 'createdAt'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('orderNumber')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                No. Order
                                                <svg v-if="sortKey === 'orderNumber'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('user.name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Kasir
                                                <svg v-if="sortKey === 'user.name'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alasan Void</th>
                                        <th @click="toggleSort('total')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Nominal
                                                <svg v-if="sortKey === 'total'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="log in pagedVoidLogs" :key="log.id" class="hover:bg-red-50/30 transition-colors">
                                        <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(log.createdAt) }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-slate-800">{{ log.orderNumber }}</td>
                                        <td class="px-8 py-5 text-sm text-slate-600">{{ log.user?.name }}</td>
                                        <td class="px-8 py-5 text-sm italic text-slate-500">{{ log.voidReason || 'Tanpa alasan' }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-red-600 text-right">Rp {{ formatPrice(log.total) }}</td>
                                    </tr>
                                    <tr v-if="voidLogs.length === 0">
                                        <td colspan="5" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada catatan void pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="voidLogs.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white">
                                    <tr>
                                        <td colspan="4" class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Nilai Void:</td>
                                        <td class="px-8 py-4 text-sm font-black text-red-400 text-right">Rp {{ formatPrice(totals.voids) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <div 
                                v-for="log in pagedVoidLogs" 
                                :key="log.id" 
                                class="py-5 flex flex-col gap-2"
                            >
                                <div class="flex items-start justify-between">
                                    <div>
                                        <span class="text-sm font-black text-slate-800 block">Order #{{ log.orderNumber }}</span>
                                        <span class="text-[10px] text-slate-500 font-medium">{{ formatDateTime(log.createdAt) }}</span>
                                    </div>
                                    <span class="text-sm font-black text-red-600">
                                        Rp {{ formatPrice(log.total) }}
                                    </span>
                                </div>
                                <div class="flex flex-col gap-1 text-xs">
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Kasir:</span>
                                        <span class="font-bold text-slate-700">{{ log.user?.name }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Alasan:</span>
                                        <span class="italic text-slate-600">{{ log.voidReason || 'Tanpa alasan' }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Mobile Total Period Footer -->
                            <div v-if="voidLogs.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white flex justify-between items-center">
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Nilai Void:</span>
                                <span class="text-base font-black text-red-400">Rp {{ formatPrice(totals.voids) }}</span>
                            </div>
                            
                            <div v-if="voidLogs.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada catatan void pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedVoidLogs.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.voids }} dari {{ totalPages(sortedVoidLogs) }} &middot; {{ sortedVoidLogs.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('voids', pages.voids - 1)" :disabled="pages.voids <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.voids <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedVoidLogs)" :key="p" @click="goPage('voids', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.voids === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('voids', pages.voids + 1)" :disabled="pages.voids >= totalPages(sortedVoidLogs)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.voids >= totalPages(sortedVoidLogs) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- TRANSACTION HISTORY TABLE -->
                    <div v-if="activeTab === 'transactions'" class="animate-fade-in">
                        <div class="p-8 border-b border-slate-100">
                            <h3 class="text-xl font-serif font-bold text-slate-900">Riwayat Transaksi Detail</h3>
                            <p class="text-xs text-slate-500 mt-1">Daftar seluruh pembelian pelanggan (Lunas)</p>
                        </div>

                        <!-- Desktop Table View -->
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50">
                                    <tr>
                                        <th @click="toggleSort('createdAt')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Waktu
                                                <svg v-if="sortKey === 'createdAt'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('orderNumber')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                No. Order
                                                <svg v-if="sortKey === 'orderNumber'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meja</th>
                                        <th @click="toggleSort('user.name')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center gap-2">
                                                Kasir
                                                <svg v-if="sortKey === 'user.name'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('paymentMethod')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-center gap-2">
                                                Metode
                                                <svg v-if="sortKey === 'paymentMethod'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th @click="toggleSort('total')" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-amber-600 transition-colors">
                                            <div class="flex items-center justify-end gap-2">
                                                Total
                                                <svg v-if="sortKey === 'total'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="sortDir === 'desc' ? 'rotate-180' : ''" class="transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                            </div>
                                        </th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="order in pagedOrderHistory" :key="order.id" class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-8 py-5 text-xs text-slate-500 font-medium">{{ formatDateTime(order.createdAt) }}</td>
                                        <td class="px-8 py-5 text-sm font-black text-slate-800">{{ order.orderNumber }}</td>
                                        <td class="px-8 py-5 text-sm font-bold text-slate-600">
                                            <span v-if="order.cafeTable" class="bg-slate-100 px-3 py-1 rounded-lg">{{ order.cafeTable.name }}</span>
                                            <span v-else class="text-slate-400 italic">Takeaway</span>
                                        </td>
                                        <td class="px-8 py-5 text-sm text-slate-600">{{ order.user?.name }}</td>
                                        <td class="px-8 py-5 text-center">
                                            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                                {{ order.paymentMethod }}
                                            </span>
                                        </td>
                                        <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">Rp {{ formatPrice(order.total) }}</td>
                                        <td class="px-8 py-5 text-center">
                                            <button 
                                                @click="viewOrder(order)"
                                                class="text-amber-600 hover:text-amber-700 font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="orderHistory.length === 0">
                                        <td colspan="7" class="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada transaksi pada periode ini</td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="orderHistory.length > 0" class="sticky bottom-0 z-10 bg-slate-900 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                                    <tr>
                                        <td colspan="5" class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Grand Total:</td>
                                        <td class="px-8 py-4 text-sm font-black text-amber-400 text-right">Rp {{ formatPrice(totals.transactions) }}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden divide-y divide-slate-100 px-6">
                            <div 
                                v-for="order in pagedOrderHistory" 
                                :key="order.id" 
                                class="py-5 flex flex-col gap-3"
                            >
                                <div class="flex items-start justify-between">
                                    <div>
                                        <span class="text-sm font-black text-slate-800 block">{{ order.orderNumber }}</span>
                                        <span class="text-[10px] text-slate-500 font-medium">{{ formatDateTime(order.createdAt) }}</span>
                                    </div>
                                    <span class="text-sm font-black text-slate-900">
                                        Rp {{ formatPrice(order.total) }}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between text-xs">
                                    <div class="flex items-center gap-2">
                                        <span v-if="order.cafeTable" class="bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-bold text-slate-600">{{ order.cafeTable.name }}</span>
                                        <span v-else class="bg-slate-50 text-slate-400 border border-slate-100 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">Takeaway</span>
                                        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                            {{ order.paymentMethod }}
                                        </span>
                                    </div>
                                    <button 
                                        @click="viewOrder(order)"
                                        class="bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border border-amber-200/40"
                                    >
                                        Detail
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Mobile Total Period Footer -->
                            <div v-if="orderHistory.length > 0" class="bg-slate-900 -mx-6 px-6 py-6 text-white flex justify-between items-center">
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Grand Total:</span>
                                <span class="text-base font-black text-amber-400">Rp {{ formatPrice(totals.transactions) }}</span>
                            </div>
                            
                            <div v-if="orderHistory.length === 0" class="py-16 text-center text-slate-400 italic text-sm">
                                Tidak ada transaksi pada periode ini
                            </div>
                        </div>

                        <!-- Pagination (Desktop & Mobile) -->
                        <div v-if="sortedOrderHistory.length > perPage" class="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ pages.transactions }} dari {{ totalPages(sortedOrderHistory) }} &middot; {{ sortedOrderHistory.length }} data</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button @click="goPage('transactions', pages.transactions - 1)" :disabled="pages.transactions <= 1" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.transactions <= 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Prev</button>
                                <button v-for="p in totalPages(sortedOrderHistory)" :key="p" @click="goPage('transactions', p)" class="w-9 h-9 rounded-xl text-[10px] font-black transition-all" :class="pages.transactions === p ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">{{ p }}</button>
                                <button @click="goPage('transactions', pages.transactions + 1)" :disabled="pages.transactions >= totalPages(sortedOrderHistory)" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="pages.transactions >= totalPages(sortedOrderHistory) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Next</button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <!-- Order Detail Modal -->
        <div v-if="showOrderDetail" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showOrderDetail = false"></div>
            <div class="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
                <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 class="text-xl font-serif font-bold text-slate-900">Detail Pesanan #{{ selectedOrder.orderNumber }}</h3>
                        <p class="text-xs text-slate-500 uppercase tracking-widest font-black mt-1">{{ formatDateTime(selectedOrder.createdAt) }}</p>
                    </div>
                    <button @click="showOrderDetail = false" class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-8 max-h-[60vh] overflow-y-auto">
                    <div class="space-y-6">
                        <div v-for="item in selectedOrder.order_items" :key="item.id" class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-slate-900 text-lg">{{ item.menu_name }} <span class="text-slate-400 font-medium">x{{ item.quantity }}</span></p>
                                <p class="text-xs text-slate-400 font-black uppercase tracking-widest">Harga: Rp {{ formatPrice(item.unit_price) }}</p>
                                
                                <!-- Placeholder for options if you have them loaded -->
                                <div v-if="item.options && item.options.length" class="mt-2 space-y-1">
                                    <div v-for="opt in item.options" :key="opt.id" class="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md inline-block mr-1">
                                        + {{ opt.option_name }}
                                    </div>
                                </div>
                            </div>
                            <p class="font-black text-slate-900">Rp {{ formatPrice(item.subtotal) }}</p>
                        </div>
                    </div>
                </div>

                <div class="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar ({{ selectedOrder.paymentMethod.toUpperCase() }})</p>
                        <p class="text-3xl font-serif font-black text-amber-500">Rp {{ formatPrice(selectedOrder.total) }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kembalian</p>
                        <p class="text-xl font-bold">Rp {{ formatPrice(selectedOrder.change || 0) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
</style>
