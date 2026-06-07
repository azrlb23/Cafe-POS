<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePosStore } from '@/stores/pos';
import api from '@/utils/api';
import PosSidebar from './Partials/PosSidebar.vue';
import ShiftModal from './Partials/ShiftModal.vue';
import EndShiftModal from './Partials/EndShiftModal.vue';
import PettyCashModal from './Partials/PettyCashModal.vue';
import PrintReceiptModal from './Partials/PrintReceiptModal.vue';

const authStore = useAuthStore();
const posStore = usePosStore();
const user = computed(() => authStore.user);

const todayOrders = ref([]);
const todayPettyCash = ref([]);
const activeShift = computed(() => posStore.activeShift);
const isLoading = ref(true);

const fetchData = async () => {
    try {
        isLoading.value = true;
        const res = await api.get('/pos/data');
        todayOrders.value = res.data.todayOrders;
        todayPettyCash.value = res.data.todayPettyCash;
        posStore.setActiveShift(res.data.activeShift);
        
        if (!res.data.activeShift) {
            showShiftModal.value = true;
        }
    } catch (e) {
        console.error("Failed to fetch POS data", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const showShiftModal = ref(false);
const showEndShiftModal = ref(false);
const showPettyCashModal = ref(false);
const showPrintModal = ref(false);

const activeTab = ref('penjualan');
const showVoidModal = ref(false);
const selectedOrderForVoid = ref(null);

const voidReason = ref('');
const isProcessingVoid = ref(false);

const showDetailModal = ref(false);
const selectedOrder = ref(null);

const openDetails = (order) => {
    selectedOrder.value = order;
    showDetailModal.value = true;
};

const getModifierText = (options) => {
    if (!options || options.length === 0) return '';
    return ' (' + options.map(o => o.optionName).join(', ') + ')';
};

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
    voidReason.value = '';
    showVoidModal.value = true;
};

const submitVoid = async () => {
    if (!voidReason.value.trim()) return;
    isProcessingVoid.value = true;
    try {
        await api.post(`/pos/orders/${selectedOrderForVoid.value.id}/void`, {
            void_reason: voidReason.value
        });
        showVoidModal.value = false;
        selectedOrderForVoid.value = null;
        voidReason.value = '';
        await fetchData();
    } catch (e) {
        console.error("Failed to void order", e);
    } finally {
        isProcessingVoid.value = false;
    }
};
</script>

<template>
            
        <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-slate-50/50 h-[calc(100vh-80px)]">
            <div class="w-10 h-10 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
        </div>

        <div v-else class="h-[calc(100vh-80px)] flex overflow-hidden relative bg-white border-t border-slate-100">
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
                                class="flex-1 py-6 text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                Penjualan Hari Ini ({{ todayOrders.length }})
                            </button>
                            <button 
                                @click="activeTab = 'kaskeluar'"
                                :class="activeTab === 'kaskeluar' ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-bold' : 'text-slate-500 hover:bg-white/50'"
                                class="flex-1 py-6 text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer">
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
                                                <td class="py-6 px-8 text-sm font-medium text-slate-400 first:rounded-l-[2rem]">{{ formatDate(order.createdAt) }}</td>
                                                <td class="py-6 px-8">
                                                    <div class="flex flex-col">
                                                        <span :class="order.status === 'void' ? 'line-through text-slate-400' : 'text-slate-800'" class="font-black tracking-tight group-hover:text-amber-700 transition-colors">#{{ order.orderNumber }}</span>
                                                        <span v-if="order.status === 'void'" class="text-[10px] text-red-500 font-bold italic">{{ order.voidReason }}</span>
                                                    </div>
                                                </td>
                                                <td class="py-6 px-8 text-sm text-slate-600 font-medium">{{ order.user?.name }}</td>
                                                <td class="py-6 px-8">
                                                    <span v-if="order.status !== 'void'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 inline-block"
                                                        :class="order.orderType === 'dine_in' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'">
                                                        {{ order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway' }}
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
                                                        @click="openDetails(order)"
                                                        class="bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer mr-2 inline-flex"
                                                        title="Rincian Pesanan"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                                    </button>
                                                    <button 
                                                        v-if="order.status !== 'void'"
                                                        @click="confirmVoid(order)"
                                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer inline-flex"
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

        <!-- Dynamic Order Details Popup Modal -->
        <div v-if="showDetailModal && selectedOrder" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0" @click="showDetailModal = false"></div>
            
            <div class="relative z-10 bg-[#FCFAF7] border border-stone-200 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
                <!-- Header -->
                <div class="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 class="text-base font-serif font-black text-stone-850 tracking-tight flex items-center gap-2">
                            <span>Pesanan #{{ selectedOrder.orderNumber }}</span>
                            <span 
                                :class="selectedOrder.status === 'void' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-stone-100 text-stone-700 border-stone-200'"
                                class="px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border"
                            >
                                {{ selectedOrder.status === 'void' ? 'Dibatalkan' : 'Selesai' }}
                            </span>
                        </h2>
                        <p class="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Diproses oleh: {{ selectedOrder.user?.name || 'Kasir' }}</p>
                    </div>
                    <button @click="showDetailModal = false" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all cursor-pointer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-grow overflow-y-auto p-6 bg-stone-50/20 space-y-6 min-h-0">
                    <!-- Service details -->
                    <div class="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
                        <div>
                            <span class="block text-[8px] text-stone-400 mb-0.5">Tipe Layanan</span>
                            <span class="text-stone-800 text-xs">{{ selectedOrder.orderType === 'dine_in' ? 'Dine In' : 'Takeaway' }}</span>
                        </div>
                        <div>
                            <span class="block text-[8px] text-stone-400 mb-0.5">Meja Saji</span>
                            <span class="text-stone-850 text-xs">{{ selectedOrder.cafeTable?.number ? 'Meja ' + selectedOrder.cafeTable.number : '-' }}</span>
                        </div>
                    </div>

                    <!-- Items Detail Table -->
                    <div class="bg-white border border-stone-200 rounded-[1.8rem] p-5 shadow-sm space-y-4">
                        <h4 class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Detail Item Belanja</h4>
                        
                        <div class="space-y-3.5">
                            <div 
                                v-for="item in selectedOrder.orderItems" 
                                :key="item.id"
                                class="flex justify-between items-start text-xs font-bold text-stone-750"
                                :class="{'opacity-50 line-through': selectedOrder.status === 'void'}"
                            >
                                <div class="pr-6 font-serif">
                                    <span class="block font-black leading-tight">{{ item.menuName || item.menu?.name }}</span>
                                    <span class="text-stone-400 text-[10px] font-semibold block mt-0.5 font-sans">{{ getModifierText(item.orderItemOptions) }}</span>
                                    <span v-if="item.notes" class="text-amber-700 text-[9px] font-bold block mt-0.5 italic font-sans">Catatan: "{{ item.notes }}"</span>
                                </div>
                                <div class="shrink-0 font-jakarta text-stone-800">
                                    <span class="text-amber-655 font-bold mr-3 text-amber-700">x{{ item.quantity }}</span>
                                    Rp {{ Number(item.subtotal).toLocaleString('id-ID') }}
                                </div>
                            </div>
                        </div>

                        <!-- Summary prices -->
                        <div class="pt-4 border-t border-dashed border-stone-200 space-y-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                            <div class="flex justify-between">
                                <span>Sub Total</span>
                                <span class="text-stone-750 font-jakarta">Rp {{ Number(selectedOrder.subtotal).toLocaleString('id-ID') }}</span>
                            </div>
                            <div class="flex justify-between text-stone-850 text-xs font-black pt-2">
                                <span>Total Tagihan</span>
                                <span class="text-amber-700 font-jakarta text-sm">Rp {{ Number(selectedOrder.total).toLocaleString('id-ID') }}</span>
                            </div>
                            <div class="flex justify-between text-[9px] text-stone-400 font-semibold normal-case pt-1">
                                <span>Metode Bayar</span>
                                <span class="uppercase tracking-wider font-bold text-stone-700 font-mono">{{ selectedOrder.paymentMethod }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 bg-stone-50 border-t border-stone-100 flex gap-3 shrink-0">
                    <button 
                        v-if="selectedOrder.status !== 'void'"
                        @click="confirmVoid(selectedOrder); showDetailModal = false;"
                        class="px-5 py-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 cursor-pointer"
                    >
                        Batalkan (Void)
                    </button>
                    <button 
                        @click="showDetailModal = false"
                        class="flex-grow bg-[#2E2925] hover:bg-[#1E1A17] text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 cursor-pointer"
                    >
                        Tutup
                    </button>
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
                        <p class="text-slate-500 text-sm mt-2">Pesanan #{{ selectedOrderForVoid?.orderNumber }} akan dibatalkan dan stok akan dikembalikan.</p>
                    </div>

                    <form @submit.prevent="submitVoid" class="space-y-6">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Alasan Pembatalan</label>
                            <textarea v-model="voidReason" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-red-400 outline-none" placeholder="Cth: Pelanggan salah pilih menu..." required></textarea>
                        </div>

                        <div class="flex gap-4">
                            <button type="button" @click="showVoidModal = false" class="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isProcessingVoid" class="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer">
                                {{ isProcessingVoid ? 'Memproses...' : 'Batalkan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Sidebar Modals -->
        <ShiftModal :show="showShiftModal" @success="showShiftModal = false; fetchData();" />
        <EndShiftModal :show="showEndShiftModal" :active-shift="activeShift" @close="showEndShiftModal = false" @success="showEndShiftModal = false; fetchData();" />
        <PettyCashModal :show="showPettyCashModal" @close="showPettyCashModal = false" @success="showPettyCashModal = false; fetchData();" />
        <PrintReceiptModal :show="showPrintModal" :today-orders="todayOrders" :last-order="todayOrders && todayOrders.length > 0 ? todayOrders[0] : null" @close="showPrintModal = false" />
    </template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
