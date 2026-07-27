<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePosStore } from '@/stores/pos';
import api from '@/utils/api';
import ShiftModal from './Partials/ShiftModal.vue';
import EndShiftModal from './Partials/EndShiftModal.vue';
import TableSelectionModal from './Partials/TableSelectionModal.vue';
import OptionSelectionModal from './Partials/OptionSelectionModal.vue';
import PaymentModal from './Partials/PaymentModal.vue';
import CartPanel from './Partials/CartPanel.vue';
import PettyCashModal from './Partials/PettyCashModal.vue';
import PosSidebar from './Partials/PosSidebar.vue';
import PrintReceiptModal from './Partials/PrintReceiptModal.vue';
import { PrinterService } from '@/services/PrinterService';

const authStore = useAuthStore();
const posStore = usePosStore();
const user = computed(() => authStore.user);

// Data states from Pinia store
const menus = computed(() => posStore.menus);
const categories = computed(() => posStore.categories);
const tables = computed(() => posStore.tables);
const activeShift = computed(() => posStore.activeShift);
const todayOrders = computed(() => posStore.todayOrders);
const todayPettyCash = computed(() => posStore.todayPettyCash);
const isLoading = ref(!posStore.hasLoaded);

// View states
const activeCategoryId = ref(null);
const cart = reactive([]);
const selectedTable = ref(null);
const orderType = ref('dine_in'); // 'dine_in' or 'takeaway'
const showMenuImages = ref(localStorage.getItem('pos_show_menu_images') !== 'false');

const toggleShowImages = (val: boolean) => {
    showMenuImages.value = val;
    localStorage.setItem('pos_show_menu_images', String(val));
};

const handleOrderTypeChange = (type) => {
    orderType.value = type;
    if (type === 'takeaway') {
        selectedTable.value = null;
    }
};

const handleTableSelect = (t) => {
    if (!t || t.id === null || t.number === null) {
        selectedTable.value = null;
        orderType.value = 'takeaway';
    } else {
        selectedTable.value = t;
        orderType.value = 'dine_in';
    }
    showTableModal.value = false;
};

const showShiftModal = ref(false);
const showEndShiftModal = ref(false);
const showPettyCashModal = ref(false);
const showTableModal = ref(false);
const showOptionModal = ref(false);
const showPaymentModal = ref(false);
const showMobileCart = ref(false);
const currentMenuForOptions = ref(null);
const lastOrderId = ref(null);
const searchQuery = ref('');
const showPrintModal = ref(false);
const showPrinterSettingsModal = ref(false);

const fetchData = async (force = false) => {
    try {
        if (!posStore.hasLoaded) {
            isLoading.value = true;
        }
        await posStore.fetchPosData(force);
        
        if (!posStore.activeShift) {
            showShiftModal.value = true;
        }

        if (categories.value.length > 0 && !activeCategoryId.value) {
            activeCategoryId.value = categories.value[0].id;
        }
    } catch (e) {
        console.error("Failed to fetch POS data", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchData(false);
});

// Computed
const lastOrder = computed(() => {
    if (lastOrderId.value) {
        const found = todayOrders.value?.find(o => o.id === lastOrderId.value);
        if (found) return found;
    }
    return (todayOrders.value && todayOrders.value.length > 0) ? todayOrders.value[0] : null;
});

const filteredMenus = computed(() => {
    let list = menus.value;
    if (activeCategoryId.value) {
        list = list.filter(m => m.categoryId === activeCategoryId.value || m.category_id === activeCategoryId.value);
    }
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    return list;
});

const cartTotal = computed(() => {
    return cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
});

const cartItemCount = computed(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
});

// Cart Actions
const addToCart = (product) => {
    const optionIds = (product.options || []).map(o => o.id).sort().join(',');
    const itemKey = `${product.menu.id}-${optionIds}`;

    const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({
            ...product,
            itemKey: itemKey,
            quantity: 1,
            id: Date.now()
        });
    }
};

const removeFromCart = (index) => {
    cart.splice(index, 1);
};

const updateQuantity = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    }
};

// Menu Actions
const handleMenuClick = (menu) => {
    const groups = menu?.menuOptionGroups || menu?.menu_option_groups || [];
    if (groups.length > 0) {
        currentMenuForOptions.value = menu;
        showOptionModal.value = true;
    } else {
        addToCart({
            menu: menu,
            options: [],
            finalPrice: parseFloat(menu.basePrice || menu.base_price || 0)
        });
    }
};

