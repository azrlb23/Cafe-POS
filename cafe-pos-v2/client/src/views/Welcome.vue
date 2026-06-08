<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/utils/api';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const isScrolled = ref(false);
const activeSection = ref('');
const isMobileMenuOpen = ref(false);

const featuredMenus = ref<any[]>([]);
const activeMenuIndex = ref(0);

const activeFeaturedMenu = computed(() => {
    if (featuredMenus.value && featuredMenus.value.length > 0) {
        return featuredMenus.value[activeMenuIndex.value];
    }
    // Return fallback items based on activeMenuIndex
    const fallbacks = [
        {
            name: 'Nasi Goreng Retro',
            basePrice: 45000,
            description: 'Perpaduan nasi goreng khas bumbu rempah Nusantara klasik dengan balutan telur omelette premium.',
            imagePath: '/images/nusantara_dish_1775476113236.png',
            Category: { name: 'Makanan Utama' }
        },
        {
            name: 'Kopi Susu Senja',
            basePrice: 28000,
            description: 'Kopi espresso house-blend disajikan dingin dengan creamy milk dan gula aren khas resep klasik.',
            imagePath: '/images/retro_coffee_1775476132920.png',
            Category: { name: 'Minuman Dingin' }
        },
        {
            name: 'Classic Choco Slice',
            basePrice: 35000,
            description: 'Kue cokelat premium lembut dilapisi cokelat ganache yang lumer dan manis pas di setiap gigitan.',
            imagePath: '/images/elegant_dessert_1775476149430.png',
            Category: { name: 'Kue Premium' }
        }
    ];
    return fallbacks[activeMenuIndex.value];
});

// Custom Modal state
const showOrderModal = ref(false);
const selectedMenuToOrder = ref<any>(null);

let spyObserver: IntersectionObserver | null = null;
let revealObserver: IntersectionObserver | null = null;

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

const formatPrice = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);
};

// Open ordering modal
const openOrderModal = (menu: any) => {
    selectedMenuToOrder.value = menu;
    showOrderModal.value = true;
};

// Fallback image mapper for dynamic menu items
const getMenuImage = (menu: any) => {
    if (!menu.imagePath) {
        return getFallbackImage(menu.name, menu.category?.name);
    }
    
    // Check if the imagePath looks like a non-food screenshot (e.g. windows/desktop captures)
    const lowerPath = menu.imagePath.toLowerCase();
    if (
        lowerPath.includes('screenshot') || 
        lowerPath.includes('capture') || 
        lowerPath.includes('test') || 
        lowerPath.includes('window') || 
        lowerPath.includes('desktop') ||
        lowerPath.includes('realme')
    ) {
        return getFallbackImage(menu.name, menu.category?.name);
    }
    
    return '/storage/' + menu.imagePath;
};

const getFallbackImage = (menuName: string, categoryName?: string) => {
    const name = (menuName || '').toLowerCase();
    const cat = (categoryName || '').toLowerCase();
    
    if (
        name.includes('kopi') || 
        name.includes('kopsu') || 
        name.includes('susu') || 
        name.includes('teh') || 
        name.includes('oolong') || 
        name.includes('drink') || 
        name.includes('bev') || 
        name.includes('coffee') || 
        name.includes('latte') || 
        name.includes('matcha') || 
        name.includes('espresso') || 
        name.includes('americano') || 
        name.includes('tea') || 
        name.includes('juice') || 
        name.includes('soda') || 
        cat.includes('minuman') || 
        cat.includes('drink') || 
        cat.includes('coffee')
    ) {
        return '/images/retro_coffee_1775476132920.png';
    }
    if (
        name.includes('choco') || 
        name.includes('cake') || 
        name.includes('slice') || 
        name.includes('dessert') || 
        name.includes('pudding') || 
        name.includes('sweet') || 
        cat.includes('dessert') || 
        cat.includes('penutup') || 
        cat.includes('manis')
    ) {
        return '/images/elegant_dessert_1775476149430.png';
    }
    return '/images/nusantara_dish_1775476113236.png';
};

