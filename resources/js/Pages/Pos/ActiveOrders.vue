<script setup>
import { ref, computed, onMounted } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PosSidebar from './Partials/PosSidebar.vue';
import ShiftModal from './Partials/ShiftModal.vue';
import EndShiftModal from './Partials/EndShiftModal.vue';
import PettyCashModal from './Partials/PettyCashModal.vue';
import PrintReceiptModal from './Partials/PrintReceiptModal.vue';

const props = defineProps({
    todayOrders: Array,
    activeShift: Object,
});

// State for active modals from sidebar
const showShiftModal = ref(!props.activeShift);
const showEndShiftModal = ref(false);
const showPettyCashModal = ref(false);
const showPrintModal = ref(false);

// Active Orders specific state
const activeTab = ref('all'); // 'all', 'pending' (on process), 'completed'
const searchQuery = ref('');

// Details Modal state
const showDetailModal = ref(false);
const selectedOrder = ref(null);

// Void Modal state
const showVoidModal = ref(false);
const selectedOrderForVoid = ref(null);
const voidReason = ref('');

const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitialBadge = (order) => {
    if (order.order_type === 'takeaway') return 'TA';
    return order.cafe_table?.number ? `${order.cafe_table.number}` : 'D';
};

const getBadgeBg = (order) => {
    if (order.order_type === 'takeaway') return 'bg-[#B45309] text-white shadow-md shadow-amber-900/10'; // Vintage Deep Warm Orange/Amber
    if (order.cafe_table?.number % 3 === 0) return 'bg-[#3F6253] text-white shadow-md shadow-teal-950/10'; // Vintage Forest Green
    if (order.cafe_table?.number % 2 === 0) return 'bg-[#7C5A3E] text-white shadow-md shadow-stone-900/10'; // Cozy Cocoa Brown
    return 'bg-[#2B4C6F] text-white shadow-md shadow-slate-950/10'; // Muted Midnight Indigo
};

// Filtered Active Orders
const filteredOrders = computed(() => {
    let list = props.todayOrders || [];
    
    // 1. Status Tab filter
    if (activeTab.value === 'pending') {
        list = list.filter(o => o.status === 'pending');
    } else if (activeTab.value === 'completed') {
        list = list.filter(o => o.status === 'completed');
    }

    // 2. Search query filter
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(o => 
            o.order_number.toLowerCase().includes(q) ||
            (o.cafe_table?.number && o.cafe_table.number.toString().includes(q)) ||
            (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
            o.order_type.toLowerCase().includes(q)
        );
    }

    return list;
});

// Serve (Sajikan) order action
const serveOrder = (order) => {
    router.post(route('pos.orders.update-status', order.id), {
        status: 'completed'
    }, {
        preserveScroll: true,
        onSuccess: () => {
            if (selectedOrder.value?.id === order.id) {
                selectedOrder.value.status = 'completed';
            }
        }
    });
};

const openDetails = (order) => {
    selectedOrder.value = order;
    showDetailModal.value = true;
};

const startVoid = (order) => {
    selectedOrderForVoid.value = order;
    voidReason.value = '';
    showVoidModal.value = true;
    showDetailModal.value = false;
};

const submitVoid = () => {
    if (!voidReason.value.trim()) return;
    router.post(route('pos.orders.void', selectedOrderForVoid.value.id), {
        void_reason: voidReason.value
    }, {
        onSuccess: () => {
            showVoidModal.value = false;
            selectedOrderForVoid.value = null;
        }
    });
};

const getModifierText = (options) => {
    if (!options || options.length === 0) return '';
    return ' (' + options.map(o => o.option_name).join(', ') + ')';
};
</script>

