<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const adminStore = useAdminStore();

const cashiers = computed(() => adminStore.cashiers);
const stats = computed(() => adminStore.stats);
const activityLogs = computed(() => adminStore.activityLogs);
const isLoading = ref(true);
const errors = ref({});

const fetchData = async (force = false) => {
    if (!adminStore.isCashiersLoaded) {
        isLoading.value = true;
    }
    try {
        await adminStore.fetchCashiers(force);
    } catch (e) {
        console.error("Failed to fetch cashiers", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchData();
    fetchData(true);
});

// Toggle PIN Visibility per Cashier
const visiblePins = ref({});

const togglePinVisibility = (id) => {
    visiblePins.value[id] = !visiblePins.value[id];
};

const deleteCashier = async (cashier) => {
    if (confirm(`Yakin ingin menghapus akun Kasir "${cashier.name}"? Ini akan menghapus data akses mereka.`)) {
        try {
            await api.delete(`/admin/cashiers/${cashier.id}`);
            await fetchData(true);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Gagal menghapus kasir');
            errors.value.error = e.response?.data?.message || 'Gagal menghapus kasir';
        }
    }
};

// Force Close Shift Handlers
const showCloseModal = ref(false);
const selectedCashier = ref<any>(null);
const closingCashOption = ref('expected');
const customClosingCash = ref<number>(0);
const closeNotes = ref('Lupa tutup shift, ditutup oleh Admin');
const isSubmitting = ref(false);

const getExpectedClosingCash = (cashier) => {
    if (!cashier || !cashier.active_shift) return 0;
    return Number(cashier.active_shift.openingCash) +
           Number(cashier.active_shift.totalCashSales) -
           Number(cashier.active_shift.totalPettyCash);
};

const openCloseShiftModal = (cashier) => {
    selectedCashier.value = cashier;
    closingCashOption.value = 'expected';
    customClosingCash.value = getExpectedClosingCash(cashier);
    closeNotes.value = 'Lupa tutup shift, ditutup oleh Admin';
    showCloseModal.value = true;
};

const handleCloseShift = async () => {
    if (!selectedCashier.value || !selectedCashier.value.active_shift) return;
    isSubmitting.value = true;
    try {
        const shiftId = selectedCashier.value.active_shift.id;
        await api.post(`/admin/shifts/${shiftId}/end`, {
            closing_cash_option: closingCashOption.value,
            custom_closing_cash: customClosingCash.value,
            notes: closeNotes.value
        });
        showCloseModal.value = false;
        await fetchData(true);
    } catch (e: any) {
        console.error(e);
        alert(e.response?.data?.message || 'Gagal menutup shift');
    } finally {
        isSubmitting.value = false;
    }
};

// Color Palette for Initials Badge
const badgeColors = [
    'bg-amber-100 text-amber-700 border-amber-200/50',
    'bg-indigo-100 text-indigo-700 border-indigo-200/50',
    'bg-emerald-100 text-emerald-700 border-emerald-200/50',
    'bg-rose-100 text-rose-700 border-rose-200/50',
];

const getBadgeColor = (index) => badgeColors[index % badgeColors.length];

// Paged Activity Logs
const activityPage = ref(1);
const itemsPerPage = 5;

const pagedActivities = computed(() => {
    const start = (activityPage.value - 1) * itemsPerPage;
    return (activityLogs.value || []).slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil((activityLogs.value || []).length / itemsPerPage)));

watch(() => activityLogs.value, () => {
    activityPage.value = 1;
});

const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const actionConfig = {
    shift_open: { icon: '▶', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Buka Shift' },
    shift_close: { icon: '⏹', color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Tutup Shift' },
    order_create: { icon: '🧾', color: 'bg-amber-50/70 text-amber-700 border-amber-100/50', label: 'Pesanan' },
    order_void: { icon: '✕', color: 'bg-red-50 text-red-600 border-red-100', label: 'Void' },
    petty_cash: { icon: '💸', color: 'bg-violet-50 text-violet-600 border-violet-100', label: 'Kas Keluar' },
};
</script>

<template>
            <div class="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Manajemen <span class="text-amber-700 italic">Kasir</span>
                    </h2>
                    <p class="text-slate-400 text-[10px] sm:text-xs mt-1.5 font-medium">
                        Kelola akun kasir, ubah PIN shift 6-digit, serta pantau aktivitas & status shift mereka secara real-time.
                    </p>
                    <div class="flex items-center gap-3 mt-2 text-[10px] sm:text-xs font-bold text-slate-500">
                        <span>Total Terdaftar: {{ stats.total_cashiers || 0 }} Kasir</span>
                        <span class="text-slate-300">•</span>
                        <span>Aktif Bertugas: {{ stats.active_cashiers || 0 }} Kasir</span>
                    </div>
                </div>
                <router-link
                    :to="{ name: 'AdminCashiersCreate' }"
                    class="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 text-center flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Kasir
                </router-link>
            </div>

            <!-- Error Alerts (if any cascade restriction triggers) -->
            <div v-if="errors.error" class="bg-red-50 border border-red-100 text-red-700 p-5 rounded-[2rem] mb-8 text-xs font-bold leading-relaxed flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ errors.error }}</span>
            </div>

            <div v-if="isLoading" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex justify-center items-center mb-10">
                <div class="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>

            <div v-else>
                <!-- STATS COUNTER ROW -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div class="w-14 h-14 bg-amber-50/70 rounded-2xl flex items-center justify-center text-amber-700">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <div>
                            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Akun</p>
                            <h3 class="text-2xl font-black text-slate-800 mt-1">{{ stats.total_cashiers || 0 }} Kasir</h3>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 relative">
                            <span v-if="stats.active_cashiers > 0" class="absolute top-4 right-4 flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Kasir Aktif Saat Ini</p>
                            <h3 class="text-2xl font-black text-slate-800 mt-1">{{ stats.active_cashiers || 0 }} Bertugas</h3>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h.01"/><path d="M11 15h.01"/></svg>
                        </div>
                        <div>
                            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Transaksi Hari Ini</p>
                            <h3 class="text-2xl font-black text-slate-800 mt-1">{{ stats.total_transactions_today || 0 }} Terjual</h3>
                        </div>
                    </div>
                </div>

                <!-- CASHIER CARDS GRID -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div v-for="(cashier, idx) in cashiers" :key="cashier.id" class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between">
                        <div>
                            <!-- Active Badge -->
                            <div class="flex justify-between items-start mb-6">
                                <span 
                                    :class="cashier.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-slate-50 text-slate-400 border border-slate-100'" 
                                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                                >
                                    <span v-if="cashier.is_active" class="relative flex h-1.5 w-1.5">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    {{ cashier.is_active ? 'Online' : 'Offline' }}
                                </span>

                                <!-- Key details -->
                                <div class="flex gap-2">
                                    <router-link 
                                        :to="{ name: 'AdminCashiersEdit', params: { id: cashier.id } }"
                                        class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-amber-50/70 hover:text-amber-700 transition-colors flex items-center justify-center border border-slate-100 cursor-pointer"
                                        title="Edit Akun"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </router-link>
                                    <button 
                                        @click="deleteCashier(cashier)"
                                        class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center border border-slate-100 cursor-pointer"
                                        title="Hapus Akun"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Card Initials & Name -->
                            <div class="flex flex-col items-center text-center mt-2">
                                <div 
                                    :class="getBadgeColor(idx)"
                                    class="w-16 h-16 rounded-[2rem] flex items-center justify-center font-black font-serif text-2xl border-2 mb-4 shadow-sm"
                                >
                                    {{ cashier.name.charAt(0).toUpperCase() }}
                                </div>
                                <h4 class="text-base font-black text-slate-800 tracking-tight">{{ cashier.name }}</h4>
                                <p class="text-slate-400 text-xs mt-1 truncate max-w-full font-medium">{{ cashier.email }}</p>
                            </div>
                        </div>

                        <!-- Divider -->
                        <div class="border-t border-slate-50 my-6"></div>

                        <!-- Akhiri Shift Button (if cashier is active/online) -->
                        <div v-if="cashier.is_active" class="mb-4">
                            <button 
                                @click="openCloseShiftModal(cashier)"
                                class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                                Akhiri Shift
                            </button>
                        </div>

                        <!-- PIN Indicator -->
                        <div class="flex justify-between items-center bg-slate-50/70 border border-slate-100 rounded-2xl px-4 py-3">
                            <div class="text-left">
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">PIN Otorisasi</p>
                                <p class="text-xs font-black text-slate-800 mt-0.5 tracking-widest font-mono">
                                    {{ visiblePins[cashier.id] ? cashier.pin : '••••••' }}
                                </p>
                            </div>
                            <button 
                                @click="togglePinVisibility(cashier.id)"
                                class="text-[10px] font-black text-amber-700 hover:text-amber-800 uppercase tracking-widest transition-colors cursor-pointer"
                            >
                                {{ visiblePins[cashier.id] ? 'Sembunyikan' : 'Tampilkan' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- LOGS SECTION -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="h-px flex-grow bg-slate-200/50"></div>
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">Audit Aktivitas Hari Ini</span>
                    <div class="h-px flex-grow bg-slate-200/50"></div>
                </div>

                <div class="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h3 class="text-lg font-black text-slate-800 tracking-tight">Timeline Log Kasir</h3>
                            <p class="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Semua aksi operasional kasir hari ini</p>
                        </div>
                        <div v-if="totalPages > 1" class="flex items-center gap-2">
                            <button @click="activityPage--" :disabled="activityPage <= 1" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg></button>
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ activityPage }}/{{ totalPages }}</span>
                            <button @click="activityPage++" :disabled="activityPage >= totalPages" class="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 shadow-lg shadow-amber-700/20 disabled:opacity-30 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg></button>
                        </div>
                    </div>

                    <div v-if="pagedActivities.length > 0" class="relative pl-6">
                        <!-- vertical line -->
                        <div class="absolute left-6 top-4 bottom-4 w-px bg-slate-100"></div>

                        <div class="space-y-2">
                            <div v-for="log in pagedActivities" :key="log.id" class="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50/50 transition-all relative">
                                <!-- timeline dot icon -->
                                <div class="relative z-10 shrink-0">
                                    <div 
                                        :class="(actionConfig[log.action] || { color: 'bg-slate-100 text-slate-500' }).color"
                                        class="w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm border"
                                    >
                                        {{ (actionConfig[log.action] || { icon: '•' }).icon }}
                                    </div>
                                </div>
                                <!-- description -->
                                <div class="flex-1 min-w-0 pt-0.5">
                                    <div class="flex items-center gap-2 mb-0.5">
                                        <span 
                                            :class="(actionConfig[log.action] || { color: 'bg-slate-100 text-slate-500' }).color"
                                            class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border"
                                        >
                                            {{ (actionConfig[log.action] || { label: log.action }).label }}
                                        </span>
                                        <span class="text-[9px] font-bold text-slate-300">•</span>
                                        <span class="text-[10px] font-black text-slate-400">{{ log.user?.name || log.user?.email || 'System' }}</span>
                                    </div>
                                    <p class="text-xs font-bold text-slate-700 leading-relaxed truncate">{{ log.description || log.message || '-' }}</p>
                                </div>
                                <!-- time -->
                                <span class="text-[10px] font-black text-slate-400 pt-1 shrink-0">{{ formatTime(log.created_at || log.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                        <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-300"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <p class="text-xs font-bold text-slate-400">Belum ada aktivitas kasir hari ini</p>
                    </div>
                </div>
            </div>

            <!-- FORCE CLOSE SHIFT MODAL -->
            <div v-if="showCloseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- Overlay background -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showCloseModal = false"></div>
                
                <!-- Modal Box -->
                <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 max-w-md w-full relative z-10 animate-fade-in-up">
                    <button 
                        @click="showCloseModal = false" 
                        class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 cursor-pointer"
                    >
                        ✕
                    </button>

                    <h3 class="text-xl font-serif font-black text-slate-800 mb-2">Akhiri Shift Kasir</h3>
                    <p class="text-xs font-medium text-slate-400 mb-6">
                        Menutup paksa sesi shift aktif kasir <span class="text-amber-700 font-bold">{{ selectedCashier?.name }}</span> yang belum diakhiri.
                    </p>

                    <form @submit.prevent="handleCloseShift" class="space-y-6">
                        <!-- Shift Details Summary -->
                        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 space-y-2">
                            <div class="flex justify-between">
                                <span>Buka Shift:</span>
                                <span class="font-bold text-slate-800">{{ selectedCashier?.active_shift ? new Date(selectedCashier.active_shift.openedAt).toLocaleString('id-ID') : '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Modal Awal:</span>
                                <span class="font-bold text-slate-800">Rp {{ Number(selectedCashier?.active_shift?.openingCash || 0).toLocaleString('id-ID') }}</span>
                            </div>

                            <!-- Hasil Penjualan Asli -->
                            <div class="border-t border-dashed border-slate-200 pt-2 space-y-1">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Hasil Penjualan</span>
                                <div class="flex justify-between">
                                    <span>Total Penjualan (Omset):</span>
                                    <span class="font-bold text-slate-800">Rp {{ Number(selectedCashier?.active_shift?.totalSales || 0).toLocaleString('id-ID') }}</span>
                                </div>
                                <div class="pl-3 space-y-1 border-l-2 border-slate-200 text-slate-500 text-[11px]">
                                    <div class="flex justify-between">
                                        <span>Tunai:</span>
                                        <span>Rp {{ Number(selectedCashier?.active_shift?.totalCashSales || 0).toLocaleString('id-ID') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>QRIS:</span>
                                        <span>Rp {{ Number(selectedCashier?.active_shift?.paymentTotals?.qris || 0).toLocaleString('id-ID') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>E-Wallet:</span>
                                        <span>Rp {{ Number(selectedCashier?.active_shift?.paymentTotals?.ewallet || 0).toLocaleString('id-ID') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-between pt-1 border-t border-dashed border-slate-200">
                                <span>Total Kas Keluar:</span>
                                <span class="font-bold text-red-600">- Rp {{ Number(selectedCashier?.active_shift?.totalPettyCash || 0).toLocaleString('id-ID') }}</span>
                            </div>
                        </div>

                        <!-- Ending Cash Options -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilihan Uang Akhir Kas</label>
                            <div class="space-y-3">
                                <!-- Option System Expected -->
                                <label class="flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all duration-200" 
                                    :class="closingCashOption === 'expected' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-100 hover:bg-slate-50'">
                                    <input 
                                        type="radio" 
                                        value="expected" 
                                        v-model="closingCashOption" 
                                        class="mt-0.5 text-amber-700 focus:ring-amber-500"
                                    />
                                    <div>
                                        <p class="text-xs font-bold text-slate-800">Uang Akhir Seharusnya (Sistem)</p>
                                        <p class="text-[11px] font-black text-amber-700 mt-1">
                                            Rp {{ Number(getExpectedClosingCash(selectedCashier)).toLocaleString('id-ID') }}
                                        </p>
                                    </div>
                                </label>

                                <!-- Option Custom Input -->
                                <label class="flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all duration-200"
                                    :class="closingCashOption === 'custom' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-100 hover:bg-slate-50'">
                                    <input 
                                        type="radio" 
                                        value="custom" 
                                        v-model="closingCashOption" 
                                        class="mt-0.5 text-amber-700 focus:ring-amber-500"
                                    />
                                    <div class="flex-grow">
                                        <p class="text-xs font-bold text-slate-800">Input Uang Akhir Kustom</p>
                                        <div v-if="closingCashOption === 'custom'" class="mt-2">
                                            <div class="relative rounded-xl shadow-sm">
                                                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span class="text-xs font-bold text-slate-400">Rp</span>
                                                </div>
                                                <input 
                                                    type="number" 
                                                    v-model.number="customClosingCash"
                                                    required
                                                    min="0"
                                                    class="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:border-amber-500 focus:ring-amber-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Notes/Description -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan Penutupan</label>
                            <textarea 
                                v-model="closeNotes"
                                required
                                rows="2"
                                class="block w-full rounded-2xl border-slate-200 p-3 text-xs font-medium text-slate-700 focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Alasan penutupan oleh admin..."
                            ></textarea>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="flex gap-4 pt-2">
                            <button 
                                type="button"
                                @click="showCloseModal = false"
                                class="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl py-3 text-xs font-bold transition-all text-center cursor-pointer"
                            >
                                Batalkan
                            </button>
                            <button 
                                type="submit"
                                :disabled="isSubmitting"
                                class="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-800/60 text-white rounded-xl py-3 text-xs font-bold transition-all text-center cursor-pointer"
                            >
                                {{ isSubmitting ? 'Memproses...' : 'Akhiri Shift' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in {
    animation: fadeInUp 0.4s ease-out forwards;
}
</style>