onMounted(async () => {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 20;
    });

    // Fetch featured menus
    try {
        const response = await api.get('/admin/public-menus');
        featuredMenus.value = response.data.menus.filter((m: any) => m.isActive).slice(0, 3);
    } catch (err) {
        console.error('Failed to fetch featured menus:', err);
    }

    // 1. Scroll Spy Observer (untuk highlight menu aktif)
    spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSection.value = entry.target.id;
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px' });

    ['menu', 'about', 'cara-pesan'].forEach(id => {
        const el = document.getElementById(id);
        if (el) spyObserver.observe(el);
    });

    // 2. Scroll Reveal Observer (untuk animasi elegan)
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target); // Hanya animasi sekali
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Allow Vue next tick to render dynamic list before observing
    setTimeout(() => {
        document.querySelectorAll('.reveal-element').forEach((el) => {
            revealObserver?.observe(el);
        });
    }, 150);
});

onUnmounted(() => {
    if (spyObserver) spyObserver.disconnect();
    if (revealObserver) revealObserver.disconnect();
});
</script>

<template>
    <div class="min-h-screen bg-cafe-base text-cafe-main font-sans selection:bg-cafe-accent selection:text-white overflow-x-hidden transition-colors duration-300">
        
        <!-- Navigation -->
        <nav :class="['fixed w-full z-50 transition-all duration-500 border-b', isScrolled ? 'bg-cafe-surface/90 backdrop-blur-md border-cafe-border py-4 shadow-sm' : 'bg-transparent border-transparent py-6']">
            <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <!-- Logo -->
                <a href="#" @click="closeMobileMenu" class="flex items-center gap-3 group">
                    <span class="font-bold text-2xl tracking-widest text-cafe-accent font-serif logo-anim transition-colors duration-300 group-hover:text-cafe-accent-hover">Denjavas</span>
                    <span class="tracking-[0.2em] text-[10px] hidden sm:block uppercase mt-1 transition-colors text-cafe-secondary/80 font-bold">Retro Café</span>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-8 items-center">
                    <a href="#menu" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', activeSection === 'menu' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent']">
                        Menu
                    </a>
                    <a href="#cara-pesan" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', activeSection === 'cara-pesan' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent']">
                        Cara Pesan
                    </a>
                    <a href="#about" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', activeSection === 'about' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent']">
                        Cerita
                    </a>

                    <div class="w-px h-4 mx-2 bg-cafe-border"></div>

                    <template v-if="user">
                        <router-link
                            :to="user.role === 'admin' ? { name: 'AdminDashboard' } : { name: 'Pos' }"
                            class="text-[10px] font-black text-cafe-accent hover:text-cafe-accent-hover transition-all uppercase tracking-[0.3em] flex items-center gap-2"
                        >
                            Ke Aplikasi
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </router-link>
                    </template>
                </div>

                <!-- Mobile Hamburger Button -->
                <button @click="toggleMobileMenu" class="md:hidden p-2 text-cafe-main hover:text-cafe-accent focus:outline-none transition-colors">
                    <svg v-if="!isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            
            <!-- Mobile Menu Drawer -->
            <div :class="['md:hidden absolute top-full left-0 w-full bg-cafe-surface/95 backdrop-blur-lg border-b border-cafe-border transition-all duration-300 overflow-hidden', isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0']">
                <div class="flex flex-col px-6 py-4 gap-4">
                    <a href="#menu" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'menu' ? 'text-cafe-accent' : 'text-cafe-main']">Menu</a>
                    <a href="#cara-pesan" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'cara-pesan' ? 'text-cafe-accent' : 'text-cafe-main']">Cara Pesan</a>
                    <a href="#about" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'about' ? 'text-cafe-accent' : 'text-cafe-main']">Cerita</a>
                    <div class="w-full h-px bg-cafe-border my-2"></div>
                    <template v-if="user">
                        <router-link :to="user.role === 'admin' ? { name: 'AdminDashboard' } : { name: 'Pos' }" class="text-sm font-bold text-cafe-accent uppercase tracking-widest flex items-center gap-2 w-fit">
                            Ke Aplikasi
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </router-link>
                    </template>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-cafe-base">
            <!-- Subtle Vintage Grid Background -->
            <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] opacity-70"></div>
            
            <!-- Fine Vintage Decorative Border -->
            <div class="absolute inset-6 z-0 border border-cafe-border/50 pointer-events-none rounded-[2rem]"></div>
            <div class="absolute inset-8 z-0 border border-cafe-border/25 pointer-events-none rounded-[1.8rem]"></div>

            <div class="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16 mt-20">
                <div class="flex-1 text-center lg:text-left animate-fade-in-up">
                    <div class="mb-6 inline-block">
                        <span class="text-cafe-accent font-black tracking-[0.3em] text-[9px] uppercase border border-cafe-accent/30 px-6 py-2.5 rounded-full bg-cafe-surface/80 backdrop-blur-sm shadow-sm">
                            EST. 2024
                        </span>
                    </div>
                    
                    <h1 class="text-5xl sm:text-7xl md:text-8xl font-serif font-bold mb-8 leading-[0.95] tracking-tight text-cafe-main">
                        Authentic<br/>
                        <span class="text-cafe-accent italic font-light font-serif">Retro Café</span>
                    </h1>
                    
                    <p class="text-lg md:text-xl text-cafe-accent/90 mb-6 font-serif italic font-medium tracking-wide flex items-center justify-center lg:justify-start gap-3">
                        <span>Minuman Klasik</span>
                        <span class="text-cafe-border">•</span>
                        <span>Camilan</span>
                        <span class="text-cafe-border">•</span>
                        <span>Nusantara</span>
                    </p>
                    
                    <p class="text-base md:text-lg text-cafe-secondary mb-12 max-w-xl leading-relaxed mx-auto lg:mx-0">
                        Nikmati cita rasa klasik dalam balutan kenyamanan modern. Perpaduan harmoni resep Nusantara warisan yang dikurasi dengan penuh dedikasi.
                    </p>
                    
                    <div class="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start w-full">
                        <a href="#menu" class="w-full sm:w-auto bg-cafe-accent hover:bg-cafe-accent-hover text-white px-12 py-5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-cafe-accent/15 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 uppercase text-[10px] tracking-[0.2em]">
                            Eksplor Menu
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="stroke-current" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        <a href="#cara-pesan" class="w-full sm:w-auto bg-cafe-surface border border-cafe-border text-cafe-secondary hover:bg-cafe-base hover:text-cafe-main px-12 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center uppercase tracking-[0.2em] text-[10px] hover:-translate-y-1 shadow-sm active:scale-95">
                            Cara Pesan
                        </a>
                    </div>
                </div>

                <!-- Floating Editorial Photograph Frame -->
                <div class="flex-1 relative animate-fade-in-up delay-300 hidden lg:block">
                    <div class="relative w-full max-w-md mx-auto aspect-[4/5] bg-white p-6 rounded-3xl shadow-xl border border-cafe-border transform rotate-2 hover:rotate-0 transition-transform duration-700 group">
                        <!-- Double line inner border -->
                        <div class="absolute inset-4 border border-cafe-border/60 pointer-events-none rounded-2xl"></div>
                        <div class="absolute inset-5 border border-cafe-border/30 pointer-events-none rounded-xl"></div>
                        
                        <!-- Image Container -->
                        <div class="w-full h-[82%] rounded-xl overflow-hidden relative border border-cafe-border/50">
                            <img src="/images/cafe_hero_bg.png" class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" alt="Premium Coffee" />
                            <div class="absolute inset-0 bg-amber-900/5 mix-blend-multiply pointer-events-none"></div>
                        </div>

                        <!-- Cursive Caption at bottom -->
                        <div class="h-[18%] flex items-center justify-center pt-3">
                            <p class="font-serif italic text-cafe-secondary text-base font-semibold">"Sudut Nostalgia Denjavas"</p>
                        </div>

                        <!-- Floating Badge -->
                        <div class="absolute -bottom-6 -left-6 bg-cafe-surface py-5 px-6 rounded-2xl shadow-xl border border-cafe-border animate-bounce-slow">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-cafe-base rounded-xl flex items-center justify-center text-cafe-accent border border-cafe-border">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>
                                </div>
                                <div class="text-left">
                                    <p class="text-[8px] font-black text-cafe-muted uppercase tracking-widest">Kualitas</p>
                                    <p class="text-xs font-black text-cafe-main">Premium Nusantara</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center hidden sm:flex opacity-40">
                <div class="w-[1px] h-12 bg-gradient-to-b from-cafe-accent to-transparent"></div>
            </div>
        </section>

        <!-- Featured Menu / Best Seller (Split Chalkboard Layout) -->
        <section id="menu" class="py-32 relative bg-cafe-base border-y border-cafe-border/50 scroll-mt-20">
            <div class="max-w-7xl mx-auto px-6">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-20 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">PILIHAN KASIR</span>
                    <h2 class="text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Menu Andalan Kami</h2>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-px bg-cafe-border"></div>
                        <span class="text-cafe-accent text-xs">◆</span>
                        <div class="w-12 h-px bg-cafe-border"></div>
                    </div>
                </div>

                <!-- Interactive Split Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch reveal-element delay-200">
                    <!-- Left Column: Interactive chalkboard list -->
                    <div class="lg:col-span-7 flex flex-col justify-center">
                        <div class="flex flex-col gap-4 bg-cafe-surface border border-cafe-border p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                            <!-- Inner double borders for vintage look -->
                            <div class="absolute inset-2 border border-dashed border-cafe-border/60 rounded-2xl pointer-events-none"></div>

                            <!-- Header decoration -->
                            <div class="flex justify-between items-center border-b border-cafe-border pb-4 mb-2 relative z-10">
                                <span class="text-[10px] font-black text-cafe-accent uppercase tracking-widest">Daftar Sajian Pilihan</span>
                                <span class="text-[10px] font-serif italic text-cafe-muted">Denjavas Specialty</span>
                            </div>

                            <!-- List -->
                            <div v-if="featuredMenus && featuredMenus.length > 0" class="flex flex-col gap-2 relative z-10">
                                <div 
                                    v-for="(menu, idx) in featuredMenus" 
                                    :key="menu.id"
                                    @mouseenter="activeMenuIndex = idx"
                                    @click="activeMenuIndex = idx"
                                    :class="[
                                        'group p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden',
                                        activeMenuIndex === idx 
                                            ? 'bg-cafe-base/40 border-cafe-accent/30 shadow-sm border-l-4 border-l-cafe-accent pl-4' 
                                            : 'bg-transparent border-transparent hover:bg-cafe-base/10 hover:border-cafe-border/50'
                                    ]"
                                >
                                    <div class="flex items-baseline justify-between gap-1">
                                        <h3 class="text-lg font-serif font-bold text-cafe-main group-hover:text-cafe-accent transition-colors">{{ menu.name }}</h3>
                                        <div class="flex-1 border-b border-dotted border-cafe-border/80 mx-2"></div>
                                        <span class="text-sm font-bold text-cafe-accent">{{ formatPrice(menu.basePrice) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center mt-1">
                                        <p class="text-cafe-secondary text-xs line-clamp-1 italic max-w-[80%]">{{ menu.description || 'Tidak ada deskripsi untuk menu klasik ini.' }}</p>
                                        <span class="text-[8px] font-bold text-cafe-muted uppercase tracking-widest px-2 py-0.5 border border-cafe-border/60 rounded bg-cafe-surface/80">{{ menu.Category?.name || 'Sajian' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex flex-col gap-2 relative z-10">
                                <!-- Fallback List -->
                                <div 
                                    v-for="(menu, idx) in [
                                        { name: 'Nasi Goreng Retro', price: 'Rp 45.000', desc: 'Nasi goreng bumbu rempah Nusantara dengan telur omelette premium.', cat: 'Makanan Utama' },
                                        { name: 'Kopi Susu Senja', price: 'Rp 28.000', desc: 'Espresso house-blend dingin dengan creamy milk dan gula aren aren.', cat: 'Minuman Dingin' },
                                        { name: 'Classic Choco Slice', price: 'Rp 35.000', desc: 'Kue cokelat premium lembut dilapisi cokelat ganache yang lumer.', cat: 'Kue Premium' }
                                    ]" 
                                    :key="idx"
                                    @mouseenter="activeMenuIndex = idx"
                                    @click="activeMenuIndex = idx"
                                    :class="[
                                        'group p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden',
                                        activeMenuIndex === idx 
                                            ? 'bg-cafe-base/40 border-cafe-accent/30 shadow-sm border-l-4 border-l-cafe-accent pl-4' 
                                            : 'bg-transparent border-transparent hover:bg-cafe-base/10 hover:border-cafe-border/50'
                                    ]"
                                >
                                    <div class="flex items-baseline justify-between gap-1">
                                        <h3 class="text-lg font-serif font-bold text-cafe-main group-hover:text-cafe-accent transition-colors">{{ menu.name }}</h3>
                                        <div class="flex-1 border-b border-dotted border-cafe-border/80 mx-2"></div>
                                        <span class="text-sm font-bold text-cafe-accent">{{ menu.price }}</span>
                                    </div>
                                    <div class="flex justify-between items-center mt-1">
                                        <p class="text-cafe-secondary text-xs line-clamp-1 italic max-w-[80%]">{{ menu.desc }}</p>
                                        <span class="text-[8px] font-bold text-cafe-muted uppercase tracking-widest px-2 py-0.5 border border-cafe-border/60 rounded bg-cafe-surface/80">{{ menu.cat }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Large Polaroid showcase -->
                    <div class="lg:col-span-5">
                        <div class="flex flex-col bg-white border border-cafe-border p-6 rounded-3xl shadow-xl lg:rotate-1 hover:rotate-0 transition-transform duration-500 h-full justify-between relative overflow-hidden group/polaroid">
                            <!-- Subtle tape / badge decoration at the top -->
                            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-20 h-6 bg-cafe-accent/10 border-x border-b border-cafe-accent/20 rounded-b-md z-20 pointer-events-none"></div>

                            <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cafe-base border border-cafe-border/50 relative">
                                <transition name="photo-fade" mode="out-in">
                                    <img 
                                        :key="activeFeaturedMenu.name" 
                                        :src="activeFeaturedMenu.imagePath?.startsWith('/') || activeFeaturedMenu.imagePath?.startsWith('http') ? activeFeaturedMenu.imagePath : getMenuImage(activeFeaturedMenu)" 
                                        :alt="activeFeaturedMenu.name" 
                                        class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/polaroid:scale-105" 
                                    />
                                </transition>
                            </div>
                            
                            <div class="pt-6 pb-2 flex-1 flex flex-col justify-between">
                                <div>
                                    <span class="text-[9px] font-black text-cafe-accent uppercase tracking-[0.2em] mb-2 block">{{ activeFeaturedMenu.Category?.name || 'Sajian Spesial' }}</span>
                                    <h3 class="text-2xl font-serif font-bold text-cafe-main mb-3 leading-tight">{{ activeFeaturedMenu.name }}</h3>
                                    <p class="text-cafe-secondary text-xs leading-relaxed italic mb-4">{{ activeFeaturedMenu.description || 'Tidak ada deskripsi untuk menu klasik ini.' }}</p>
                                </div>
                                
                                <div class="mt-auto border-t border-cafe-border/60 pt-4 flex flex-col gap-4">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-cafe-muted uppercase tracking-widest">Harga Hidangan</span>
                                        <span class="text-xl font-bold text-cafe-accent tracking-wide">
                                            {{ typeof activeFeaturedMenu.basePrice === 'number' ? formatPrice(activeFeaturedMenu.basePrice) : activeFeaturedMenu.price || formatPrice(activeFeaturedMenu.basePrice) }}
                                        </span>
                                    </div>
                                    <button 
                                        @click="openOrderModal(activeFeaturedMenu)" 
                                        class="w-full bg-cafe-accent hover:bg-cafe-accent-hover text-white py-4.5 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cafe-accent/15 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
                                    >
                                        Pesan Hidangan Ini
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- View All Button -->
                <div class="flex justify-center mt-16 reveal-element delay-300">
                    <router-link
                        :to="{ name: 'PublicMenu' }"
                        class="bg-cafe-accent hover:bg-cafe-accent-hover text-white px-12 py-5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-cafe-accent/15 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 uppercase text-[10px] tracking-[0.2em] cursor-pointer"
                    >
                        Lihat Seluruh Menu
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Cara Pesan -->
        <section id="cara-pesan" class="py-32 bg-white relative transition-colors duration-300 scroll-mt-20">
            <!-- Background grids -->
            <div class="absolute inset-0 z-0 bg-[radial-gradient(#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-80"></div>
            
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="text-center mb-20 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 inline-block font-bold">SIMPLE & CEPAT</span>
                    <h2 class="text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Langkah Pemesanan</h2>
                    <div class="w-16 h-0.5 bg-cafe-accent/30 mx-auto rounded-full"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <!-- Path Connector (Desktop only) -->
                    <div class="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] border-t border-dashed border-cafe-border reveal-element delay-200"></div>

                    <!-- Step 1 -->
                    <div class="relative text-center group reveal-element delay-200">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-cafe-accent rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-500 shadow-sm group-hover:shadow-md">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-cafe-accent text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2 border-2 border-white shadow-md text-xs font-serif">1</span>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-cafe-accent group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13M4 19h16M4 19l2-2h12l2 2m-8-10v5m0 0l-2-2m2 2l2-2"/></svg>
                        </div>
                        <h3 class="text-xl font-serif font-bold mb-3 text-cafe-main">Pilih Menu</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm leading-relaxed">Jelajahi sajian khas Nusantara, kopi klasik, dan dessert manis di buku menu online kami.</p>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative text-center group mt-10 md:mt-0 reveal-element delay-300">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-cafe-accent rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-500 shadow-sm group-hover:shadow-md">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-cafe-accent text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2 border-2 border-white shadow-md text-xs font-serif">2</span>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-cafe-accent group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="7.01" y2="15"/><line x1="11" y1="15" x2="13" y2="15"/></svg>
                        </div>
                        <h3 class="text-xl font-serif font-bold mb-3 text-cafe-main">Bayar Mudah</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm leading-relaxed">Selesaikan transaksi langsung di meja kasir melalui QRIS, e-Wallet, atau Tunai.</p>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative text-center group mt-10 md:mt-0 reveal-element delay-400">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-cafe-accent rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-500 shadow-sm group-hover:shadow-md">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-cafe-accent text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2 border-2 border-white shadow-md text-xs font-serif">3</span>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-cafe-accent group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><path d="M5 12l5 5L20 7"/></svg>
                        </div>
                        <h3 class="text-xl font-serif font-bold mb-3 text-cafe-main">Sajian Siap</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm leading-relaxed">Pesanan Anda diracik khusus oleh tim bumbu tradisional dan diantar langsung ke meja Anda.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="py-32 relative bg-cafe-base scroll-mt-20">
            <div class="relative z-10 max-w-4xl mx-auto px-8 text-center reveal-element">
                <!-- Retro Logo Icon -->
                <div class="flex items-center justify-center gap-2 mb-8 text-cafe-accent/70">
                    <div class="w-10 h-px bg-cafe-border"></div>
                    <span class="text-lg">◆</span>
                    <div class="w-10 h-px bg-cafe-border"></div>
                </div>
                
                <div class="border-y-2 border-double border-cafe-border/80 py-12 px-6">
                    <h2 class="text-3xl md:text-5xl font-serif font-bold mb-8 leading-snug text-cafe-main">
                        Membawa Kenangan Klasik <br/>dalam Sajian <span class="text-cafe-accent italic font-light font-serif">Masa Kini</span>
                    </h2>
                    <p class="text-lg md:text-xl text-cafe-secondary font-serif italic max-w-2xl mx-auto leading-relaxed">
                        "Denjavas Retro Café lahir dari kecintaan mendalam pada harmoni rasa tradisional Nusantara dan nuansa nostalgia klasik yang tak lekang waktu. Setiap cangkir kopi dan piring hidangan diracik secara artisanal untuk mengantarkan kehangatan layaknya rumah."
                    </p>
                </div>

                <div class="flex items-center justify-center gap-2 mt-8 text-cafe-accent/70">
                    <div class="w-10 h-px bg-cafe-border"></div>
                    <span class="text-lg">◆</span>
                    <div class="w-10 h-px bg-cafe-border"></div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-cafe-surface py-16 border-t border-cafe-border text-center">
            <div class="max-w-7xl mx-auto px-6 reveal-element">
                <!-- Branding -->
                <div class="mb-8">
                    <h2 class="text-3xl font-serif font-bold text-cafe-main mb-2">Denjavas<span class="text-cafe-accent">.</span></h2>
                    <p class="text-cafe-accent text-[9px] tracking-[0.3em] uppercase font-bold">Retro Café & Eatery</p>
                </div>
                
                <p class="text-cafe-secondary text-xs mb-8 max-w-xs mx-auto leading-relaxed">
                    &copy; 2026 Denjavas Retro Café. All rights reserved. <br/>
                    Sistem Kasir & POS Cerdas Terintegrasi.
                </p>
                
                <div class="flex justify-center gap-6 mb-12">
                    <a href="#" class="text-cafe-muted hover:text-cafe-accent transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="#" class="text-cafe-muted hover:text-cafe-accent transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    </a>
                    <a href="#" class="text-cafe-muted hover:text-cafe-accent transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                </div>
            </div>
        </footer>

        <!-- Custom Retro Modal for Orders -->
        <div v-if="showOrderModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1C1917]/65 backdrop-blur-sm transition-all duration-300">
            <div class="relative w-full max-w-md bg-cafe-base p-8 rounded-3xl shadow-2xl border-2 border-cafe-accent/30 text-center animate-fade-in transform scale-100">
                <!-- Inner Double Border -->
                <div class="absolute inset-2.5 border border-cafe-border pointer-events-none rounded-2xl"></div>
                
                <!-- Coffee Cup Icon -->
                <div class="w-16 h-16 mx-auto bg-white border border-cafe-border rounded-2xl flex items-center justify-center text-cafe-accent mb-6 shadow-sm">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                        <path d="M6 1v3M10 1v3M14 1v3"/>
                    </svg>
                </div>
                
                <h3 class="text-2xl font-serif font-bold text-cafe-main mb-2">Pemesanan Langsung</h3>
                <div class="w-12 h-0.5 bg-cafe-accent/30 mx-auto mb-6 rounded-full"></div>
                
                <div v-if="selectedMenuToOrder" class="mb-6 bg-white p-4 rounded-xl border border-cafe-border">
                    <p class="text-xs text-cafe-muted uppercase tracking-wider font-bold mb-1">Menu Pilihan Anda</p>
                    <p class="text-lg font-serif font-bold text-cafe-main mb-1">{{ selectedMenuToOrder.name }}</p>
                    <p class="text-sm font-bold text-cafe-accent">{{ formatPrice(selectedMenuToOrder.basePrice) }}</p>
                </div>
                
                <p class="text-sm text-cafe-secondary leading-relaxed mb-8">
                    Silakan lakukan pemesanan secara langsung melalui kasir **Denjavas Cafe** dengan menyebutkan nama menu di atas. Tim kami siap meracik hidangan istimewa untuk Anda.
                </p>
                
                <button 
                    @click="showOrderModal = false" 
                    class="w-full bg-cafe-main hover:bg-cafe-accent text-white py-4 rounded-xl font-bold transition-all duration-300 uppercase tracking-widest text-[10px] shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                    Tutup
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px; /* Offset for fixed navbar */
}
body {
    -webkit-font-smoothing: antialiased;
}
.font-sans {
    font-family: 'Inter', sans-serif;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}

/* Base Animations */
.logo-anim {
    animation: glow 3s ease-in-out infinite alternate;
}
@keyframes glow {
    from { text-shadow: 0 0 5px rgba(180, 83, 9, 0.05); }
    to { text-shadow: 0 0 15px rgba(180, 83, 9, 0.25); }
}
.animate-fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
.animate-bounce-slow {
    animation: bounceSlow 4s infinite ease-in-out;
}
@keyframes bounceSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

/* Scroll Reveal Classes */
.reveal-element {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
}
.reveal-element.revealed {
    opacity: 1;
    transform: translateY(0);
}
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }

/* Photo fade transitions */
.photo-fade-enter-active,
.photo-fade-leave-active {
  transition: all 0.25s ease-in-out;
}
.photo-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(2px);
}
.photo-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-2px);
}
</style>
