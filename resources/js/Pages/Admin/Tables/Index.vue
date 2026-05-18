<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    tables: Array
});

const selectedTable = ref(null);
const isModalOpen = ref(false);

const openTableDetails = (table) => {
    if (table.active_order) {
        selectedTable.value = table;
        isModalOpen.value = true;
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
};

const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
</script>

<template>
    <Head title="Manajemen Meja" />

    <AuthenticatedLayout>
        <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in">
                <div>
                    <h2 class="text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Layout <span class="text-amber-600 italic">Meja Cafe</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Pantau okupansi meja pelanggan, status pembayaran, dan pesanan aktif secara real-time di Denjavas Cafe.
                    </p>
                    <div class="flex items-center gap-3 mt-3">
                        <span class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Total Meja: {{ tables.length }} Meja
                        </span>
                    </div>
                </div>
                
                <!-- Status Indicators -->
                <div class="flex items-center gap-8 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tersedia ({{ tables.filter(t => t.status === 'available').length }})</span>
                    </div>
                    <div class="w-px h-4 bg-slate-100"></div>
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20 animate-pulse"></div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terisi ({{ tables.filter(t => t.status !== 'available').length }})</span>
                    </div>
                </div>
            </div>
            <!-- Table Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 delay-100">
                <div 
                    v-for="table in tables" 
                    :key="table.id"
                    @click="openTableDetails(table)"
                    :class="[
                        'relative rounded-[2.5rem] p-6 flex flex-col justify-between transition-all duration-500 border-2 cursor-pointer group active:scale-95 min-h-[220px]',
                        table.status === 'available' 
                            ? 'bg-white border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/5' 
                            : 'bg-amber-50/40 border-amber-100 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/5'
                    ]"
                >
                    <!-- Top Section: Table Number & Status Indicator -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-xs font-black text-slate-300 group-hover:text-amber-500 transition-colors uppercase tracking-[0.2em]">
                            #{{ String(table.number).padStart(2, '0') }}
                        </span>
                        
                        <!-- Status Badge -->
                        <span 
                            :class="[
                                'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm',
                                table.status === 'available' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-amber-100 text-amber-800 border-amber-200/60 animate-pulse'
                            ]"
                        >
                            {{ table.status === 'available' ? 'Tersedia' : 'Terisi' }}
                        </span>
                    </div>

                    <!-- Center Section: Elegant Table Branding -->
                    <div class="flex flex-col items-center my-2">
                        <!-- Table Number Styled in Serif -->
                        <h3 class="text-3xl font-serif font-black text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                            Meja {{ table.number }}
                        </h3>
                        
                        <!-- Minimal Visual Table / Chair Representation -->
                        <div class="mt-2 text-slate-400 group-hover:scale-110 transition-transform duration-500">
                            <svg v-if="table.status === 'available'" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-emerald-500/80">
                                <path d="M3 10h18v2H3zm3 2h12v7H6zm-3-5h18v3H3z" />
                                <circle cx="12" cy="5" r="1.5" />
                            </svg>
                            <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-amber-600">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            </svg>
                        </div>
                    </div>

                    <!-- Bottom Section: Dynamic Order Info or Status Hint -->
                    <div class="mt-4 pt-4 border-t border-dashed border-slate-100">
                        <div v-if="table.active_order" class="flex flex-col items-center text-center">
                            <span class="text-xs font-black text-amber-600">
                                Rp {{ formatPrice(table.active_order.total) }}
                            </span>
                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Kasir: {{ table.active_order.user.name.split(' ')[0] }}
                            </span>
                        </div>
                        <div v-else class="text-center">
                            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                Siap Digunakan
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Detail Modal -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="isModalOpen = false"></div>

                <!-- Modal Content -->
                <div class="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div class="p-10">
                        <div class="flex justify-between items-start mb-10">
                            <div>
                                <h3 class="text-3xl font-serif font-black text-slate-900 mb-2">Meja {{ selectedTable.number }}</h3>
                                <div class="flex items-center gap-2">
                                    <span class="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                                        Occupied
                                    </span>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        #{{ selectedTable.active_order.order_number }}
                                    </span>
                                </div>
                            </div>
                            <button 
                                @click="isModalOpen = false"
                                class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>

                        <!-- Cashier Info -->
                        <div class="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8">
                            <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                                {{ getInitials(selectedTable.active_order.user.name) }}
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Kasir Bertugas</p>
                                <p class="text-lg font-bold text-slate-900">{{ selectedTable.active_order.user.name }}</p>
                            </div>
                        </div>

                        <!-- Order Items -->
                        <div class="space-y-4 mb-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Pesanan Aktif</p>
                            <div v-for="item in selectedTable.active_order.order_items" :key="item.id" class="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                                        {{ item.quantity }}x
                                    </div>
                                    <span class="text-sm font-bold text-slate-900">{{ item.menu.name }}</span>
                                </div>
                                <span class="text-sm font-black text-slate-900">Rp {{ formatPrice(item.subtotal) }}</span>
                            </div>
                        </div>

                        <!-- Footer Total -->
                        <div class="flex justify-between items-center pt-8 border-t border-slate-100">
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Sementara</p>
                                <p class="text-3xl font-serif font-black text-amber-600">Rp {{ formatPrice(selectedTable.active_order.total) }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                <p class="text-sm font-black text-rose-500 uppercase tracking-widest">{{ selectedTable.active_order.status }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </AuthenticatedLayout>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
</style>
