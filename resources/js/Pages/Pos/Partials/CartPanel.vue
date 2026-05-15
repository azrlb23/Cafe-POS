<script setup>
defineProps(['cart', 'selectedTable', 'cartTotal', 'processing']);
defineEmits(['open-table', 'clear', 'update-qty', 'remove', 'pay', 'close']);
</script>

<template>
    <div class="h-full flex flex-col overflow-hidden bg-white">
        <!-- Header -->
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 class="text-lg font-serif font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <svg class="text-amber-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Pesanan
            </h2>
            <div class="flex gap-4">
                <button @click="$emit('clear')" class="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors">Reset</button>
                <button @click="$emit('close')" class="lg:hidden text-slate-400 p-1 hover:text-slate-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>

        <!-- Table Selection -->
        <div class="p-6 border-b border-slate-200">
            <button @click="$emit('open-table')" :class="selectedTable ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'" class="w-full border-2 border-dashed rounded-2xl py-4 px-6 flex items-center justify-between transition-all active:scale-[0.98]">
                <div class="flex items-center gap-4">
                    <div :class="selectedTable ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'" class="w-10 h-10 rounded-xl flex items-center justify-center font-black">
                        <span v-if="selectedTable">{{ selectedTable.id ? selectedTable.number : 'TA' }}</span>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Lokasi / Meja</p>
                        <p :class="selectedTable ? 'text-slate-900' : 'text-slate-400'" class="text-sm font-black uppercase">{{ selectedTable ? (selectedTable.id ? 'Meja ' + selectedTable.number : 'TAKE AWAY') : 'Pilih Meja...' }}</p>
                    </div>
                </div>
                <svg class="text-slate-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                <svg class="mb-4 text-slate-300" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <p class="text-xs font-black uppercase tracking-widest text-center">Belum ada item.</p>
            </div>

            <div v-for="(item, index) in cart" :key="item.id" class="group relative flex flex-col gap-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1 pr-4">
                        <h4 class="text-sm font-black text-slate-900 leading-tight">{{ item.menu.name }}</h4>
                        <div v-if="item.options.length > 0" class="flex flex-wrap gap-1 mt-2">
                            <span v-for="opt in item.options" :key="opt.id" class="text-[9px] font-bold text-amber-700 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {{ opt.name }}
                            </span>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-slate-900">Rp {{ (item.finalPrice * item.quantity).toLocaleString('id-ID') }}</span>
                </div>
                
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div class="flex items-center bg-slate-100 rounded-lg p-1">
                        <button @click="$emit('update-qty', index, -1)" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-white rounded-md transition-all font-bold">-</button>
                        <span class="w-8 text-center text-xs font-black">{{ item.quantity }}</span>
                        <button @click="$emit('update-qty', index, 1)" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-white rounded-md transition-all font-bold">+</button>
                    </div>
                    <button @click="$emit('remove', index)" class="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-all px-3 py-2 rounded-lg hover:bg-red-50">Hapus</button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-200 space-y-6 shrink-0 pb-10 lg:pb-6 bg-white">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subtotal</span>
                <span class="text-2xl font-black text-slate-900">Rp {{ cartTotal.toLocaleString('id-ID') }}</span>
            </div>
            <button @click="$emit('pay')" :disabled="cart.length === 0 || processing" class="w-full bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-amber-500">
                {{ processing ? 'Memproses...' : 'Pembayaran' }}
            </button>
        </div>
    </div>
</template>
