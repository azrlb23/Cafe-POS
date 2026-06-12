<script setup lang="ts">
</script>

<template>
    <div class="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex justify-center lg:justify-end relative font-sans overflow-x-hidden">
        
        <!-- Mobile/Tablet Background (Hidden on Desktop) with blur cover -->
        <div class="absolute inset-0 z-0 pointer-events-none lg:hidden">
            <img src="/landingpage/login_hero.png" class="w-full h-full object-cover filter blur-[6px] brightness-[0.8] opacity-[0.08]" alt="Background" />
            <div class="absolute inset-0 bg-gradient-to-b from-[#FAFAF9]/80 via-[#FAFAF9]/95 to-[#FAFAF9]"></div>
        </div>

        <!-- Desktop Background Image (Left Side Panel) -->
        <div class="hidden lg:block fixed inset-0 w-[60%] xl:w-[65%] h-screen z-0 overflow-hidden">
            <!-- Full Cover Background Image with Slow Zoom effect -->
            <img src="/landingpage/login_hero.png" class="absolute inset-0 w-full h-full object-cover bg-cover-image" alt="Denjavas Cafe" />
            
            <!-- Elegant Dark Warm Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#1C1917]/95 via-stone-900/50 to-stone-950/20 mix-blend-multiply"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C1917]/15"></div>
            
            <!-- Content overlay on left side -->
            <div class="absolute inset-0 flex flex-col justify-end p-20 z-10 text-white">
                <!-- Bottom Typography Brand -->
                <div class="max-w-2xl space-y-6">
                    <h2 class="text-5xl xl:text-6xl font-serif font-black leading-tight tracking-tight text-stone-100">
                        Cita Rasa Klasik <br />
                        <span class="text-amber-500 italic font-light font-serif">Manajemen Modern.</span>
                    </h2>
                    
                    <div class="w-20 h-1 bg-amber-500 rounded-full"></div>
                    
                    <p class="text-stone-300 text-lg leading-relaxed font-medium">
                        Denjavas Café POS — Platform manajemen kasir dan pengelolaan inventori bahan baku real-time yang dirancang khusus untuk meningkatkan produktivitas retro café kami.
                    </p>
                </div>
            </div>
        </div>

        <!-- Content Container (Form Area) -->
        <div class="relative z-10 w-full lg:w-[40%] xl:w-[35%] px-6 md:px-12 py-12 flex flex-col min-h-screen bg-white lg:shadow-[-20px_0_60px_rgba(0,0,0,0.03)] border-l border-stone-200/40 justify-center">
            <!-- Header Logo Area -->
            <div class="flex flex-col items-center mb-12">
                <router-link to="/" class="group flex flex-col items-center">
                    <h1 class="text-3xl font-serif font-black tracking-tighter text-[#1C1917] group-hover:text-[#B45309] transition-colors">
                        Denjavas<span class="text-[#B45309]">.</span>
                    </h1>
                    <div class="h-1 w-8 bg-[#B45309] rounded-full mt-1 transform group-hover:w-12 transition-all"></div>
                </router-link>
            </div>

            <!-- Page Content (Slot) -->
            <div class="w-full max-w-sm mx-auto">
                <slot />
            </div>

            <!-- Footer -->
            <div class="mt-auto pt-10 text-center">
                <p class="text-[9px] text-[#A8A29E] font-black uppercase tracking-widest">
                    &copy; 2026 Denjavas Café POS
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

.bg-cover-image {
    animation: slowZoom 25s ease-in-out infinite alternate;
}

@keyframes slowZoom {
    0% { transform: scale(1.02); }
    100% { transform: scale(1.08); }
}
</style>
