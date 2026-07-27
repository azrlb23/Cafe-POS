<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { PrinterService, type PrinterDevice } from '@/services/PrinterService';

const props = defineProps({
    show: Boolean,
    todayOrders: Array,
    lastOrder: Object, // Passed from Pos.vue to easily print the last order
});

const emit = defineEmits(['close']);

const activeTab = ref('last'); // 'last', 'search', or 'settings'
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 4;

const connectedDevice = ref<PrinterDevice | null>(null);
const isConnecting = ref(false);
const printStatusMessage = ref('');
const errorMessage = ref('');

const updatePrinterStatus = () => {
    connectedDevice.value = PrinterService.getConnectedDevice();
};

const handleConnectUsb = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    printStatusMessage.value = '';
    try {
        const dev = await PrinterService.connectUsb();
        connectedDevice.value = dev;
        printStatusMessage.value = `Terhubung ke printer USB (${dev.name})`;
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal menghubungkan printer USB';
    } finally {
        isConnecting.value = false;
    }
};

const handleConnectBluetooth = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    printStatusMessage.value = '';
    try {
        const dev = await PrinterService.connectBluetooth();
        connectedDevice.value = dev;
        printStatusMessage.value = `Terhubung ke printer Bluetooth (${dev.name})`;
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal menghubungkan printer Bluetooth';
    } finally {
        isConnecting.value = false;
    }
};

const handleDisconnect = async () => {
    await PrinterService.disconnect();
    connectedDevice.value = null;
    printStatusMessage.value = 'Printer terputus';
};

const handleTestPrint = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    printStatusMessage.value = '';
    try {
        await PrinterService.testPrint();
        printStatusMessage.value = 'Tes cetak ke printer SANPIDIE berhasil!';
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal tes cetak';
    } finally {
        isConnecting.value = false;
    }
};

// Direct 0-Click Print Handler
const handlePrintOrder = async (order: any, type: 'customer' | 'cashier' | 'kitchen') => {
    if (connectedDevice.value) {
        printStatusMessage.value = `Mencetak Struk ${type.toUpperCase()}...`;
        try {
            const success = await PrinterService.printOrder(order, type);
            if (success) {
                printStatusMessage.value = `Struk ${type.toUpperCase()} #${order.orderNumber} berhasil dicetak!`;
            } else {
                throw new Error('Gagal mengirim data cetak.');
            }
        } catch (e: any) {
            errorMessage.value = e.message || 'Gagal cetak direct printer. Membuka pratinjau browser...';
            // Fallback to browser print window
            window.open(`/pos/orders/${order.id}/print?type=${type}`, '_blank');
        }
    } else {
        // Fallback to browser PDF window
        window.open(`/pos/orders/${order.id}/print?type=${type}`, '_blank');
    }
};

// Effective last order (Fallback to most recent order from todayOrders if lastOrder is null)
const effectiveLastOrder = computed(() => {
    if (props.lastOrder) return props.lastOrder;
    if (props.todayOrders && props.todayOrders.length > 0) {
        return props.todayOrders[0];
    }
    return null;
});

