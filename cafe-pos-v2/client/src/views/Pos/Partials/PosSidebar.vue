<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { usePosStore } from '@/stores/pos';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

defineProps({
    activeShift: Object,
});

defineEmits(['open-petty-cash', 'open-end-shift', 'open-print']);

const authStore = useAuthStore();
const posStore = usePosStore();
const router = useRouter();

const isMobileOpen = computed(() => posStore.isMobileSidebarOpen);
const user = computed(() => authStore.user);

const closeSidebar = () => {
    posStore.isMobileSidebarOpen = false;
};

const handleLogout = async () => {
    closeSidebar();
    await authStore.logout();
    router.push({ name: 'Login' });
};
</script>

<template>
    <!-- Backdrop Overlay (Mobile only) -->
    <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div 
            v-if="isMobileOpen" 
            class="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
            @click="closeSidebar"
        ></div>
    </Transition>

    <aside 
        :class="[
            'bg-white border-r border-slate-100 flex flex-col py-6 shrink-0 h-[calc(100vh-64px)] lg:h-full z-[90] transition-transform duration-300 ease-out',
            'fixed inset-y-16 left-0 w-[260px] lg:static lg:translate-x-0 lg:w-[260px]',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
    >
        <!-- Logo/Header inside sidebar -->
        <div class="px-6 mb-6 flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-700">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
            </div>
            <div>
                <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">POS Portal</h4>
                <span class="text-[9px] font-semibold text-slate-400">Denjavas Café</span>
            </div>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 flex flex-col gap-6 w-full px-4 overflow-y-auto no-scrollbar">
            <!-- Section: NAVIGASI -->
            <div class="space-y-2">
                <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigasi</p>
                
                <!-- Menu -->
                <router-link 
                    :to="{ name: 'Pos' }"
                    @click="closeSidebar"
                    :class="$route.name === 'Pos' ? 'bg-amber-50 text-amber-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold'"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                    <span>Menu POS</span>
                </router-link>

                <!-- Pesanan -->
                <router-link 
                    :to="{ name: 'PosActiveOrders' }"
                    @click="closeSidebar"
                    :class="$route.name === 'PosActiveOrders' ? 'bg-amber-50 text-amber-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold'"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Daftar Pesanan</span>
                </router-link>

                <!-- History -->
                <router-link 
                    :to="{ name: 'PosHistory' }"
                    @click="closeSidebar"
                    :class="$route.name === 'PosHistory' ? 'bg-amber-50 text-amber-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold'"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Riwayat Transaksi</span>
                </router-link>
            </div>

            <!-- Section: TINDAKAN KASIR -->
            <div class="space-y-2">
                <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kasir</p>

                <!-- Cetak -->
                <button 
                    @click="closeSidebar(); $emit('open-print');"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold transition-all duration-200 cursor-pointer text-left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    <span>Cetak Struk</span>
                </button>

                <!-- Petty Cash -->
                <button 
                    v-if="activeShift"
                    @click="closeSidebar(); $emit('open-petty-cash');"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold transition-all duration-200 cursor-pointer text-left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>Kas Keluar</span>
                </button>

                <!-- End Shift -->
                <button 
                    v-if="activeShift"
                    @click="closeSidebar(); $emit('open-end-shift');"
                    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] text-slate-500 hover:bg-red-50 hover:text-red-500 font-semibold transition-all duration-200 cursor-pointer text-left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                    <span>Tutup Shift</span>
                </button>
            </div>
        </nav>

        <!-- User Profile Card -->
        <div class="mt-auto p-4 border-t border-slate-50 w-full shrink-0">
            <div class="bg-slate-50 rounded-2xl p-4 flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-amber-100">
                        {{ user ? user.name.charAt(0) : 'K' }}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[13px] font-bold text-slate-800 leading-tight truncate w-24">{{ user ? user.name : 'Kasir' }}</span>
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ user ? user.role : 'kasir' }}</span>
                    </div>
                </div>
                <button @click="handleLogout" class="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>
        </div>
    </aside>
</template>
