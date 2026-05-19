<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    show: Boolean,
    todayOrders: Array,
    lastOrder: Object, // Passed from Pos.vue to easily print the last order
});

const emit = defineEmits(['close']);

const activeTab = ref('last'); // 'last' or 'search'
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 4;

// Computed filtered orders from today's orders
const filteredOrders = computed(() => {
    if (!props.todayOrders) return [];
    if (!searchQuery.value) return props.todayOrders;
    const q = searchQuery.value.toLowerCase();
    return props.todayOrders.filter(o => 
        o.order_number.toLowerCase().includes(q) || 
        (o.cafe_table?.number && o.cafe_table.number.toString().includes(q)) ||
        (o.cafe_table?.name && o.cafe_table.name.toLowerCase().includes(q)) ||
        o.order_type.toLowerCase().includes(q) ||
        o.payment_method.toLowerCase().includes(q) ||
        o.total.toString().includes(q)
    );
});

// Computed total pages
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));

// Slice filtered results for current page
const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredOrders.value.slice(start, start + itemsPerPage);
});

// Reset page on search or tab change
watch([searchQuery, activeTab], () => {
    currentPage.value = 1;
});

const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0 animate-in fade-in duration-300" @click="$emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-[#FCFAF7] border border-stone-200 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="p-6 border-b border-stone-150 flex items-center justify-between shrink-0">
                <div>
                    <h2 class="text-lg font-serif font-black text-amber-600 uppercase tracking-widest">Cetak Struk & PDF</h2>
                    <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Kelola pencetakan struk transaksi kasir</p>
                </div>
                <button @click="$emit('close')" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Tab Navigation (Inline Selection) -->
            <div class="px-6 py-3 bg-[#FCFAF7] border-b border-stone-100 flex gap-2 shrink-0">
                <button 
                    @click="activeTab = 'last'"
                    :class="activeTab === 'last' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'"
                    class="flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Struk Terakhir
                </button>
                <button 
                    @click="activeTab = 'search'"
                    :class="activeTab === 'search' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'"
                    class="flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Cari Struk Lain
                </button>
            </div>

            <!-- CONTENT BODY -->
            <div class="flex-grow overflow-y-auto p-6 min-h-0 bg-stone-50/20">
                
                <!-- TAB 1: CETAK STRUK TERAKHIR -->
                <div v-if="activeTab === 'last'" class="h-full flex flex-col justify-between">
                    <div v-if="lastOrder" class="space-y-6">
                        <!-- Virtual Receipt Card Graphic -->
                        <div class="bg-white border border-stone-200 rounded-[2.2rem] p-6 shadow-md relative overflow-hidden">
                            <!-- Premium Receipt Top Jagged Border Effect -->
                            <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-600"></div>
                            
                            <div class="text-center pb-4 border-b border-dashed border-stone-200">
                                <h3 class="text-xs font-serif font-black uppercase tracking-[0.2em] text-[#B45309]">Denjavas Cafe</h3>
                                <p class="text-base font-black text-stone-850 mt-1 font-mono tracking-tight font-serif">{{ lastOrder.order_number }}</p>
                                <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
                                    <span :class="lastOrder.order_type === 'dine_in' ? 'bg-[#3F6253]/10 text-[#3F6253] border border-[#3F6253]/20' : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20'"
                                          class="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border">
                                        {{ lastOrder.order_type === 'dine_in' ? 'Dine In' : 'Takeaway' }}
                                    </span>
                                    <span v-if="lastOrder.cafe_table" class="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                        Meja {{ lastOrder.cafe_table.number }}
                                    </span>
                                </div>
                            </div>

                            <!-- List of items inside this last order -->
                            <div class="py-4 border-b border-dashed border-stone-200 space-y-2">
                                <div v-for="item in lastOrder.order_items" :key="item.id" class="flex justify-between text-xs font-bold text-stone-700">
                                    <span class="truncate pr-4 font-serif">{{ item.menu_name }} <span class="text-amber-700 font-bold font-jakarta">x{{ item.quantity }}</span></span>
                                    <span class="shrink-0 font-jakarta">Rp {{ Number(item.subtotal).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>

                            <!-- Summary Details -->
                            <div class="pt-4 space-y-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                <div class="flex justify-between">
                                    <span>Sub Total</span>
                                    <span class="text-stone-750 font-jakarta">Rp {{ Number(lastOrder.subtotal).toLocaleString('id-ID') }}</span>
                                </div>
                                <div class="flex justify-between text-stone-855 text-xs font-black pt-2 border-t border-dashed border-stone-100 mt-2">
                                    <span>Total Bayar</span>
                                    <span class="text-amber-700 font-jakarta text-sm">Rp {{ Number(lastOrder.total).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Direct Large Print Actions -->
                        <div class="space-y-3">
                            <p class="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center">Pilih Format PDF Cetak</p>
                            <div class="grid grid-cols-3 gap-3">
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: lastOrder.id, type: 'customer' })"
                                    target="_blank"
                                    class="bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2z"/><path d="M19 17v5"/></svg>
                                    Customer PDF
                                </a>
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: lastOrder.id, type: 'cashier' })"
                                    target="_blank"
                                    class="bg-[#E3F2FD] hover:bg-[#BBDEFB] text-[#1565C0] border border-[#90CAF9] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    Kasir PDF
                                </a>
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: lastOrder.id, type: 'kitchen' })"
                                    target="_blank"
                                    class="bg-[#FFF8E1] hover:bg-[#FFECB3] text-[#B45309] border border-[#FFE082] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Dapur PDF
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- No last transaction message -->
                    <div v-else class="py-20 flex flex-col items-center justify-center text-stone-400 text-center">
                        <div class="w-16 h-16 bg-white border border-stone-150 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-stone-300"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <h4 class="text-xs font-black uppercase tracking-widest text-stone-700">Belum Ada Transaksi</h4>
                        <p class="text-[10px] text-stone-400 font-bold max-w-xs mt-2">Belum ada transaksi di sesi aktif ini. Silakan gunakan tab "Cari Struk Lain" untuk mencari struk hari ini.</p>
                    </div>
                </div>

                <!-- TAB 2: CARI STRUK LAIN -->
                <div v-if="activeTab === 'search'" class="space-y-4">
                    <!-- Search Input -->
                    <div class="relative shrink-0">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari no. pesanan atau nomor meja..." 
                            class="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold focus:border-amber-600 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
                        >
                    </div>

                    <!-- Scrollable Order History -->
                    <div class="space-y-3">
                        <div v-if="filteredOrders.length === 0" class="py-12 flex flex-col items-center justify-center text-stone-400 text-center">
                            <div class="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-stone-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </div>
                            <p class="text-xs font-bold text-stone-400">Tidak ada transaksi yang cocok</p>
                        </div>

                        <div v-for="order in paginatedOrders" :key="order.id" class="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div class="flex-grow min-w-0">
                                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span class="text-xs font-black text-stone-855 font-jakarta tracking-tight font-serif">{{ order.order_number }}</span>
                                    <span :class="order.order_type === 'dine_in' ? 'bg-[#3F6253]/10 text-[#3F6253] border border-[#3F6253]/20' : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20'"
                                          class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0">
                                        {{ order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway' }}
                                    </span>
                                    <span v-if="order.cafe_table" class="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">
                                        Meja {{ order.cafe_table.number }}
                                    </span>
                                </div>
                                <p class="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                    <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="inline mb-0.5 mr-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 15"/></svg> {{ formatTime(order.created_at) }}</span>
                                    <span>•</span>
                                    <span class="text-amber-700 font-jakarta">Rp {{ Number(order.total).toLocaleString('id-ID') }}</span>
                                    <span>•</span>
                                    <span class="text-stone-500 normal-case font-bold">via {{ order.payment_method.toUpperCase() }}</span>
                                </p>
                            </div>

                            <!-- PDF Printing Action pills -->
                            <div class="flex items-center gap-2 shrink-0 flex-wrap">
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: order.id, type: 'customer' })"
                                    target="_blank"
                                    class="bg-emerald-50 text-[#2E7D32] hover:bg-[#E8F5E9] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[#A5D6A7] flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 shadow-sm"
                                >
                                    Customer
                                </a>
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: order.id, type: 'cashier' })"
                                    target="_blank"
                                    class="bg-blue-50 text-[#1565C0] hover:bg-[#E3F2FD] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[#90CAF9] flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 shadow-sm"
                                >
                                    Kasir
                                </a>
                                <a 
                                    :href="route('pos.orders.print-pdf', { order: order.id, type: 'kitchen' })"
                                    target="_blank"
                                    class="bg-amber-50 text-[#B45309] hover:bg-[#FFF8E1] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[#FFE082] flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 shadow-sm"
                                >
                                    Dapur
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination Controls -->
                    <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-stone-200 bg-white px-4 py-3 rounded-2xl border border-stone-200 shadow-sm shrink-0">
                        <span class="text-[9px] font-black uppercase text-stone-400 tracking-widest">
                            Halaman {{ currentPage }} dari {{ totalPages }}
                        </span>
                        
                        <div class="flex items-center gap-2">
                            <button 
                                @click="currentPage--" 
                                :disabled="currentPage === 1"
                                class="px-3 py-2 rounded-xl border border-stone-200 bg-white text-slate-600 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                                Sebelumnya
                            </button>
                            <button 
                                @click="currentPage++" 
                                :disabled="currentPage === totalPages"
                                class="px-3 py-2 rounded-xl border border-stone-200 bg-white text-slate-600 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                Selanjutnya
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer info -->
            <div class="p-6 border-t border-stone-150 shrink-0 bg-[#FCFAF7] flex justify-between items-center text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <span>Total Hari Ini: {{ todayOrders ? todayOrders.length : 0 }} Pesanan</span>
                <span>Denjavas Retro Café</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
