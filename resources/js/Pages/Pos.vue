<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import ShiftModal from './Pos/Partials/ShiftModal.vue';
import EndShiftModal from './Pos/Partials/EndShiftModal.vue';
import TableSelectionModal from './Pos/Partials/TableSelectionModal.vue';
import OptionSelectionModal from './Pos/Partials/OptionSelectionModal.vue';
import PaymentModal from './Pos/Partials/PaymentModal.vue';
import CartPanel from './Pos/Partials/CartPanel.vue';
import PettyCashModal from './Pos/Partials/PettyCashModal.vue';
import PosSidebar from './Pos/Partials/PosSidebar.vue';
import PrintReceiptModal from './Pos/Partials/PrintReceiptModal.vue';
import { PrinterService } from '@/Services/PrinterService';
import { usePage } from '@inertiajs/vue3';
import { watch } from 'vue';

const props = defineProps({
    menus: Array,
    categories: Array,
    tables: Array,
    activeShift: Object,
    todayOrders: Array,
    todayPettyCash: Array,
});

// State
const activeCategoryId = ref(null);
const cart = reactive([]);
const selectedTable = ref(null);
const orderType = ref('dine_in'); // 'dine_in' or 'takeaway'

const handleOrderTypeChange = (type) => {
    orderType.value = type;
    if (type === 'takeaway') {
        selectedTable.value = null;
    }
};

const handleTableSelect = (t) => {
    selectedTable.value = t;
    orderType.value = 'dine_in';
    showTableModal.value = false;
};
const showShiftModal = ref(!props.activeShift);
const showEndShiftModal = ref(false);
const showPettyCashModal = ref(false);
const showTableModal = ref(false);
const showOptionModal = ref(false);
const showPaymentModal = ref(false);
const showMobileCart = ref(false);
const currentMenuForOptions = ref(null);
const lastOrderId = ref(null);
const showPrintDropdown = ref(false);
const searchQuery = ref('');
const showPrintModal = ref(false);

// Computed
const lastOrder = computed(() => {
    if (!lastOrderId.value) return null;
    return props.todayOrders.find(o => o.id === lastOrderId.value);
});
const filteredMenus = computed(() => {
    let list = props.menus;
    if (activeCategoryId.value) {
        list = list.filter(m => m.category_id === activeCategoryId.value);
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
    // product: { menu, options, finalPrice }
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
            finalPrice: parseFloat(menu.base_price || 0)
        });
    }
};

// Order Submission
const orderForm = useForm({
    shift_id: props.activeShift?.id,
    cafe_table_id: null,
    order_type: 'dine_in',
    items: [],
    payment_method: 'cash',
    payment_amount: 0,
    notes: ''
});

const handlePaymentSubmit = (paymentData) => {
    orderForm.shift_id = props.activeShift.id;
    orderForm.cafe_table_id = orderType.value === 'dine_in' ? (selectedTable.value?.id || null) : null;
    orderForm.order_type = orderType.value;
    orderForm.items = cart.map(item => ({
        menu_id: item.menu.id,
        quantity: item.quantity,
        notes: item.notes || null,
        options: item.options.map(o => ({ id: o.id }))
    }));
    orderForm.payment_method = paymentData.payment_method;
    orderForm.payment_amount = paymentData.payment_amount;

    orderForm.post(route('pos.orders'), {
        onSuccess: () => {
            cart.length = 0;
            selectedTable.value = null;
            orderType.value = 'dine_in';
            showPaymentModal.value = false;
            showMobileCart.value = false;
        }
    });
};

const openPayment = () => {
    if (cart.length === 0) return;
    if (orderType.value === 'dine_in' && !selectedTable.value) {
        showTableModal.value = true;
        return;
    }
    showPaymentModal.value = true;
};
onMounted(() => {
    if (props.categories.length > 0) {
        activeCategoryId.value = props.categories[0].id;
    }
});

// Printing Logic
const page = usePage();
watch(() => page.props.flash?.print_order, (newOrder) => {
    if (newOrder) {
        lastOrderId.value = newOrder.id;
        // Trigger sequence: Kitchen, then Cashier, then Customer (with delays to avoid browser cancellation)
        PrinterService.printKitchen(newOrder);
        
        setTimeout(() => {
            PrinterService.printCashier(newOrder);
        }, 1200); 

        setTimeout(() => {
            PrinterService.printCustomer(newOrder);
        }, 2400);
    }
});

const handleManualPrint = (order) => {
    PrinterService.printCustomer(order);
};

const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
</script>

