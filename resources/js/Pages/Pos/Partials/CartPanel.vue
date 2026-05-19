<script setup>
import { computed } from 'vue';

const props = defineProps({
    cart: Array,
    selectedTable: Object,
    orderType: String, // 'dine_in' or 'takeaway'
    cartTotal: Number,
    processing: Boolean,
});

const emit = defineEmits([
    'open-table', 
    'change-type', 
    'clear', 
    'update-qty', 
    'remove', 
    'pay', 
    'close'
]);

// Format Date to Match Target Image Layout
const formattedDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();
});

const formattedTime = computed(() => {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
});
</script>

<template>
    <div class="h-full flex flex-col overflow-hidden bg-[#FCFAF7]">
        <!-- Header: Order Details Title -->
        <div class="p-6 border-b border-stone-150 flex justify-between items-start bg-[#FCFAF7]">
            <div>
                <h2 class="text-lg font-serif font-black text-stone-850 tracking-tight leading-tight">Order Details</h2>
                <div class="flex flex-col gap-1 mt-1 text-[10px] font-black uppercase tracking-widest text-stone-400">
                    <p class="text-stone-800">
                        {{ orderType === 'takeaway' ? 'TAKE AWAY' : (selectedTable ? 'Meja ' + selectedTable.number : 'PILIH MEJA...') }}
                    </p>
                    <p>{{ formattedDate }} <span class="text-stone-300 mx-1">•</span> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="inline mb-0.5 mr-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 15"/></svg> {{ formattedTime }}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <button 
                    @click="$emit('clear')" 
                    class="text-[9px] font-black text-stone-400 hover:text-red-500 uppercase tracking-widest transition-colors bg-white px-3 py-1.5 rounded-xl border border-stone-200"
                >
                    Reset
                </button>
                <button @click="$emit('close')" class="lg:hidden text-stone-400 p-1 hover:text-stone-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>

        <!-- Order Type Tabs Inline (Dine In / Takeout) -->
        <div class="px-6 py-4 border-b border-stone-150 flex gap-3 bg-[#FCFAF7]">
            <button 
                @click="$emit('change-type', 'dine_in'); $emit('open-table')" 
                :class="orderType === 'dine_in' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'"
                class="flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2z"/><path d="M19 17v5"/></svg>
                Dine In
            </button>
            <button 
                @click="$emit('change-type', 'takeaway')" 
                :class="orderType === 'takeaway' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 border-transparent' : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'"
                class="flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Takeout
            </button>
        </div>

        <!-- Order / Table Info Bar -->
        <div class="px-6 py-3.5 bg-stone-100/50 border-b border-stone-150 text-[10px] font-black text-stone-500 uppercase tracking-widest flex justify-between items-center">
            <span>Pesanan Aktif</span>
            <span class="text-amber-750 font-mono tracking-normal font-bold">
                {{ selectedTable ? 'DINE IN' : 'TAKE AWAY' }}
            </span>
        </div>

        <!-- Cart Items (List) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/20 no-scrollbar">
            <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-stone-400 py-16">
                <div class="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-stone-300"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </div>
                <p class="text-[9px] font-black uppercase tracking-widest text-stone-400">Belum ada item pesanan</p>
            </div>

            <div v-for="(item, index) in cart" :key="item.id" class="bg-white p-4 rounded-[1.8rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-grow min-w-0">
                        <!-- Category Badge based on menu category -->
                        <span class="inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-2"
                              :class="item.menu.category?.name.toLowerCase().includes('kopi') || item.menu.category?.name.toLowerCase().includes('minuman') ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'">
                            {{ item.menu.category?.name || 'Menu' }}
                        </span>
                        
                        <h4 class="text-xs font-serif font-black text-stone-850 leading-snug truncate">{{ item.menu.name }}</h4>
                        
                        <!-- Option Badges in Horizontal Pills -->
                        <div v-if="item.options.length > 0" class="flex flex-wrap gap-1 mt-2">
                            <span v-for="opt in item.options" :key="opt.id" class="text-[8px] font-black uppercase tracking-tighter bg-stone-50 text-stone-500 px-2 py-0.5 rounded-md border border-stone-150">
                                {{ opt.name }}
                            </span>
                        </div>
                    </div>

                    <div class="text-right shrink-0">
                        <span class="text-xs font-jakarta font-bold text-stone-850">Rp {{ (item.finalPrice * item.quantity).toLocaleString('id-ID') }}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between mt-4 pt-3 border-t border-stone-150">
                    <!-- Qty Stepper -->
                    <div class="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-0.5 shadow-inner">
                        <button @click="$emit('update-qty', index, -1)" class="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-amber-700 hover:bg-white rounded-lg transition-all font-black text-sm">-</button>
                        <span class="w-8 text-center text-xs font-black text-stone-800">{{ item.quantity }}</span>
                        <button @click="$emit('update-qty', index, 1)" class="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-amber-700 hover:bg-white rounded-lg transition-all font-black text-sm">+</button>
                    </div>

                    <div class="flex gap-2">
                        <button 
                            @click="item.showNote = !item.showNote" 
                            :class="item.notes ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-stone-500 hover:bg-stone-50 border-stone-200'"
                            class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all"
                        >
                            {{ item.notes ? 'Edit Note' : '+ Note' }}
                        </button>
                        <button @click="$emit('remove', index)" class="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-all px-3 py-1.5 rounded-xl hover:bg-red-50">Hapus</button>
                    </div>
                </div>

                <!-- Notes Input -->
                <div v-if="item.showNote" class="mt-3">
                    <textarea 
                        v-model="item.notes" 
                        placeholder="Contoh: Less sugar, extra pedas..." 
                        class="w-full bg-stone-50 border border-stone-200 rounded-xl text-[10px] p-3 focus:border-amber-500 focus:ring-0 outline-none resize-none transition-all shadow-inner"
                        rows="2"
                    ></textarea>
                </div>
            </div>
        </div>

        <!-- Detailed Financial Summary & Print/Checkout Actions -->
        <div class="p-6 border-t border-stone-150 space-y-4 shrink-0 bg-[#FCFAF7]">
            <div class="space-y-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <div class="flex justify-between">
                    <span>Sub Total</span>
                    <span class="text-stone-750 font-jakarta">Rp {{ cartTotal.toLocaleString('id-ID') }}</span>
                </div>
                <div class="flex justify-between">
                    <span>Discount</span>
                    <span class="text-stone-750 font-jakarta">Rp 0</span>
                </div>
                <div class="flex justify-between">
                    <span>Service Charge</span>
                    <span class="text-stone-750 font-jakarta">Rp 0</span>
                </div>
                <div class="flex justify-between">
                    <span>Tax</span>
                    <span class="text-stone-750 font-jakarta">Rp 0</span>
                </div>
                
                <div class="border-t border-stone-150 my-3 pt-3 flex justify-between items-center text-sm font-black text-stone-850">
                    <span class="font-serif">Total</span>
                    <span class="text-amber-700 text-xl font-jakarta">Rp {{ cartTotal.toLocaleString('id-ID') }}</span>
                </div>
            </div>

            <!-- Big Checkout Button -->
            <div class="flex gap-3">
                <button 
                    @click="$emit('pay')" 
                    :disabled="cart.length === 0 || processing" 
                    class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md shadow-amber-600/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:bg-stone-300 disabled:text-stone-500 disabled:hover:scale-100 disabled:hover:bg-stone-300 flex items-center justify-center gap-2 relative z-20"
                >
                    <span class="font-jakarta">Bayar Sekarang Rp {{ cartTotal.toLocaleString('id-ID') }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