// Order Submission
const isProcessingOrder = ref(false);

const handlePaymentSubmit = async (paymentData) => {
    if (!activeShift.value) return;
    
    isProcessingOrder.value = true;
    try {
        const payload = {
            shift_id: activeShift.value?.id,
            order_type: orderType.value,
            cafe_table_id: selectedTable.value?.id || null,
            status: paymentData.status,
            items: cart.map(item => ({
                menu_id: item.menu.id,
                quantity: item.quantity,
                unit_price: item.finalPrice,
                notes: item.notes,
                options: item.options.map(opt => ({ id: opt.id }))
            })),
            payment_method: paymentData.payment_method,
            payment_amount: paymentData.payment_amount,
            notes: ''
        };

        const res = await api.post('/pos/orders', payload);
        const newOrder = res.data.order;
        
        cart.length = 0;
        selectedTable.value = null;
        orderType.value = 'dine_in';
        showPaymentModal.value = false;
        showMobileCart.value = false;
        
        // Refresh data
        await fetchData(true);

        lastOrderId.value = newOrder.id;

        // Direct 0-Click ESC/POS Printing if Thermal Printer is connected via USB/Bluetooth
        if (PrinterService.getConnectedDevice()) {
            try {
                await PrinterService.printOrder(newOrder, 'customer');
            } catch (err) {
                console.warn("Direct printer error, falling back to modal:", err);
                showPrintModal.value = true;
            }
        } else {
            showPrintModal.value = true;
        }

    } catch (e) {
        console.error("Order submission failed", e);
        alert(e.response?.data?.message || 'Gagal memproses pesanan');
    } finally {
        isProcessingOrder.value = false;
    }
};

const openPayment = () => {
    if (cart.length === 0) return;
    if (orderType.value === 'dine_in' && !selectedTable.value) {
        showTableModal.value = true;
        return;
    }
    showPaymentModal.value = true;
};

// Printing Logic
const handleManualPrint = async (order) => {
    if (PrinterService.getConnectedDevice()) {
        await PrinterService.printOrder(order, 'customer');
    } else {
        showPrintModal.value = true;
    }
};
</script>

