<script setup>
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div class="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex justify-center lg:justify-end relative font-sans overflow-x-hidden">
        
        <!-- Mobile/Tablet Background (Hidden on Desktop) -->
        <div class="absolute inset-0 z-0 pointer-events-none flex justify-center lg:hidden opacity-30">
            <div class="w-full max-w-2xl relative h-[40vh]">
                <div class="absolute inset-0 bg-gradient-to-b from-amber-100/50 to-transparent"></div>
            </div>
        </div>

        <!-- Desktop Background (Hidden on Mobile/Tablet) -->
        <div class="hidden lg:block fixed inset-0 w-[60%] xl:w-[65%] h-screen z-0 bg-white">
            <!-- Pattern or Subtle Image -->
            <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-50"></div>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center p-20">
                <div class="max-w-xl text-center">
                    <div class="w-24 h-24 bg-amber-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-amber-500/10">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                            <line x1="6" y1="2" x2="6" y2="4"></line>
                            <line x1="10" y1="2" x2="10" y2="4"></line>
                            <line x1="14" y1="2" x2="14" y2="4"></line>
                        </svg>
                    </div>
                    <h2 class="text-6xl font-serif font-black text-[#1C1917] mb-8 leading-tight tracking-tight">
                        Authentic <span class="text-[#D97706]">Coffee</span> Experience.
                    </h2>
                    <p class="text-[#78716C] text-xl leading-relaxed font-medium">
                        Denjavas Café POS — Solusi manajemen kasir modern yang intuitif dan bertenaga untuk bisnis kuliner Anda.
                    </p>
                </div>
            </div>
            
            <!-- Bottom Accent -->
            <div class="absolute bottom-12 left-12 flex items-center gap-4">
                <div class="w-12 h-0.5 bg-[#D97706]"></div>
                <span class="text-[10px] font-black uppercase tracking-[0.4em] text-[#A8A29E]">Denjavas Café Ecosystem</span>
            </div>
        </div>

        <!-- Content Container (Form Area) -->
        <div class="relative z-10 w-full lg:w-[40%] xl:w-[35%] px-6 md:px-12 py-12 flex flex-col min-h-screen bg-white lg:shadow-[-20px_0_60px_rgba(0,0,0,0.03)] justify-center">
            <!-- Header Logo Area -->
            <div class="flex flex-col items-center mb-12">
                <Link href="/" class="group flex flex-col items-center">
                    <h1 class="text-3xl font-serif font-black tracking-tighter text-[#1C1917] group-hover:text-[#D97706] transition-colors">
                        Denjavas<span class="text-[#D97706]">.</span>
                    </h1>
                    <div class="h-1 w-8 bg-amber-500 rounded-full mt-1 transform group-hover:w-12 transition-all"></div>
                </Link>
            </div>

            <!-- Page Content (Slot) -->
            <div class="w-full max-w-sm mx-auto">
                <slot />
            </div>

            <!-- Footer Footer -->
            <div class="mt-auto pt-10 text-center">
                <p class="text-xs text-[#A8A29E] font-medium uppercase tracking-widest">
                    &copy; 2024 Denjavas Café POS
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');

.font-sans {
    font-family: 'Plus Jakarta Sans', sans-serif;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}
</style>
