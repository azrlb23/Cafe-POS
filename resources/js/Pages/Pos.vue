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

// Computed
const lastOrder = computed(() => {
    if (!lastOrderId.value) return null;
    return props.todayOrders.find(o => o.id === lastOrderId.value);
});
const filteredMenus = computed(() => {
    if (!activeCategoryId.value) return props.menus;
    return props.menus.filter(m => m.category_id === activeCategoryId.value);
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
    orderForm.cafe_table_id = selectedTable.value?.id || null;
    orderForm.order_type = selectedTable.value?.id ? 'dine_in' : 'takeaway';
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
            showPaymentModal.value = false;
            showMobileCart.value = false;
        }
    });
};

const openPayment = () => {
    if (cart.length === 0) return;
    if (!selectedTable.value) {
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
</script>

<template>
    <Head title="Point of Sale" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-serif font-bold text-[#292524] leading-tight">
                    POS <span class="text-amber-600">Kasir</span>
                </h2>
                <div class="flex items-center gap-6">
                    <div class="flex flex-col items-end">
                        <span class="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            {{ activeShift ? 'Shift Aktif' : 'Shift Belum Dibuka' }}
                        </span>
                        <div v-if="activeShift" class="flex flex-col items-end mt-1">
                            <span class="text-xs font-bold text-slate-900">
                                Kas di Laci: <span class="text-amber-600">Rp {{ Number(activeShift.running_balance).toLocaleString('id-ID') }}</span>
                            </span>
                            <span class="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                                Saldo Awal: Rp {{ Number(activeShift.opening_cash).toLocaleString('id-ID') }}
                            </span>
                        </div>
                    </div>
                    <button 
                        v-if="activeShift"
                        @click="showPettyCashModal = true"
                        class="bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-amber-100 flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Kas Keluar
                    </button>
                    <button 
                        v-if="activeShift"
                        @click="showEndShiftModal = true"
                        class="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100 flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                        Tutup Shift
                    </button>

                    <!-- Print Dropdown (Visible only after transaction) -->
                    <div v-if="lastOrderId" class="relative">
                        <button 
                            @click="showPrintDropdown = !showPrintDropdown"
                            class="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-100 flex items-center gap-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Opsi Cetak
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :class="{'rotate-180': showPrintDropdown}" class="transition-transform ml-1"><path d="M6 9l6 6 6-6"/></svg>
                        </button>

                        <!-- Dropdown Menu -->
                        <div v-if="showPrintDropdown" class="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                            <!-- Customer Receipt Group -->
                            <div class="px-5 py-3 border-b border-slate-50">
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Struk Customer</p>
                                <div class="flex gap-2">
                                    <button 
                                        @click="PrinterService.printCustomer(lastOrder); showPrintDropdown = false"
                                        class="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                        Cetak
                                    </button>
                                    <a 
                                        :href="route('pos.orders.print-pdf', { order: lastOrderId, type: 'customer' })"
                                        target="_blank"
                                        class="flex-1 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        PDF
                                    </a>
                                </div>
                            </div>

                            <!-- Cashier Receipt Group -->
                            <div class="px-5 py-3 border-b border-slate-50">
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Struk Kasir (Arsip)</p>
                                <div class="flex gap-2">
                                    <button 
                                        @click="PrinterService.printCashier(lastOrder); showPrintDropdown = false"
                                        class="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                        Cetak
                                    </button>
                                    <a 
                                        :href="route('pos.orders.print-pdf', { order: lastOrderId, type: 'cashier' })"
                                        target="_blank"
                                        class="flex-1 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        PDF
                                    </a>
                                </div>
                            </div>

                            <!-- Kitchen Receipt Group -->
                            <div class="px-5 py-3">
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Struk Dapur</p>
                                <div class="flex gap-2">
                                    <button 
                                        @click="PrinterService.printKitchen(lastOrder); showPrintDropdown = false"
                                        class="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                        Cetak
                                    </button>
                                    <a 
                                        :href="route('pos.orders.print-pdf', { order: lastOrderId, type: 'kitchen' })"
                                        target="_blank"
                                        class="flex-1 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div class="h-[calc(100vh-64px-113px)] flex overflow-hidden relative bg-white border-t border-slate-200">
                
                <!-- COLUMN 1: Categories (Sidebar) - Hidden on Mobile, shown on LG -->
                <div class="hidden lg:flex w-24 bg-white border-r border-slate-200 flex-col shrink-0 overflow-y-auto">
                    <button 
                        @click="activeCategoryId = null"
                        :class="!activeCategoryId ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'"
                        class="p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span class="text-[9px] font-black uppercase tracking-widest text-center">Semua</span>
                    </button>

                    <button 
                        v-for="cat in categories" 
                        :key="cat.id"
                        @click="activeCategoryId = cat.id"
                        :class="activeCategoryId === cat.id ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'"
                        class="p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 border-t border-slate-100"
                    >
                        <span class="text-[9px] font-black uppercase tracking-widest text-center line-clamp-2">{{ cat.name }}</span>
                    </button>
                </div>

                <!-- COLUMN 2: Menus (Center Grid) -->
                <div class="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 bg-slate-50/50">
                    <!-- Mobile Category Picker (Sticky Top) -->
                    <div class="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                        <button 
                            @click="activeCategoryId = null"
                            :class="!activeCategoryId ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'"
                            class="whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Semua
                        </button>
                        <button 
                            v-for="cat in categories" 
                            :key="cat.id"
                            @click="activeCategoryId = cat.id"
                            :class="activeCategoryId === cat.id ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'"
                            class="whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            {{ cat.name }}
                        </button>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-8">
                        <div 
                            v-for="menu in filteredMenus" 
                            :key="menu.id"
                            @click="handleMenuClick(menu)"
                            class="group bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer transition-all hover:border-amber-400 active:scale-95 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 flex flex-col"
                        >
                            <div class="aspect-square relative overflow-hidden bg-slate-50">
                                <img v-if="menu.image_path" :src="'/storage/' + menu.image_path" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div v-else class="w-full h-full flex items-center justify-center text-slate-200">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                                <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100">
                                    <span class="text-xs font-black text-amber-600 tracking-tighter">Rp {{ parseFloat(menu.base_price).toLocaleString('id-ID') }}</span>
                                </div>
                            </div>
                            <div class="p-4 lg:p-6 flex-1 flex flex-col justify-between">
                                <h3 class="text-sm font-black text-slate-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{{ menu.name }}</h3>
                                <div class="flex items-center gap-2 mt-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{{ menu.category?.name }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COLUMN 3: Cart (Right Sidebar) - Hidden on Mobile, shown on LG -->
                <div class="hidden lg:flex w-[400px] bg-white border-l border-slate-200 flex-col shrink-0 z-40 relative">
                    <CartPanel 
                        :cart="cart" 
                        :selected-table="selectedTable" 
                        :cart-total="cartTotal" 
                        @open-table="showTableModal = true"
                        @clear="cart.length = 0"
                        @update-qty="updateQuantity"
                        @remove="removeFromCart"
                        @pay="openPayment"
                        :processing="orderForm.processing"
                    />
                </div>

                <!-- Mobile Bottom Bar & Drawer -->
                <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <button @click="showMobileCart = true" class="flex items-center gap-4 text-left">
                        <div class="relative">
                            <div class="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center border border-amber-100">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            </div>
                            <span class="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">{{ cartItemCount }}</span>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p class="text-lg font-black text-slate-900 leading-none">Rp {{ cartTotal.toLocaleString('id-ID') }}</p>
                        </div>
                    </button>
                    <button 
                        @click="openPayment"
                        :disabled="cart.length === 0"
                        class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                    >
                        Checkout
                    </button>
                </div>

                <!-- Mobile Cart Drawer -->
                <div v-if="showMobileCart" class="lg:hidden fixed inset-0 z-[70]">
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showMobileCart = false"></div>
                    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] border-t border-slate-200 h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
                        <div class="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-6 mb-2 shrink-0"></div>
                        <CartPanel 
                            :cart="cart" 
                            :selected-table="selectedTable" 
                            :cart-total="cartTotal" 
                            @open-table="showTableModal = true"
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

        <TableSelectionModal :show="showTableModal" :tables="tables" :selected-table-id="selectedTable?.id" @close="showTableModal = false" @select="(t) => selectedTable = t" />
        <OptionSelectionModal :show="showOptionModal" :menu="currentMenuForOptions" @close="showOptionModal = false" @add="addToCart" />
        <PaymentModal :show="showPaymentModal" :total="cartTotal" :processing="orderForm.processing" @close="showPaymentModal = false" @submit="handlePaymentSubmit" />

    </AuthenticatedLayout>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>