<template>

        <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-[#F8F9FD] h-full">
            <div class="w-10 h-10 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
        </div>

        <div v-else class="h-full flex overflow-hidden relative bg-white border-t border-slate-100">
            <!-- COLUMN 1: Sidebar (Compact left sidebar navigasi) -->
            <PosSidebar 
                :activeShift="activeShift"
                @open-petty-cash="showPettyCashModal = true"
                @open-end-shift="showEndShiftModal = true"
                @open-print="showPrintModal = true"
                @open-printer-settings="showPrinterSettingsModal = true"
            />
                
            <!-- COLUMN 2: Menus & Categories (Center Content) -->
            <div class="flex-1 overflow-y-auto p-6 lg:p-8 pb-24 lg:pb-8 bg-[#F8F9FD] flex flex-col gap-8 no-scrollbar">
                
                <!-- Search & View Mode Toggle Bar -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <!-- Search input -->
                    <div class="relative w-full max-w-md">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari nama menu..." 
                            class="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-3 text-sm font-bold focus:bg-slate-50 focus:ring-4 focus:ring-amber-600/10 transition-all shadow-sm outline-none"
                        >
                    </div>

                    <!-- View Mode Toggle Switch (Gambar vs Ringkas) -->
                    <div class="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm shrink-0 self-start sm:self-auto">
                        <button 
                            @click="toggleShowImages(true)" 
                            :class="showMenuImages ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'" 
                            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Tampilkan Gambar Menu"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span>Dengan Gambar</span>
                        </button>
                        <button 
                            @click="toggleShowImages(false)" 
                            :class="!showMenuImages ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'" 
                            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Sembunyikan Gambar (Tampilan Ringkas)"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            <span>Tanpa Gambar</span>
                        </button>
                    </div>
                </div>

                <!-- Premium Category Selector (Horizontal card row) -->
                <div>
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Kategori</h3>
                    
                    <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        <button 
                            @click="activeCategoryId = null"
                            :class="!activeCategoryId ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'"
                            class="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-[1.8rem] transition-all duration-300 border cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                            <span class="text-[9px] font-black uppercase tracking-widest text-center">Semua</span>
                        </button>

                        <button 
                            v-for="cat in categories" 
                            :key="cat.id"
                            @click="activeCategoryId = cat.id"
                            :class="activeCategoryId === cat.id ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'"
                            class="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-[1.8rem] transition-all duration-300 border cursor-pointer"
                        >
                            <!-- 1. Coffee & Espresso -->
                            <svg 
                                v-if="cat.name.toLowerCase().includes('kopi') || cat.name.toLowerCase().includes('espresso') || cat.name.toLowerCase().includes('coffee')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                            </svg>
                            
                            <!-- 2. Juice -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('jus') || cat.name.toLowerCase().includes('juice')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M6 4h12l-1.5 15a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6 4z"/><line x1="14" y1="4" x2="16" y2="1"/><line x1="6" y1="9" x2="18" y2="9"/>
                            </svg>
                            
                            <!-- 3. Float -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('float')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M8 10a4 4 0 0 1 8 0v1H8v-1z"/><path d="M6 11h12l-1 9a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8l-1-9z"/><circle cx="12" cy="5" r="2"/>
                            </svg>

                            <!-- 4. Cold Drink / Cold -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('cold') || cat.name.toLowerCase().includes('dingin') || cat.name.toLowerCase().includes('es ')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M7 6h10l-1.2 14a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 6z"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="14" y1="2" x2="11" y2="6"/>
                            </svg>

                            <!-- 5. Double Drink Topping / Topping -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('topping')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M6 7h12l-1.2 13a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7z"/><line x1="5" y1="7" x2="19" y2="7"/><circle cx="10" cy="14" r="1" fill="currentColor"/><circle cx="14" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/>
                            </svg>

                            <!-- 6. Varian Roti / Toast -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('roti') || cat.name.toLowerCase().includes('bread') || cat.name.toLowerCase().includes('toast')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M18 20H6a2 2 0 0 1-2-2V9a5 5 0 0 1 8-3.9A5 5 0 0 1 20 9v9a2 2 0 0 1-2 2z"/><path d="M6 10h12"/>
                            </svg>
                            
                            <!-- 7. Snack / Cemilan -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('snack') || cat.name.toLowerCase().includes('cemilan')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M5 9l2 12h10l2-12H5z"/><path d="M8 9V4M12 9V3M16 9V4"/>
                            </svg>

                            <!-- 8. Makanan Berat / Main Dish -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('makan') || cat.name.toLowerCase().includes('food') || cat.name.toLowerCase().includes('utama')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2z"/><path d="M19 17v5"/>
                            </svg>

                            <!-- 9. Desserts / Kue -->
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('dessert') || cat.name.toLowerCase().includes('kue') || cat.name.toLowerCase().includes('cake')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <path d="M20 21H4a1 1 0 0 1-1-1v-5l9-8 10 5v8a1 1 0 0 1-1 1z"/><path d="M3 15h19"/>
                            </svg>
                            
                            <!-- Default Fallback -->
                            <svg 
                                v-else 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" class="mb-1.5 shrink-0"
                            >
                                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                            </svg>

                            <span class="text-[9px] font-black uppercase tracking-widest text-center line-clamp-1 px-1">{{ cat.name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Special Menu Section -->
                <div>
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Daftar Menu Kasir</h3>
                        <span class="text-xs font-bold text-slate-400">({{ filteredMenus.length }} Menu)</span>
                    </div>
                    
                    <div v-if="filteredMenus.length > 0">
                        <!-- MODE 1: GAMBAR (Grid Kartu Bergambar) -->
                        <div v-if="showMenuImages" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div 
                                v-for="menu in filteredMenus" 
                                :key="menu.id"
                                class="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:border-amber-500 hover:shadow-xl hover:shadow-amber-900/5 flex flex-col justify-between p-4"
                            >
                                 <div class="aspect-square relative overflow-hidden rounded-[1.5rem] bg-slate-50 mb-4">
                                     <img v-if="menu.imagePath || menu.image_path" :src="'/storage/' + (menu.imagePath || menu.image_path)" alt="Menu" class="w-full h-full object-cover" />
                                     <div v-else class="w-full h-full flex items-center justify-center text-slate-200">
                                         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                     </div>
                                     <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
                                         <span class="text-[10px] font-black text-amber-700 tracking-tighter font-jakarta">Rp {{ parseFloat(menu.basePrice || menu.base_price).toLocaleString('id-ID') }}</span>
                                     </div>
                                 </div>
                                
                                <div>
                                    <h3 class="text-xs font-black text-slate-800 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">{{ menu.name }}</h3>
                                    <p class="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ menu.category?.name }}</p>
                                </div>

                                <button 
                                    @click="handleMenuClick(menu)"
                                    class="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 shadow-md shadow-amber-600/10 cursor-pointer"
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    ADD
                                </button>
                            </div>
                        </div>

                        <!-- MODE 2: TANPA GAMBAR (Grid Ringkas Teks untuk Kasir Cepat) -->
                        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                            <div 
                                v-for="menu in filteredMenus" 
                                :key="menu.id"
                                @click="handleMenuClick(menu)"
                                class="bg-white border border-slate-200/80 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer group active:scale-95 min-h-[110px]"
                            >
                                <div>
                                    <span class="inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 mb-1.5">
                                        {{ menu.category?.name || 'Menu' }}
                                    </span>
                                    <h4 class="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight">
                                        {{ menu.name }}
                                    </h4>
                                </div>
                                <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                                    <span class="text-xs font-black text-amber-700 font-jakarta">
                                        Rp {{ parseFloat(menu.basePrice || menu.base_price).toLocaleString('id-ID') }}
                                    </span>
                                    <span class="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                                        +
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                        <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-400"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <p class="text-xs font-bold text-slate-400">Tidak ada menu yang sesuai pencarian</p>
                    </div>
                </div>
            </div>

            <!-- COLUMN 3: Cart (Right Sidebar) - Hidden on Mobile, shown on LG -->
            <div class="hidden lg:flex w-[400px] bg-white border-l border-slate-100 flex-col shrink-0 z-40 relative h-full">
                <CartPanel 
                    :cart="cart" 
                    :selected-table="selectedTable" 
                    :order-type="orderType"
                    :cart-total="cartTotal" 
                    @open-table="showTableModal = true"
                    @change-type="handleOrderTypeChange"
                    @clear="cart.length = 0"
                    @update-qty="updateQuantity"
                    @remove="removeFromCart"
                    @pay="openPayment"
                    :processing="isProcessingOrder"
                />
            </div>

            <!-- Mobile Bottom Bar & Drawer -->
            <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <button @click="showMobileCart = true" class="flex items-center gap-4 text-left">
                    <div class="relative">
                        <div class="bg-amber-50 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center border border-amber-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        </div>
                        <span class="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">{{ cartItemCount }}</span>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        <p class="text-lg font-black text-slate-900 leading-none font-jakarta">Rp {{ cartTotal.toLocaleString('id-ID') }}</p>
                    </div>
                </button>
                <button 
                    @click="openPayment"
                    :disabled="cart.length === 0"
                    class="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-amber-600/10"
                >
                    Checkout
                </button>
            </div>

            <!-- Mobile Cart Drawer -->
            <div v-if="showMobileCart" class="lg:hidden fixed inset-0 z-[70]">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showMobileCart = false"></div>
                <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] border-t border-slate-100 h-[90vh] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div class="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-6 mb-2 shrink-0"></div>
                    <CartPanel 
                        :cart="cart" 
                        :selected-table="selectedTable" 
                        :order-type="orderType"
                        :cart-total="cartTotal" 
                        @open-table="showTableModal = true"
                        @change-type="handleOrderTypeChange"
                        @clear="cart.length = 0"
                        @update-qty="updateQuantity"
                        @remove="removeFromCart"
                        @pay="openPayment"
                        :processing="isProcessingOrder"
                        @close="showMobileCart = false"
                    />
                </div>
            </div>
        </div>

        <!-- Modals -->
        <ShiftModal :show="showShiftModal" @success="showShiftModal = false; fetchData(true);" />
        <EndShiftModal :show="showEndShiftModal" :active-shift="activeShift" @close="showEndShiftModal = false" @success="showEndShiftModal = false; fetchData(true);" />
        <PettyCashModal :show="showPettyCashModal" @close="showPettyCashModal = false" @success="showPettyCashModal = false; fetchData(true);" />

        <TableSelectionModal :show="showTableModal" :tables="tables" :selected-table-id="selectedTable?.id" @close="showTableModal = false" @select="handleTableSelect" />
        <OptionSelectionModal :show="showOptionModal" :menu="currentMenuForOptions" @close="showOptionModal = false" @add="addToCart" />
        <PaymentModal :show="showPaymentModal" :total="cartTotal" :order-type="orderType" :processing="isProcessingOrder" @close="showPaymentModal = false" @submit="handlePaymentSubmit" />
        <PrintReceiptModal :show="showPrintModal" :today-orders="todayOrders" :last-order="lastOrder" @close="showPrintModal = false" />
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
