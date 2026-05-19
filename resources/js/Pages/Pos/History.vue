<script setup>
import { ref } from 'vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PosSidebar from './Partials/PosSidebar.vue';
import ShiftModal from './Partials/ShiftModal.vue';
import EndShiftModal from './Partials/EndShiftModal.vue';
import PettyCashModal from './Partials/PettyCashModal.vue';
import PrintReceiptModal from './Partials/PrintReceiptModal.vue';

const props = defineProps({
    todayOrders: Array,
    todayPettyCash: Array,
    activeShift: Object,
});

const showShiftModal = ref(!props.activeShift);
const showEndShiftModal = ref(false);
const showPettyCashModal = ref(false);
const showPrintModal = ref(false);

const activeTab = ref('penjualan');
const showVoidModal = ref(false);
const selectedOrderForVoid = ref(null);

const voidForm = useForm({
    void_reason: '',
});

const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const formatPrice = (price) => {
    return Number(price).toLocaleString('id-ID');
};

const confirmVoid = (order) => {
    selectedOrderForVoid.value = order;
    showVoidModal.value = true;
};

const submitVoid = () => {
    voidForm.post(route('pos.orders.void', selectedOrderForVoid.value.id), {
        onSuccess: () => {
            showVoidModal.value = false;
            voidForm.reset();
        }
    });
};
</script>