<template>
    <Head title="Point of Sale" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center w-full">
                <!-- Search menu -->
                <div class="relative w-80">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Search menu..." 
                        class="w-full bg-slate-50 border-0 rounded-full pl-11 pr-4 py-2.5 text-xs font-bold focus:bg-slate-100 focus:ring-4 focus:ring-amber-600/5 transition-all shadow-inner"
                    >
                </div>

                <!-- Cashier and Printing Options -->
                <div class="flex items-center gap-6">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-black text-slate-800 leading-none">{{ $page.props.auth.user.name }}</p>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {{ activeShift ? 'Clocked in at ' + formatTime(activeShift.opened_at) : 'Offline' }}
                        </p>
                    </div>

                    <div class="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black font-serif text-sm shadow-md shadow-amber-600/10">
                        {{ $page.props.auth.user.name.charAt(0).toUpperCase() }}
                    </div>                </div>
            </div>
        </template>

        <div class="h-[calc(100vh-80px)] flex overflow-hidden relative bg-white border-t border-slate-100">
            <!-- COLUMN 1: Sidebar (Compact left sidebar navigasi) -->
            <PosSidebar 
                :activeShift="activeShift"
                @open-petty-cash="showPettyCashModal = true"
                @open-end-shift="showEndShiftModal = true"
                @open-print="showPrintModal = true"
            />
                
            <!-- COLUMN 2: Menus & Categories (Center Content) -->
            <div class="flex-1 overflow-y-auto p-6 lg:p-8 pb-24 lg:pb-8 bg-[#F8F9FD] flex flex-col gap-8 no-scrollbar">
                <!-- Premium Category Selector (Horizontal card row) -->
                <div>
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Category</h3>
                    
                    <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        <button 
                            @click="activeCategoryId = null"
                            :class="!activeCategoryId ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'"
                            class="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-[1.8rem] transition-all duration-300 border"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                            <span class="text-[9px] font-black uppercase tracking-widest text-center">Semua</span>
                        </button>

                        <button 
                            v-for="cat in categories" 
                            :key="cat.id"
                            @click="activeCategoryId = cat.id"
                            :class="activeCategoryId === cat.id ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'"
                            class="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-[1.8rem] transition-all duration-300 border"
                        >
                            <!-- Elegant SVG outline indicators based on category name instead of childish emojis -->
                            <svg 
                                v-if="cat.name.toLowerCase().includes('kopi') || cat.name.toLowerCase().includes('drink') || cat.name.toLowerCase().includes('minuman')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"
                            >
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                            </svg>
                            
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('makan') || cat.name.toLowerCase().includes('food') || cat.name.toLowerCase().includes('utama')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"
                            >
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2z"/><path d="M19 17v5"/>
                            </svg>
                            
                            <svg 
                                v-else-if="cat.name.toLowerCase().includes('snack') || cat.name.toLowerCase().includes('cemilan') || cat.name.toLowerCase().includes('dessert')" 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"
                            >
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            
                            <svg 
                                v-else 
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mb-1.5 shrink-0"
                            >
                                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                            </svg>

                            <span class="text-[9px] font-black uppercase tracking-widest text-center line-clamp-1 px-1">{{ cat.name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Special Menu Section -->
                <div>
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-6">Special Menu for you</h3>
                    
                    <div v-if="filteredMenus.length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div 
                            v-for="menu in filteredMenus" 
                            :key="menu.id"
                            class="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:border-amber-500 hover:shadow-xl hover:shadow-amber-900/5 flex flex-col justify-between p-4"
                        >
                            <div class="aspect-square relative overflow-hidden rounded-[1.5rem] bg-slate-50 mb-4">
                                <img v-if="menu.image_path" :src="'/storage/' + menu.image_path" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div v-else class="w-full h-full flex items-center justify-center text-slate-200">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                                <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
                                    <span class="text-[10px] font-black text-amber-700 tracking-tighter font-jakarta">Rp {{ parseFloat(menu.base_price).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="text-xs font-black text-slate-800 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">{{ menu.name }}</h3>
                                <p class="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ menu.category?.name }}</p>
                            </div>

                            <button 
                                @click="handleMenuClick(menu)"
                                class="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 shadow-md shadow-amber-600/10"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                ADD
                            </button>
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
                    :processing="orderForm.processing"
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
                        :processing="orderForm.processing"
                        @close="showMobileCart = false"
                    />
                </div>
            </div>
        </div>

        <!-- Modals -->
        <ShiftModal :show="showShiftModal" @success="showShiftModal = false" />
        <EndShiftModal :show="showEndShiftModal" :active-shift="activeShift" @close="showEndShiftModal = false" />
        <PettyCashModal :show="showPettyCashModal" @close="showPettyCashModal = false" />

        <TableSelectionModal :show="showTableModal" :tables="tables" :selected-table-id="selectedTable?.id" @close="showTableModal = false" @select="handleTableSelect" />
        <OptionSelectionModal :show="showOptionModal" :menu="currentMenuForOptions" @close="showOptionModal = false" @add="addToCart" />
        <PaymentModal :show="showPaymentModal" :total="cartTotal" :processing="orderForm.processing" @close="showPaymentModal = false" @submit="handlePaymentSubmit" />
        <PrintReceiptModal :show="showPrintModal" :today-orders="todayOrders" :last-order="lastOrder" @close="showPrintModal = false" />
    </AuthenticatedLayout>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>