<template>
    <Head title="Pesanan Aktif" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center w-full">
                <!-- Search bar matching POS header -->
                <div class="relative w-80">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Search active orders..." 
                        class="w-full bg-slate-50 border-0 rounded-full pl-11 pr-4 py-2.5 text-xs font-bold focus:bg-slate-100 focus:ring-4 focus:ring-amber-600/5 transition-all shadow-inner"
                    >
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

            <!-- Main Orders Workspace -->
            <div class="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FAF8F5] flex flex-col gap-6 no-scrollbar">
                
                <!-- Page Top Title & Header Panel -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FCFAF7] rounded-[2rem] p-6 border border-stone-200/60 shadow-sm shrink-0">
                    <div>
                        <h2 class="text-xl font-serif font-black text-stone-900 leading-tight">Monitoring Pesanan</h2>
                        <p class="text-stone-400 text-[9px] font-black uppercase tracking-widest mt-1">Kelola persiapan makanan & penyajian meja</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-black text-stone-700 bg-stone-100 px-4 py-2 rounded-xl uppercase tracking-wider">
                            {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                        </span>
                    </div>
                </div>

                <!-- Tabs & Filters Row -->
                <div class="flex flex-wrap justify-between items-center gap-4 shrink-0">
                    <!-- Amber Pills Switcher -->
                    <div class="bg-[#FCFAF7] border border-stone-200/80 p-1.5 rounded-2xl flex gap-1 shadow-sm">
                        <button 
                            @click="activeTab = 'all'"
                            :class="activeTab === 'all' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-stone-500 hover:bg-stone-50'"
                            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Semua ({{ todayOrders.length }})
                        </button>
                        <button 
                            @click="activeTab = 'pending'"
                            :class="activeTab === 'pending' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-stone-500 hover:bg-stone-50'"
                            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Proses Masak ({{ todayOrders.filter(o => o.status === 'pending').length }})
                        </button>
                        <button 
                            @click="activeTab = 'completed'"
                            :class="activeTab === 'completed' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-stone-500 hover:bg-stone-50'"
                            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Selesai Saji ({{ todayOrders.filter(o => o.status === 'completed').length }})
                        </button>
                    </div>
                </div>

                <!-- Cards Grid -->
                <div class="flex-grow min-h-0">
                    <div v-if="filteredOrders.length === 0" class="py-24 bg-[#FCFAF7] border border-stone-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm">
                        <div class="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-stone-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <h4 class="text-xs font-black uppercase tracking-widest text-stone-700">Tidak Ada Pesanan</h4>
                        <p class="text-[10px] text-stone-400 font-bold max-w-xs mt-2">Belum ada pesanan aktif yang sesuai dengan saringan filter saat ini.</p>
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                        <div 
                            v-for="order in filteredOrders" 
                            :key="order.id"
                            class="bg-[#FCFAF7] border border-stone-200/80 rounded-[2.2rem] p-6 shadow-sm hover:shadow-xl hover:border-amber-700/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                        >
                            <!-- Card Top Section -->
                            <div>
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center gap-3.5">
                                        <!-- Circle Table Initial Badge -->
                                        <div :class="getBadgeBg(order)" class="w-11 h-11 rounded-full flex items-center justify-center font-serif font-black text-sm shadow-md transition-transform group-hover:scale-105">
                                            {{ getInitialBadge(order) }}
                                        </div>
                                        <div>
                                            <h3 class="text-xs font-black text-stone-850 leading-none flex items-center gap-1.5 font-serif">
                                                {{ order.order_type === 'takeaway' ? 'Pelanggan Takeaway' : (order.cafe_table?.name || 'Dine-In') }}
                                            </h3>
                                            <p class="text-[9px] font-black text-stone-400 uppercase tracking-widest font-mono mt-1">
                                                {{ order.order_number }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Cooking Status badge -->
                                    <div>
                                        <span 
                                            v-if="order.status === 'pending'"
                                            class="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0"
                                        >
                                            <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                            PROSES MASAK
                                        </span>
                                        <span 
                                            v-else
                                            class="bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0"
                                        >
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
                                            SELESAI SAJI
                                        </span>
                                    </div>
                                </div>

                                <!-- Date & Time of Order -->
                                <div class="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center justify-between pb-3 border-b border-dashed border-stone-200">
                                    <span>{{ formatDate(order.created_at) }}</span>
                                    <span>{{ formatTime(order.created_at) }}</span>
                                </div>

                                <!-- Items List Inside Card -->
                                <div class="py-4 space-y-2.5">
                                    <!-- Only show top 3 items inside active card layout for neat look -->
                                    <div 
                                        v-for="item in (order.order_items || []).slice(0, 3)" 
                                        :key="item.id"
                                        class="flex justify-between items-start text-xs font-bold text-stone-700"
                                    >
                                        <span class="truncate pr-4 leading-tight">
                                            {{ item.menu_name }}
                                            <span class="text-stone-400 text-[10px] block font-semibold mt-0.5">{{ getModifierText(item.order_item_options) }}</span>
                                        </span>
                                        <span class="shrink-0 font-jakarta text-stone-500">
                                            <span class="text-amber-700 font-bold mr-2 text-[11px]">x{{ item.quantity }}</span>
                                            Rp {{ Number(item.subtotal).toLocaleString('id-ID') }}
                                        </span>
                                    </div>

                                    <!-- Faded "+X more" indicator if items count exceeds 3 -->
                                    <div 
                                        v-if="order.order_items?.length > 3"
                                        class="text-center pt-1.5 text-[9px] font-black uppercase tracking-widest text-stone-400/80 animate-pulse"
                                    >
                                        +{{ order.order_items.length - 3 }} Menu Lainnya
                                    </div>
                                </div>
                            </div>

                            <!-- Card Bottom Section (Financial Total & Footer Actions) -->
                            <div class="pt-4 border-t border-dashed border-stone-200">
                                <div class="flex justify-between items-center mb-5">
                                    <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Bayar</span>
                                    <span class="text-base font-black text-stone-900 font-jakarta">
                                        Rp {{ Number(order.total).toLocaleString('id-ID') }}
                                    </span>
                                </div>

                                <div class="flex gap-2">
                                    <button 
                                        @click="openDetails(order)"
                                        class="flex-1 py-3 rounded-xl bg-stone-50 text-stone-600 border border-stone-200 font-black uppercase text-[9px] tracking-widest transition-all hover:bg-stone-100 hover:text-stone-950 active:scale-95"
                                    >
                                        Rincian
                                    </button>
                                    
                                    <!-- Serve button if cooking, void/print receipt options if already completed -->
                                    <button 
                                        v-if="order.status === 'pending'"
                                        @click="serveOrder(order)"
                                        class="flex-[1.5] bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-md shadow-amber-600/10"
                                    >
                                        Sajikan
                                    </button>
                                    <button 
                                        v-else
                                        @click="openDetails(order)"
                                        class="flex-[1.5] bg-stone-800 hover:bg-stone-900 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-md shadow-stone-800/10"
                                    >
                                        Selesai Saji
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Dynamic Order Details Popup Modal (Standardized Snug Minimal) -->
        <div v-if="showDetailModal && selectedOrder" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0" @click="showDetailModal = false"></div>
            
            <div class="relative z-10 bg-[#FCFAF7] border border-stone-200 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
                <!-- Header -->
                <div class="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 class="text-base font-serif font-black text-stone-850 tracking-tight flex items-center gap-2">
                            <span>Pesanan #{{ selectedOrder.order_number }}</span>
                            <span 
                                :class="selectedOrder.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-700 border-stone-200'"
                                class="px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border"
                            >
                                {{ selectedOrder.status === 'pending' ? 'Cooking' : 'Ready' }}
                            </span>
                        </h2>
                        <p class="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Diproses oleh: {{ selectedOrder.user?.name || 'Kasir' }}</p>
                    </div>
                    <button @click="showDetailModal = false" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-grow overflow-y-auto p-6 bg-stone-50/20 space-y-6 min-h-0">
                    <!-- Service details -->
                    <div class="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
                        <div>
                            <span class="block text-[8px] text-stone-400 mb-0.5">Tipe Layanan</span>
                            <span class="text-stone-800 text-xs">{{ selectedOrder.order_type === 'dine_in' ? 'Dine In' : 'Takeaway' }}</span>
                        </div>
                        <div>
                            <span class="block text-[8px] text-stone-400 mb-0.5">Meja Saji</span>
                            <span class="text-stone-850 text-xs">{{ selectedOrder.cafe_table?.number ? 'Meja ' + selectedOrder.cafe_table.number : '-' }}</span>
                        </div>
                    </div>

                    <!-- Items Detail Table -->
                    <div class="bg-white border border-stone-200 rounded-[1.8rem] p-5 shadow-sm space-y-4">
                        <h4 class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Detail Item Belanja</h4>
                        
                        <div class="space-y-3.5">
                            <div 
                                v-for="item in selectedOrder.order_items" 
                                :key="item.id"
                                class="flex justify-between items-start text-xs font-bold text-stone-750"
                            >
                                <div class="pr-6 font-serif">
                                    <span class="block font-black leading-tight">{{ item.menu_name }}</span>
                                    <span class="text-stone-400 text-[10px] font-semibold block mt-0.5 font-sans">{{ getModifierText(item.order_item_options) }}</span>
                                    <span v-if="item.notes" class="text-amber-700 text-[9px] font-bold block mt-0.5 italic font-sans">Catatan: "{{ item.notes }}"</span>
                                </div>
                                <div class="shrink-0 font-jakarta text-stone-800">
                                    <span class="text-amber-655 font-bold mr-3">x{{ item.quantity }}</span>
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
                                <span class="uppercase tracking-wider font-bold text-stone-700 font-mono">{{ selectedOrder.payment_method }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- PDF Printing shortcuts direct inside detail modal -->
                    <div class="space-y-2 shrink-0">
                        <h4 class="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center">Format Cetak Struk PDF</h4>
                        <div class="grid grid-cols-3 gap-2.5">
                            <a 
                                :href="route('pos.orders.print-pdf', { order: selectedOrder.id, type: 'customer' })"
                                target="_blank"
                                class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 p-3.5 rounded-2xl font-black uppercase text-[9px] tracking-wider text-center transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
                            >
                                Customer PDF
                            </a>
                            <a 
                                :href="route('pos.orders.print-pdf', { order: selectedOrder.id, type: 'cashier' })"
                                target="_blank"
                                class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-150 p-3.5 rounded-2xl font-black uppercase text-[9px] tracking-wider text-center transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
                            >
                                Kasir PDF
                            </a>
                            <a 
                                :href="route('pos.orders.print-pdf', { order: selectedOrder.id, type: 'kitchen' })"
                                target="_blank"
                                class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-150 p-3.5 rounded-2xl font-black uppercase text-[9px] tracking-wider text-center transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
                            >
                                Dapur PDF
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 bg-stone-50 border-t border-stone-100 flex gap-3 shrink-0">
                    <button 
                        @click="startVoid(selectedOrder)"
                        class="px-5 py-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                    >
                        Batalkan (Void)
                    </button>
                    
                    <button 
                        v-if="selectedOrder.status === 'pending'"
                        @click="serveOrder(selectedOrder); showDetailModal = false;"
                        class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-amber-600/10"
                    >
                        Sajikan Pesanan
                    </button>
                    <button 
                        @click="showDetailModal = false"
                        class="flex-grow bg-[#2E2925] hover:bg-[#1E1A17] text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>

        <!-- Void Popup Modal (Standardized Cozy Minimal) -->
        <div v-if="showVoidModal && selectedOrderForVoid" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0" @click="showVoidModal = false"></div>
            
            <div class="relative z-10 bg-[#FCFAF7] border border-stone-200 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div class="p-8">
                    <div class="text-center mb-6">
                        <div class="w-14 h-14 bg-red-50 border border-red-150 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg class="text-red-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <h3 class="text-lg font-serif font-black text-red-650 uppercase tracking-widest">Batalkan Pesanan</h3>
                        <p class="text-stone-400 text-[10px] font-bold uppercase tracking-wider mt-1">Pembatalan transaksi #{{ selectedOrderForVoid.order_number }}</p>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Alasan Pembatalan (Void Reason)</label>
                            <textarea 
                                v-model="voidReason" 
                                rows="3" 
                                class="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-bold focus:border-red-400 outline-none transition-all" 
                                placeholder="Cth: Salah input menu / Pelanggan membatalkan meja..."
                                required
                            ></textarea>
                        </div>

                        <div class="flex gap-3">
                            <button 
                                type="button" 
                                @click="showVoidModal = false; openDetails(selectedOrderForVoid);" 
                                class="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 text-xs transition-all"
                            >
                                Kembali
                            </button>
                            <button 
                                type="button"
                                @click="submitVoid"
                                :disabled="!voidReason.trim()"
                                class="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs transition-all shadow-md shadow-red-500/15 disabled:opacity-40"
                            >
                                Konfirmasi Void
                            </button>
                        </div>
                    </div>
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