<template>
    <Head title="Riwayat Transaksi" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center w-full">
                <div>
                    <h2 class="text-2xl font-serif font-bold text-[#292524] leading-tight">
                        Riwayat <span class="text-amber-700">Transaksi</span>
                    </h2>
                    <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Rekapitulasi aktivitas hari ini</p>
                </div>
                
                <div class="flex items-center gap-6">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-black text-slate-800 leading-none">{{ $page.props.auth.user.name }}</p>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {{ activeShift ? 'Clocked in at ' + formatTime(activeShift.opened_at) : 'Offline' }}
                        </p>
                    </div>

                    <div class="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black font-serif text-sm shadow-md shadow-amber-600/10">
                        {{ $page.props.auth.user.name.charAt(0).toUpperCase() }}
                    </div>
                </div>
            </div>
        </template>

        <div class="h-[calc(100vh-80px)] flex overflow-hidden relative bg-white border-t border-slate-100">
            <!-- Sidebar -->
            <PosSidebar 
                :activeShift="activeShift"
                @open-petty-cash="showPettyCashModal = true"
                @open-end-shift="showEndShiftModal = true"
                @open-print="showPrintModal = true"
            />

            <!-- Content Area -->
            <div class="flex-grow flex flex-col min-w-0 bg-slate-50/50 overflow-y-auto no-scrollbar">
                <div class="p-6 md:p-8 space-y-6">
                    <div class="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[70vh] flex flex-col">
                        
                        <!-- Tab Switcher -->
                        <div class="flex border-b border-slate-100 bg-slate-50/50">
                            <button 
                                @click="activeTab = 'penjualan'"
                                :class="activeTab === 'penjualan' ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-bold' : 'text-slate-500 hover:bg-white/50'"
                                class="flex-1 py-6 text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                Penjualan Hari Ini ({{ todayOrders.length }})
                            </button>
                            <button 
                                @click="activeTab = 'kaskeluar'"
                                :class="activeTab === 'kaskeluar' ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-bold' : 'text-slate-500 hover:bg-white/50'"
                                class="flex-1 py-6 text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                Kas Keluar ({{ todayPettyCash.length }})
                            </button>
                        </div>

                        <!-- Content Inside Tabs -->
                        <div class="flex-1 p-8 lg:p-12 bg-slate-50/50">
                            
                            <!-- TAB: PENJUALAN -->
                            <div v-if="activeTab === 'penjualan'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div v-if="todayOrders.length === 0" class="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <svg class="w-24 h-24 mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                    <p class="text-xl font-serif italic">Belum ada transaksi penjualan hari ini</p>
                                </div>

                                <div v-else class="overflow-x-auto">
                                    <table class="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr class="text-slate-400">
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Waktu</th>
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em]">No. Pesanan</th>
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Kasir</th>
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Tipe</th>
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Total</th>
                                                <th class="pb-2 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="order in todayOrders" :key="order.id" 
                                                :class="order.status === 'void' ? 'bg-slate-100/70 opacity-60' : 'bg-white hover:bg-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-0.5'"
                                                class="group transition-all duration-500">
                                                <td class="py-6 px-8 text-sm font-medium text-slate-400 first:rounded-l-[2rem]">{{ formatDate(order.created_at) }}</td>
                                                <td class="py-6 px-8">
                                                    <div class="flex flex-col">
                                                        <span :class="order.status === 'void' ? 'line-through text-slate-400' : 'text-slate-800'" class="font-black tracking-tight group-hover:text-amber-700 transition-colors">#{{ order.order_number }}</span>
                                                        <span v-if="order.status === 'void'" class="text-[10px] text-red-500 font-bold italic">{{ order.void_reason }}</span>
                                                    </div>
                                                </td>
                                                <td class="py-6 px-8 text-sm text-slate-600 font-medium">{{ order.user?.name }}</td>
                                                <td class="py-6 px-8">
                                                    <span v-if="order.status !== 'void'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 inline-block"
                                                        :class="order.order_type === 'dine_in' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'">
                                                        {{ order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway' }}
                                                    </span>
                                                    <span v-else class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-500 border border-slate-300 shrink-0 inline-block">
                                                        DIBATALKAN
                                                    </span>
                                                </td>
                                                <td class="py-6 px-8 text-right font-black text-slate-900 text-lg font-jakarta">
                                                    <span :class="order.status === 'void' ? 'line-through text-slate-400' : ''">Rp {{ formatPrice(order.total) }}</span>
                                                </td>
                                                <td class="py-6 px-8 text-center last:rounded-r-[2rem]">
                                                    <button 
                                                        v-if="order.status !== 'void'"
                                                        @click="confirmVoid(order)"
                                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90"
                                                        title="Batalkan Pesanan"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB: KAS KELUAR -->
                            <div v-if="activeTab === 'kaskeluar'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div v-if="todayPettyCash.length === 0" class="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <svg class="w-24 h-24 mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    <p class="text-xl font-serif italic">Tidak ada pengeluaran kas hari ini</p>
                                </div>

                                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div v-for="cash in todayPettyCash" :key="cash.id" class="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-amber-300 hover:bg-white hover:shadow-xl hover:shadow-amber-600/5 transition-all group">
                                        <div class="flex justify-between items-start mb-6">
                                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            </div>
                                            <span class="text-sm font-black text-slate-400 group-hover:text-amber-700 transition-colors">{{ formatDate(cash.created_at) }}</span>
                                        </div>
                                        <h3 class="font-bold text-slate-800 text-lg mb-2 capitalize">{{ cash.description }}</h3>
                                        <p class="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider">Kasir: {{ cash.user?.name }}</p>
                                        <p class="text-2xl font-black text-red-600 font-jakarta">
                                            - Rp {{ formatPrice(cash.amount) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Void Confirmation Modal -->
        <div v-if="showVoidModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0" @click="showVoidModal = false"></div>
            <div class="relative z-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div class="p-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </div>
                        <h2 class="text-2xl font-serif font-black text-red-600 uppercase tracking-widest">Batalkan Pesanan</h2>
                        <p class="text-slate-500 text-sm mt-2">Pesanan #{{ selectedOrderForVoid?.order_number }} akan dibatalkan dan stok akan dikembalikan.</p>
                    </div>

                    <form @submit.prevent="submitVoid" class="space-y-6">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Alasan Pembatalan</label>
                            <textarea v-model="voidForm.void_reason" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-red-400 outline-none" placeholder="Cth: Pelanggan salah pilih menu..." required></textarea>
                        </div>

                        <div class="flex gap-4">
                            <button type="button" @click="showVoidModal = false" class="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">Batal</button>
                            <button type="submit" :disabled="voidForm.processing" class="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                                {{ voidForm.processing ? 'Memproses...' : 'Batalkan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Sidebar Modals -->
        <ShiftModal :show="showShiftModal" @success="showShiftModal = false" />
        <EndShiftModal :show="showEndShiftModal" :active-shift="activeShift" @close="showEndShiftModal = false" />
        <PettyCashModal :show="showPettyCashModal" @close="showPettyCashModal = false" />
        <PrintReceiptModal :show="showPrintModal" :today-orders="todayOrders" :last-order="todayOrders && todayOrders.length > 0 ? todayOrders[0] : null" @close="showPrintModal = false" />
    </AuthenticatedLayout>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
