<script setup>
import { Link, router } from '@inertiajs/vue3';
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
    title: String,
    activeShift: Object
});

const currentTime = ref(new Date());
let timer;

onMounted(() => {
    timer = setInterval(() => {
        currentTime.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});

const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const logout = () => {
    router.post(route('logout'));
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col">
        <!-- POS Header -->
        <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-50">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span class="text-white font-black text-xl italic">D</span>
                    </div>
                    <div>
                        <h1 class="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Denjavas <span class="text-slate-900">POS</span></h1>
                        <p class="text-[10px] text-slate-500 font-medium tracking-widest">Beverage · Dessert · Nusantara</p>
                    </div>
                </div>
                
                <!-- Time Display -->
                <div class="hidden md:flex flex-col border-l border-slate-200 pl-6 h-8 justify-center">
                    <span class="text-sm font-bold text-slate-800 leading-none">{{ formatTime(currentTime) }}</span>
                    <span class="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">{{ formatDate(currentTime) }}</span>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <!-- User Info -->
                <div class="flex flex-col items-end mr-2">
                    <span class="text-xs font-bold text-slate-900 leading-none">{{ $page.props.auth.user.name }}</span>
                    <span class="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">
                        {{ activeShift ? 'Shift Active: ' + activeShift.opening_cash.toLocaleString('id-ID') : 'No Active Shift' }}
                    </span>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <button 
                        @click="logout"
                        class="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all border border-slate-200"
                        title="Logout"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content (Full height minus header) -->
        <main class="flex-1 overflow-hidden relative">
            <!-- Flash Messages -->
            <Transition
                enter-active-class="transform transition duration-500 ease-out"
                enter-from-class="translate-y-[-20px] opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transform transition duration-300 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="$page.props.flash && $page.props.flash.success" class="fixed top-20 right-6 z-[200] bg-white border-l-4 border-green-500 text-slate-900 px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl border border-slate-200">
                    <div class="bg-green-100 p-2 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <span class="font-bold tracking-wide">{{ $page.props.flash.success }}</span>
                </div>
            </Transition>

            <slot />
        </main>
    </div>
</template>

<style>
/* Custom Scrollbar for POS */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Base Styles */
body {
    overscroll-behavior-y: contain;
}

/* Touch optimizations */
button, a {
    touch-action: manipulation;
}
</style>
