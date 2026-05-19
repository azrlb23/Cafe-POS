<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    activeShift: Object,
});

defineEmits(['open-petty-cash', 'open-end-shift', 'open-print']);
</script>

<template>
    <aside class="w-[80px] bg-white border-r border-slate-100 flex flex-col items-center py-6 shrink-0 h-full z-40">
        <!-- Logo -->
        <div class="mb-8">
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-700">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
            </div>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 flex flex-col items-center gap-1 w-full px-2">
            <!-- Menu (Active) -->
            <Link 
                :href="route('pos')"
                :class="route().current('pos') && !route().current('pos.history') && !route().current('pos.active-orders') ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Menu</span>
            </Link>

            <!-- Pesanan (Active Orders) -->
            <Link 
                :href="route('pos.active-orders')"
                :class="route().current('pos.active-orders') ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Pesanan</span>
            </Link>

            <!-- History -->
            <Link 
                :href="route('pos.history')"
                :class="route().current('pos.history') ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Riwayat</span>
            </Link>

            <!-- Cetak -->
            <button 
                @click="$emit('open-print')"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Cetak</span>
            </button>

            <!-- Petty Cash -->
            <button 
                v-if="activeShift"
                @click="$emit('open-petty-cash')"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Kas</span>
            </button>

            <!-- End Shift -->
            <button 
                v-if="activeShift"
                @click="$emit('open-end-shift')"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Tutup</span>
            </button>
        </nav>

        <!-- Logout -->
        <div class="mt-auto pt-4 border-t border-slate-50 w-full px-2">
            <Link 
                :href="route('logout')" 
                method="post" 
                as="button"
                class="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Keluar</span>
            </Link>
        </div>
    </aside>
</template>