// Computed filtered orders from today's orders
const filteredOrders = computed(() => {
    if (!props.todayOrders) return [];
    if (!searchQuery.value) return props.todayOrders;
    const q = searchQuery.value.toLowerCase();
    return props.todayOrders.filter((o: any) => 
        o.orderNumber.toLowerCase().includes(q) || 
        (o.cafeTable?.number && o.cafeTable.number.toString().includes(q)) ||
        o.orderType.toLowerCase().includes(q) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q)) ||
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

watch(() => props.show, (val) => {
    if (val) {
        updatePrinterStatus();
        printStatusMessage.value = '';
        errorMessage.value = '';
    }
});

onMounted(() => {
    updatePrinterStatus();
});

const formatTime = (timeString: any) => {
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
            
            <!-- Header with Integrated Printer Status Badge -->
            <div class="p-6 border-b border-stone-150 flex items-center justify-between shrink-0 bg-white">
                <div>
                    <h2 class="text-lg font-serif font-black text-amber-700 uppercase tracking-widest">Cetak Struk & Printer</h2>
                    <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Kelola pencetakan & sambungan printer SANPIDIE</p>
                </div>

                <div class="flex items-center gap-3">
                    <!-- Status Badge -->
                    <button 
                        @click="activeTab = 'settings'" 
                        :class="connectedDevice ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                        class="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
                        title="Klik untuk Pengaturan Printer"
                    >
                        <span class="w-2 h-2 rounded-full animate-pulse" :class="connectedDevice ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                        <span>{{ connectedDevice ? 'Printer Konek (' + connectedDevice.type.toUpperCase() + ')' : 'Hubungkan Printer' }}</span>
                    </button>

                    <button @click="$emit('close')" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <!-- Toast Messages -->
            <div v-if="printStatusMessage" class="px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest text-center transition-all">
                {{ printStatusMessage }}
            </div>
            <div v-if="errorMessage" class="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest text-center transition-all">
                {{ errorMessage }}
            </div>

            <!-- Tab Navigation -->
            <div class="px-6 py-3 bg-[#FCFAF7] border-b border-stone-100 flex gap-2 shrink-0">
                <button 
                    @click="activeTab = 'last'"
                    :class="activeTab === 'last' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'"
                    class="flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Struk Terakhir
                </button>
                <button 
                    @click="activeTab = 'search'"
                    :class="activeTab === 'search' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'"
                    class="flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Cari Struk ({{ todayOrders?.length || 0 }})
                </button>
                <button 
                    @click="activeTab = 'settings'"
                    :class="activeTab === 'settings' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'"
                    class="py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Koneksi Printer
                </button>
            </div>

            <!-- CONTENT BODY -->
            <div class="flex-grow overflow-y-auto p-6 min-h-0 bg-stone-50/20">
                
                <!-- TAB 1: CETAK STRUK TERAKHIR -->
                <div v-if="activeTab === 'last'" class="h-full flex flex-col justify-between">
                    <div v-if="effectiveLastOrder" class="space-y-6">
                        <!-- Virtual Receipt Card Graphic -->
                        <div class="bg-white border border-stone-200 rounded-[2.2rem] p-6 shadow-md relative overflow-hidden">
                            <!-- Premium Receipt Top Jagged Border Effect -->
                            <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-600"></div>
                            
                            <div class="text-center pb-4 border-b border-dashed border-stone-200">
                                <h3 class="text-xs font-serif font-black uppercase tracking-[0.2em] text-[#B45309]">Denjavas</h3>
                                <p class="text-base font-black text-stone-850 mt-1 font-mono tracking-tight font-serif">{{ effectiveLastOrder.orderNumber }}</p>
                                <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
                                    <span :class="effectiveLastOrder.orderType === 'dine_in' ? 'bg-[#3F6253]/10 text-[#3F6253] border border-[#3F6253]/20' : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20'"
                                          class="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border">
                                        {{ effectiveLastOrder.orderType === 'dine_in' ? 'Dine In' : 'Takeaway' }}
                                    </span>
                                    <span v-if="effectiveLastOrder.cafeTable && effectiveLastOrder.cafeTable.number" class="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                        Meja {{ effectiveLastOrder.cafeTable.number }}
                                    </span>
                                </div>
                            </div>

                            <!-- List of items inside this last order -->
                            <div class="py-4 border-b border-dashed border-stone-200 space-y-2">
                                <div v-for="item in (effectiveLastOrder.orderItems || [])" :key="item.id" class="flex justify-between text-xs font-bold text-stone-700">
                                    <span class="truncate pr-4 font-serif">{{ item.menuName || item.menu?.name }} <span class="text-amber-700 font-bold font-jakarta">x{{ item.quantity }}</span></span>
                                    <span class="shrink-0 font-jakarta">Rp {{ Number(item.subtotal).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>

                            <!-- Summary Details -->
                            <div class="pt-4 space-y-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                <div class="flex justify-between">
                                    <span>Sub Total</span>
                                    <span class="text-stone-750 font-jakarta">Rp {{ Number(effectiveLastOrder.subtotal || effectiveLastOrder.total).toLocaleString('id-ID') }}</span>
                                </div>
                                <div class="flex justify-between text-stone-855 text-xs font-black pt-2 border-t border-dashed border-stone-100 mt-2">
                                    <span>Total Bayar</span>
                                    <span class="text-amber-700 font-jakarta text-sm">Rp {{ Number(effectiveLastOrder.total).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Direct Print Actions -->
                        <div class="space-y-3">
                            <div class="flex justify-between items-center px-1">
                                <p class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Pilih Jenis Struk Cetak</p>
                                <span class="text-[9px] font-bold text-stone-400">
                                    {{ connectedDevice ? '⚡ 0-Klik Direct Thermal' : '📄 Browser PDF' }}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-3">
                                <button 
                                    @click="handlePrintOrder(effectiveLastOrder, 'customer')"
                                    class="bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                    Struk Pelanggan
                                </button>
                                <button 
                                    @click="handlePrintOrder(effectiveLastOrder, 'cashier')"
                                    class="bg-[#E3F2FD] hover:bg-[#BBDEFB] text-[#1565C0] border border-[#90CAF9] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    Struk Kasir
                                </button>
                                <button 
                                    @click="handlePrintOrder(effectiveLastOrder, 'kitchen')"
                                    class="bg-[#FFF8E1] hover:bg-[#FFECB3] text-[#B45309] border border-[#FFE082] p-4 rounded-2xl font-black uppercase text-[10px] tracking-wider text-center shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Struk Dapur
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- No last transaction message -->
                    <div v-else class="py-20 flex flex-col items-center justify-center text-stone-400 text-center">
                        <div class="w-16 h-16 bg-white border border-stone-150 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-stone-300"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <h4 class="text-xs font-black uppercase tracking-widest text-stone-700">Belum Ada Transaksi</h4>
                        <p class="text-[10px] text-stone-400 font-bold max-w-xs mt-2">Belum ada transaksi hari ini di dalam sistem.</p>
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
                            placeholder="Cari no. struk / meja / metode bayar..." 
                            class="w-full bg-white border border-stone-200 rounded-full pl-11 pr-4 py-2.5 text-xs font-bold focus:bg-slate-50 focus:ring-4 focus:ring-amber-600/10 transition-all shadow-sm outline-none"
                        >
                    </div>

                    <!-- Orders Table List -->
                    <div v-if="paginatedOrders.length > 0" class="space-y-2">
                        <div 
                            v-for="order in paginatedOrders" 
                            :key="order.id" 
                            class="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-amber-500 transition-all"
                        >
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-black text-stone-850 font-mono">#{{ order.orderNumber }}</span>
                                    <span :class="order.orderType === 'dine_in' ? 'bg-[#3F6253]/10 text-[#3F6253]' : 'bg-[#B45309]/10 text-[#B45309]'" class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                        {{ order.orderType === 'dine_in' ? (order.cafeTable?.number ? 'Meja ' + order.cafeTable.number : 'Dine In') : 'Takeaway' }}
                                    </span>
                                </div>
                                <p class="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                                    {{ formatTime(order.createdAt) }} • Rp {{ Number(order.total).toLocaleString('id-ID') }}
                                </p>
                            </div>

                            <div class="flex items-center gap-1.5">
                                <button 
                                    @click="handlePrintOrder(order, 'customer')"
                                    class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Customer
                                </button>
                                <button 
                                    @click="handlePrintOrder(order, 'cashier')"
                                    class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Kasir
                                </button>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="flex justify-between items-center pt-2">
                            <button 
                                @click="currentPage--" 
                                :disabled="currentPage === 1"
                                class="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-[9px] font-black uppercase tracking-widest disabled:opacity-40 cursor-pointer"
                            >
                                ← Prev
                            </button>
                            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                Hal {{ currentPage }} dari {{ totalPages }}
                            </span>
                            <button 
                                @click="currentPage++" 
                                :disabled="currentPage === totalPages"
                                class="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-[9px] font-black uppercase tracking-widest disabled:opacity-40 cursor-pointer"
                            >
                                Next →
                            </button>
                        </div>
                    </div>

                    <div v-else class="py-12 text-center text-stone-400">
                        <p class="text-xs font-bold">Tidak ada struk transaksi ditemukan</p>
                    </div>
                </div>

                <!-- TAB 3: PENGATURAN KONEKSI PRINTER -->
                <div v-if="activeTab === 'settings'" class="space-y-5">
                    <div :class="connectedDevice ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'" class="border rounded-2xl p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full animate-pulse" :class="connectedDevice ? 'bg-emerald-500' : 'bg-stone-400'"></div>
                            <div>
                                <p class="text-[9px] font-black uppercase tracking-widest opacity-60">Status Printer Thermal</p>
                                <h4 class="text-xs font-black mt-0.5">
                                    {{ connectedDevice ? `Terhubung: ${connectedDevice.name} (${connectedDevice.type.toUpperCase()})` : 'Belum Terhubung' }}
                                </h4>
                            </div>
                        </div>
                        <button 
                            v-if="connectedDevice" 
                            @click="handleDisconnect" 
                            class="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Putuskan
                        </button>
                    </div>

                    <div class="space-y-3">
                        <label class="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Hubungkan Printer Thermal (SANPIDIE)</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button 
                                @click="handleConnectUsb" 
                                :disabled="isConnecting"
                                class="p-4 rounded-2xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-stone-700 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                <span>Kabel USB</span>
                                <span class="text-[8px] font-normal text-stone-400">Direct Plug & Play</span>
                            </button>
                            <button 
                                @click="handleConnectBluetooth" 
                                :disabled="isConnecting"
                                class="p-4 rounded-2xl border border-stone-200 bg-white hover:bg-blue-50 hover:border-blue-400 text-stone-700 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>
                                <span>Bluetooth</span>
                                <span class="text-[8px] font-normal text-stone-400">Wireless Tablet/PC</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="connectedDevice" class="pt-2 border-t border-dashed border-stone-200">
                        <button 
                            @click="handleTestPrint" 
                            :disabled="isConnecting"
                            class="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            📄 Tes Cetak Struk SANPIDIE
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
