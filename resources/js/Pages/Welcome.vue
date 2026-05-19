<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { onMounted, onUnmounted, ref } from 'vue';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
    laravelVersion: {
        type: String,
        required: true,
    },
    phpVersion: {
        type: String,
        required: true,
    },
});

const isScrolled = ref(false);
const activeSection = ref('');
const isMobileMenuOpen = ref(false);

let spyObserver = null;
let revealObserver = null;

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

onMounted(() => {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 20;
    });

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

    document.querySelectorAll('.reveal-element').forEach((el) => {
        revealObserver.observe(el);
    });
});

onUnmounted(() => {
    if (spyObserver) spyObserver.disconnect();
    if (revealObserver) revealObserver.disconnect();
});
</script>

<template>
    <Head title="Denjavas Retro Café - Beverage · Dessert · Nusantara" />

    <div class="min-h-screen bg-cafe-base text-cafe-main font-sans selection:bg-[#B45309] selection:text-white overflow-x-hidden transition-colors duration-300">
        
        <!-- Navigation -->
        <nav :class="['fixed w-full z-50 transition-all duration-300 border-b', isScrolled ? 'bg-cafe-surface/90 backdrop-blur-md border-cafe-border py-4 shadow-sm' : 'bg-transparent border-transparent py-6']">
            <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <!-- Logo -->
                <a href="#" @click="closeMobileMenu" class="flex items-center gap-3">
                    <span class="font-bold text-2xl tracking-widest text-[#B45309] font-serif logo-anim">Denjavas</span>
                    <span :class="['tracking-widest text-sm hidden sm:block uppercase mt-1 transition-colors', isScrolled ? 'text-cafe-secondary' : 'text-gray-300']">Retro Café</span>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-8 items-center">
                    <a href="#menu" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none', activeSection === 'menu' ? 'text-[#B45309]' : 'text-slate-500 hover:text-[#B45309]']">
                        Menu
                    </a>
                    <a href="#cara-pesan" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none', activeSection === 'cara-pesan' ? 'text-[#B45309]' : 'text-slate-500 hover:text-[#B45309]']">
                        Cara Pesan
                    </a>
                    <a href="#about" :class="['text-[10px] font-black uppercase tracking-[0.3em] transition-all focus:outline-none', activeSection === 'about' ? 'text-[#B45309]' : 'text-slate-500 hover:text-[#B45309]']">
                        Cerita
                    </a>

                    <div class="w-px h-4 mx-2 bg-slate-200"></div>

                    <template v-if="$page.props.auth.user">
                        <Link
                            :href="$page.props.auth.user.role === 'admin' ? route('dashboard') : route('pos')"
                            class="text-[10px] font-black text-amber-700 hover:text-amber-800 transition-all uppercase tracking-[0.3em] flex items-center gap-2"
                        >
                            Ke Aplikasi
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </Link>
                    </template>
                    <template v-else>
                        <Link
                            v-if="canLogin"
                            :href="route('login')"
                            class="text-[10px] font-black text-amber-700 hover:text-amber-800 transition-all uppercase tracking-[0.3em] flex items-center gap-2"
                        >
                            Log in
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </Link>
                    </template>
                </div>

                <!-- Mobile Hamburger Button -->
                <button @click="toggleMobileMenu" class="md:hidden p-2 text-cafe-main hover:text-[#B45309] focus:outline-none transition-colors">
                    <svg v-if="!isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            
            <!-- Mobile Menu Drawer -->
            <div :class="['md:hidden absolute top-full left-0 w-full bg-cafe-surface/95 backdrop-blur-lg border-b border-cafe-border transition-all duration-300 overflow-hidden', isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0']">
                <div class="flex flex-col px-6 py-4 gap-4">
                    <a href="#menu" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'menu' ? 'text-[#B45309]' : 'text-cafe-main']">Menu</a>
                    <a href="#cara-pesan" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'cara-pesan' ? 'text-[#B45309]' : 'text-cafe-main']">Cara Pesan</a>
                    <a href="#about" @click="closeMobileMenu" :class="['text-sm font-bold uppercase tracking-widest', activeSection === 'about' ? 'text-[#B45309]' : 'text-cafe-main']">Cerita</a>
                    <div class="w-full h-px bg-cafe-border my-2"></div>
                    <template v-if="$page.props.auth.user">
                        <Link :href="$page.props.auth.user.role === 'admin' ? route('dashboard') : route('pos')" class="text-sm font-bold text-[#B45309] uppercase tracking-widest flex items-center gap-2 w-fit">
                            Ke Aplikasi
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </Link>
                    </template>
                    <template v-else>
                        <Link v-if="canLogin" :href="route('login')" class="text-sm font-bold text-[#B45309] uppercase tracking-widest flex items-center gap-2 w-fit">
                            Log in Staff
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </Link>
                    </template>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            <!-- Subtle Background Pattern -->
            <div class="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40"></div>
            
            <!-- Animated Decorative Elements -->
            <div class="absolute top-1/4 -left-20 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div class="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 mt-20">
                <div class="flex-1 text-center lg:text-left animate-fade-in-up">
                    <div class="mb-6 inline-block">
                        <span class="text-amber-700 font-black tracking-[0.4em] text-[10px] uppercase border border-amber-300 px-5 py-2 rounded-full bg-amber-50/60 backdrop-blur-sm shadow-sm">
                            Est. 2024
                        </span>
                    </div>
                    
                    <h1 class="text-6xl sm:text-7xl md:text-8xl font-serif font-black mb-8 leading-[0.9] tracking-tighter text-slate-900">
                        Authentic<br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600 italic font-light">Retro Café</span>
                    </h1>
                    
                    <p class="text-xl md:text-2xl text-amber-700 mb-6 font-serif italic font-black tracking-tight">
                        Beverage · Dessert · Nusantara
                    </p>
                    
                    <p class="text-lg md:text-xl text-slate-500 mb-12 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                        Nikmati cita rasa retro dalam balutan kenyamanan modern. <br class="hidden sm:block" />
                        Perpaduan harmoni resep Nusantara yang dikurasi dengan penuh cinta.
                    </p>
                    
                    <div class="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start w-full">
                        <a href="#menu" class="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white px-12 py-5 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-700/20 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-[0.2em]">
                            Eksplor Menu
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="stroke-current" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        <a href="#cara-pesan" class="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-12 py-5 rounded-2xl font-black transition-all duration-300 flex items-center justify-center uppercase tracking-[0.2em] text-xs hover:-translate-y-1 shadow-sm active:scale-95">
                            Cara Pesan
                        </a>
                    </div>
                </div>

                <!-- Floating Image Composition -->
                <div class="flex-1 relative animate-fade-in-up delay-300 hidden lg:block">
                    <div class="relative w-full max-w-md mx-auto aspect-square">
                        <!-- Decorative Frame -->
                        <div class="absolute -inset-4 border-2 border-amber-100 rounded-[3rem] rotate-3 -z-10 opacity-50"></div>
                        <div class="absolute -inset-4 border-2 border-slate-100 rounded-[3rem] -rotate-3 -z-10 opacity-50"></div>
                        
                        <div class="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl shadow-amber-900/10 border-8 border-white transform hover:rotate-2 transition-transform duration-700">
                            <img src="/images/cafe_hero_bg.png" class="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="Premium Coffee" />
                        </div>

                        <!-- Floating Badges -->
                        <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-bounce-slow">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="M4.5 15.5h15"/><path d="m15 11-1 9"/></svg>
                                </div>
                                <div class="text-left">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kualitas</p>
                                    <p class="text-sm font-black text-slate-900">Premium Nusantara</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center hidden sm:flex opacity-30">
                <div class="w-[1px] h-16 bg-gradient-to-b from-amber-700 to-transparent"></div>
            </div>
        </section>

        <!-- Featured Menu / Best Seller -->
        <section id="menu" class="py-32 relative bg-cafe-base transition-colors duration-300 scroll-mt-20">
            <div class="max-w-7xl mx-auto px-6">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-20 reveal-element delay-100">
                    <span class="text-[#B45309] text-sm uppercase tracking-[0.2em] mb-3 font-semibold">Pilihan Kami</span>
                    <h2 class="text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6 transition-colors duration-300">Menu Andalan</h2>
                    <div class="w-24 h-1 bg-[#B45309] rounded-full opacity-50"></div>
                </div>

                <!-- Product Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <!-- Item 1: Nusantara -->
                    <div class="reveal-element delay-200 group block rounded-2xl overflow-hidden bg-cafe-surface border border-cafe-border hover:border-[#B45309]/50 transition-all duration-500 hover:-translate-y-3 relative shadow-sm hover:shadow-xl">
                        <div class="absolute top-4 left-4 z-20 bg-[#B45309] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                            Signature
                        </div>
                        <div class="aspect-[4/3] overflow-hidden relative">
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                            <img src="/images/nusantara_dish_1775476113236.png" alt="Nasi Goreng Nusantara" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                        </div>
                        <div class="p-8 flex flex-col justify-between h-full bg-cafe-surface transition-colors duration-300">
                            <div>
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-2xl font-serif text-cafe-main group-hover:text-[#B45309] transition-colors">Nasi Goreng Retro</h3>
                                </div>
                                <p class="text-cafe-secondary text-sm mb-6 line-clamp-2 transition-colors duration-300">Perpaduan Nasi Goreng khas bumbu rempah Nusantara dengan balutan telur omelette premium.</p>
                            </div>
                            <div class="flex items-center justify-between border-t border-cafe-border pt-4 mt-auto">
                                <span class="text-lg text-[#B45309] font-semibold tracking-wide">Rp 45.000</span>
                                <Link v-if="canLogin" :href="route('login')" class="flex items-center gap-2 text-sm uppercase tracking-widest text-cafe-main hover:text-[#B45309] transition-colors group/btn">
                                    Tambah
                                    <span class="w-8 h-8 rounded-full border border-cafe-border flex items-center justify-center group-hover/btn:bg-[#B45309] group-hover/btn:border-[#B45309] group-hover/btn:text-white transition-all">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <!-- Item 2: Coffee -->
                    <div class="reveal-element delay-300 group block rounded-2xl overflow-hidden bg-cafe-surface border border-cafe-border hover:border-[#B45309]/50 transition-all duration-500 hover:-translate-y-3 relative shadow-sm hover:shadow-xl">
                        <div class="absolute top-4 left-4 z-20 bg-[#B45309] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                            Best Seller
                        </div>
                        <div class="aspect-[4/3] overflow-hidden relative">
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                            <img src="/images/retro_coffee_1775476132920.png" alt="Es Kopi Susu" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                        </div>
                        <div class="p-8 flex flex-col justify-between h-full bg-cafe-surface transition-colors duration-300">
                            <div>
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-2xl font-serif text-cafe-main group-hover:text-[#B45309] transition-colors">Kopi Susu Senja</h3>
                                </div>
                                <p class="text-cafe-secondary text-sm mb-6 line-clamp-2 transition-colors duration-300">Kopi espresso house-blend disajikan dengan creamy milk dan gula aren khas resep klasik.</p>
                            </div>
                            <div class="flex items-center justify-between border-t border-cafe-border pt-4 mt-auto">
                                <span class="text-lg text-[#B45309] font-semibold tracking-wide">Rp 28.000</span>
                                <Link v-if="canLogin" :href="route('login')" class="flex items-center gap-2 text-sm uppercase tracking-widest text-cafe-main hover:text-[#B45309] transition-colors group/btn">
                                    Tambah
                                    <span class="w-8 h-8 rounded-full border border-cafe-border flex items-center justify-center group-hover/btn:bg-[#B45309] group-hover/btn:border-[#B45309] group-hover/btn:text-white transition-all">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <!-- Item 3: Dessert -->
                    <div class="reveal-element delay-400 group block rounded-2xl overflow-hidden bg-cafe-surface border border-cafe-border hover:border-[#B45309]/50 transition-all duration-500 hover:-translate-y-3 relative shadow-sm hover:shadow-xl">
                        <div class="aspect-[4/3] overflow-hidden relative">
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                            <img src="/images/elegant_dessert_1775476149430.png" alt="Premium Dessert" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" />
                        </div>
                        <div class="p-8 flex flex-col justify-between h-full bg-cafe-surface transition-colors duration-300">
                            <div>
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-2xl font-serif text-cafe-main group-hover:text-[#B45309] transition-colors">Classic Choco Slice</h3>
                                </div>
                                <p class="text-cafe-secondary text-sm mb-6 line-clamp-2 transition-colors duration-300">Kue cokelat premium dengan sentuhan gold leaf. Flawless dan melting di setiap gigitannya.</p>
                            </div>
                            <div class="flex items-center justify-between border-t border-cafe-border pt-4 mt-auto">
                                <span class="text-lg text-[#B45309] font-semibold tracking-wide">Rp 35.000</span>
                                <Link v-if="canLogin" :href="route('login')" class="flex items-center gap-2 text-sm uppercase tracking-widest text-cafe-main hover:text-[#B45309] transition-colors group/btn">
                                    Tambah
                                    <span class="w-8 h-8 rounded-full border border-cafe-border flex items-center justify-center group-hover/btn:bg-[#B45309] group-hover/btn:border-[#B45309] group-hover/btn:text-white transition-all">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cara Pesan -->
        <section id="cara-pesan" class="py-32 bg-cafe-surface border-y border-cafe-border relative transition-colors duration-300 scroll-mt-20">
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="text-center mb-20 reveal-element delay-100">
                    <span class="text-[#B45309] text-sm uppercase tracking-[0.2em] mb-3 inline-block font-semibold">Simple & Cepat</span>
                    <h2 class="text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6 transition-colors duration-300">Cara Memesan</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <!-- Path Connector (Desktop only) -->
                    <div class="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] border-t border-dashed border-[#B45309]/30 reveal-element delay-200"></div>

                    <!-- Step 1 -->
                    <div class="relative text-center group reveal-element delay-200">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-[#B45309] rounded-full flex items-center justify-center mb-6 relative z-10 transition-colors duration-500 shadow-sm group-hover:shadow-lg">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-[#B45309] text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2">1</span>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#B45309] group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13M4 19h16M4 19l2-2h12l2 2m-8-10v5m0 0l-2-2m2 2l2-2"/></svg>
                        </div>
                        <h3 class="text-2xl font-serif font-bold mb-3 text-cafe-main transition-colors duration-300">Pilih Menu</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm transition-colors duration-300">Pilih hidangan dan minuman favorit dari buku menu online kami yang menggugah selera.</p>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative text-center group mt-10 md:mt-0 reveal-element delay-300">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-[#B45309] rounded-full flex items-center justify-center mb-6 relative z-10 transition-colors duration-500 shadow-sm group-hover:shadow-lg">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-[#B45309] text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2">2</span>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#B45309] group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="7.01" y2="15"/><line x1="11" y1="15" x2="13" y2="15"/></svg>
                        </div>
                        <h3 class="text-2xl font-serif font-bold mb-3 text-cafe-main transition-colors duration-300">Bayar Praktis</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm transition-colors duration-300">Selesaikan pembayaran dalam hitungan detik menggunakan QRIS, e-Wallet, atau Transfer.</p>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative text-center group mt-10 md:mt-0 reveal-element delay-400">
                        <div class="w-24 h-24 mx-auto bg-cafe-base border border-cafe-border group-hover:border-[#B45309] rounded-full flex items-center justify-center mb-6 relative z-10 transition-colors duration-500 shadow-sm group-hover:shadow-lg">
                            <span class="absolute top-0 right-0 w-8 h-8 bg-[#B45309] text-white font-bold flex items-center justify-center rounded-full transform translate-x-2 -translate-y-2">3</span>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#B45309] group-hover:scale-110 transition-transform duration-500" stroke="currentColor" stroke-width="1.5"><path d="M5 12l5 5L20 7"/></svg>
                        </div>
                        <h3 class="text-2xl font-serif font-bold mb-3 text-cafe-main transition-colors duration-300">Ambil / Diantar</h3>
                        <p class="text-cafe-secondary max-w-xs mx-auto text-sm transition-colors duration-300">Pesanan akan disiapkan oleh tim. Tinggal ambil ke kasir atau langsung di antar ke meja Anda.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="py-32 relative bg-cafe-base transition-colors duration-300 scroll-mt-20">
            <div class="relative z-10 max-w-5xl mx-auto px-6 text-center reveal-element">
                <svg class="mx-auto mb-8 w-12 h-12 text-[#B45309]/50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.5 5.5v13a3 3 0 0 1-3 3H5.5a3 3 0 0 1-3-3v-13H21.5zm-5 5h-9v2h9v-2zm-9 4v2h6v-2h-6zM15 2a3 3 0 0 1 3 3v.5H6V5a3 3 0 0 1 3-3h6zm-2 2h-2v.5h2V4z" opacity="0.8"/>
                </svg>
                <h2 class="text-3xl md:text-5xl font-serif font-bold mb-8 leading-tight text-cafe-main transition-colors duration-300">Membawa Kenangan Klasik <br/>dalam Sajian <span class="text-[#B45309]">Masa Kini</span></h2>
                <p class="text-xl md:text-2xl text-cafe-secondary font-light max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
                    Denjavas Retro Café lahir dari kecintaan kami terhadap harmoni rasa tradisional Nusantara dan nuansa nostalgia. Setiap hidangan dan racikan kami sajikan dengan passion artisanal, menghadirkan kehangatan layaknya rumah.
                </p>
                <div class="mt-12 w-16 h-[1px] bg-[#B45309]/50 mx-auto"></div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-cafe-surface py-16 border-t border-cafe-border relative z-10 text-center transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 reveal-element delay-100">
                <!-- Branding -->
                <div class="mb-8">
                    <h2 class="text-3xl font-serif font-bold text-cafe-main mb-2 logo-anim transition-colors duration-300">Denjavas<span class="text-[#B45309]">.</span></h2>
                    <p class="text-[#B45309]/70 text-xs tracking-[0.3em] uppercase font-semibold">Retro Café</p>
                </div>
                
                <p class="text-cafe-secondary text-sm mb-6 transition-colors duration-300">
                    &copy; 2026 Denjavas Retro Café. All rights reserved. <br/>
                    Powered by Cafe POS System.
                </p>
                
                <div class="flex justify-center gap-6">
                    <a href="#" class="text-cafe-muted hover:text-[#B45309] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="#" class="text-cafe-muted hover:text-[#B45309] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    </a>
                    <a href="#" class="text-cafe-muted hover:text-[#B45309] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                </div>
            </div>
        </footer>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

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
    from { text-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
    to { text-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
}
.animate-fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-slow-zoom {
    animation: slowZoom 20s ease-out forwards;
}
@keyframes slowZoom {
    from { transform: scale(1.05); }
    to { transform: scale(1); }
}
.animate-bounce-slow {
    animation: bounceSlow 3s infinite;
}
@keyframes bounceSlow {
    0%, 100% { transform: translate(-50%, 0); }
    50% { transform: translate(-50%, -10px); }
}
.writing-mode-vertical {
    writing-mode: vertical-rl;
}

/* Scroll Reveal Classes */
.reveal-element {
    opacity: 0;
    transform: translateY(40px);
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
</style>
