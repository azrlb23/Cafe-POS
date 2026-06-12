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

const storeSettings = ref<Record<string, string>>({
  store_name: 'Denjavas Retro Café',
  store_phone: '+62 823-5343-8404',
  store_instagram: '@denjavas',
  store_facebook: 'https://web.facebook.com/people/Denjavas-Retro-Cafe/100063791491252/?locale=id_ID',
  store_address: 'Denjavas Jl. Penajam - Kuaro KM 16, Giri Mukti, Penajam, Kabupaten Penajam Paser Utara, Kalimantan Timur 76143',
  receipt_footer: 'Terima kasih atas kunjungan Anda!',
  hero_image_path: '',
  gallery_photo_1: '',
  gallery_photo_2: '',
  gallery_photo_3: '',
  gallery_photo_4: '',
  gallery_photo_5: '',
  gallery_photo_6: '',
});

const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return '/storage/' + path;
};

const currentIndex = ref(0);
const itemsPerPage = ref(3);

const fallbackMenus = [
    {
        name: 'Nasi Goreng Retro',
        basePrice: 45000,
        description: 'Perpaduan nasi goreng bumbu rempah Nusantara klasik dengan telur omelette.',
        imagePath: '/images/nusantara_dish_1775476113236.png',
        Category: { name: 'Makanan Utama' }
    },
    {
        name: 'Kopi Susu Senja',
        basePrice: 28000,
        description: 'Kopi espresso house-blend disajikan dingin dengan creamy milk dan gula aren.',
        imagePath: '/images/retro_coffee_1775476132920.png',
        Category: { name: 'Minuman Dingin' }
    },
    {
        name: 'Classic Choco Slice',
        basePrice: 35000,
        description: 'Kue cokelat premium lembut dilapisi cokelat ganache yang lumer manis pas.',
        imagePath: '/images/elegant_dessert_1775476149430.png',
        Category: { name: 'Kue Premium' }
    },
    {
        name: 'Teh Oolong Madu',
        basePrice: 24000,
        description: 'Seduhan teh oolong pegunungan dipadukan dengan kemurnian madu hutan alami.',
        imagePath: '/images/retro_coffee_1775476132920.png',
        Category: { name: 'Minuman Hangat' }
    },
    {
        name: 'Ayam Bakar Rempah',
        basePrice: 52000,
        description: 'Ayam kampung bakar bumbu rempah kelapa serundeng manis pedas gurih.',
        imagePath: '/images/nusantara_dish_1775476113236.png',
        Category: { name: 'Makanan Utama' }
    },
    {
        name: 'Es Dawet Ayu',
        basePrice: 20000,
        description: 'Dawet kenyal gula merah legit dan santan kelapa murni disajikan dengan es batu.',
        imagePath: '/images/elegant_dessert_1775476149430.png',
        Category: { name: 'Minuman Dingin' }
    }
];

const activeMenus = computed(() => {
    return featuredMenus.value && featuredMenus.value.length > 0 
        ? featuredMenus.value 
        : fallbackMenus;
});

const maxIndex = computed(() => {
    return Math.max(0, activeMenus.value.length - itemsPerPage.value);
});

const nextSlide = () => {
    if (currentIndex.value < maxIndex.value) {
        currentIndex.value++;
    } else {
        currentIndex.value = 0;
    }
};

const prevSlide = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    } else {
        currentIndex.value = maxIndex.value;
    }
};

const updateItemsPerPage = () => {
    if (window.innerWidth < 640) {
        itemsPerPage.value = 1;
    } else if (window.innerWidth < 1024) {
        itemsPerPage.value = 2;
    } else {
        itemsPerPage.value = 3;
    }
    if (currentIndex.value > maxIndex.value) {
        currentIndex.value = maxIndex.value;
    }
};

// Pointer event gesture states & handlers for Swiping
const isDragging = ref(false);
const startX = ref(0);
const dragOffset = ref(0);

const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    isDragging.value = true;
    startX.value = e.clientX;
    dragOffset.value = 0;
    
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.setPointerCapture(e.pointerId);
    }
};

const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.value) return;
    const currentX = e.clientX;
    dragOffset.value = currentX - startX.value;
};

const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.value) return;
    isDragging.value = false;
    
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
    
    const threshold = 60; // minimum movement to trigger slide change
    if (dragOffset.value < -threshold) {
        nextSlide();
    } else if (dragOffset.value > threshold) {
        prevSlide();
    }
    
    dragOffset.value = 0;
};

const handlePointerCancel = (e: PointerEvent) => {
    if (!isDragging.value) return;
    isDragging.value = false;
    dragOffset.value = 0;
    
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
};

const trackStyle = computed(() => {
    const basePercent = -currentIndex.value * (100 / itemsPerPage.value);
    
    if (isDragging.value && dragOffset.value !== 0) {
        const containerWidth = document.querySelector('.carousel-viewport')?.clientWidth || 1000;
        const dragPercent = (dragOffset.value / containerWidth) * 100;
        return {
            transform: `translateX(${basePercent + dragPercent}%)`,
            transition: 'none',
            cursor: 'grabbing'
        };
    }
    
    return {
        transform: `translateX(${basePercent}%)`,
        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        cursor: 'grab'
    };
});

// Custom Modal state
const showOrderModal = ref(false);
const selectedMenuToOrder = ref<any>(null);

// Booking Form & Lightbox State for SRS compliance
const bookingForm = ref({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 1,
    notes: ''
});

const submitBooking = () => {
    alert(`Reservasi berhasil dikirim atas nama ${bookingForm.value.name}. Kami akan mengonfirmasi via WhatsApp.`);
    bookingForm.value = { name: '', phone: '', date: '', time: '', guests: 1, notes: '' };
};

const activeLightboxImage = ref<string | null>(null);

const galleryCollages = computed(() => {
    const p1 = '/landingpage/g1.png';
    const p2 = '/landingpage/g2.png';
    const p3 = '/landingpage/g3.png';
    const p4 = '/landingpage/g4.png';
    const p5 = '/landingpage/g5.png';
    const p6 = '/landingpage/g6.png';

    return [
        {
            photos: [
                { img: p1, category: 'BARISTA', title: 'Sudut Kopi Klasik' },
                { img: p2, category: 'DESSERT', title: 'Kue Manis Estetis' },
                { img: p3, category: 'MINUMAN', title: 'Aroma Kopi Denjavas' },
                { img: p4, category: 'KULINER', title: 'Sajian Nusantara' }
            ]
        },
        {
            photos: [
                { img: p5, category: 'INTERIOR', title: 'Suasana Nyaman Retro' },
                { img: p2, category: 'DESSERT', title: 'Kue & Camilan Sore' },
                { img: p3, category: 'BARISTA', title: 'Mesin Espresso' },
                { img: p6, category: 'MINUMAN', title: 'Kopi Artisanal' }
            ]
        }
    ];
});

const currentCollageIndex = ref(0);
const isGalleryDragging = ref(false);
const galleryStartX = ref(0);
const galleryDragOffset = ref(0);

const handleGalleryPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isGalleryDragging.value = true;
    galleryStartX.value = e.clientX;
    galleryDragOffset.value = 0;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.setPointerCapture(e.pointerId);
    }
};

const handleGalleryPointerMove = (e: PointerEvent) => {
    if (!isGalleryDragging.value) return;
    galleryDragOffset.value = e.clientX - galleryStartX.value;
};

const handleGalleryPointerUp = (e: PointerEvent) => {
    if (!isGalleryDragging.value) return;
    isGalleryDragging.value = false;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
    
    const threshold = 60;
    if (galleryDragOffset.value < -threshold) {
        if (currentCollageIndex.value < galleryCollages.value.length - 1) {
            currentCollageIndex.value++;
        } else {
            currentCollageIndex.value = 0;
        }
    } else if (galleryDragOffset.value > threshold) {
        if (currentCollageIndex.value > 0) {
            currentCollageIndex.value--;
        } else {
            currentCollageIndex.value = galleryCollages.value.length - 1;
        }
    }
    galleryDragOffset.value = 0;
};

const handleGalleryPointerCancel = (e: PointerEvent) => {
    if (!isGalleryDragging.value) return;
    isGalleryDragging.value = false;
    galleryDragOffset.value = 0;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
};

const helpSlides = computed(() => {
    const waPhone = storeSettings.value.store_phone || "+62 823-5343-8404";
    const waLink = "https://wa.me/" + waPhone.replace(/[^0-9]/g, '');
    const igHandle = storeSettings.value.store_instagram || "@denjavas";
    const igLink = "https://instagram.com/" + igHandle.replace('@', '');
    const fbLink = storeSettings.value.store_facebook || "https://web.facebook.com/people/Denjavas-Retro-Cafe/100063791491252/?locale=id_ID";

    return [
        {
            title: "Tanya Jawab (FAQ)",
            subtitle: "Jawaban atas pertanyaan yang paling sering diajukan pelanggan.",
            type: "faq",
            items: [
                { q: "Apakah harus daftar member dulu?", a: "Tidak perlu. Anda bisa langsung memesan sebagai non-member. Namun, member mendapatkan keuntungan berupa poin loyalitas dan diskon khusus." },
                { q: "Apakah bisa membawa laptop sendiri?", a: "Sangat bisa. Kami menyediakan area WFC khusus dengan banyak stopkontak dan Wi-Fi super cepat gratis." },
                { q: "Apakah ada area non-smoking?", a: "Ya. Kami menyediakan ruangan indoor ber-AC bebas rokok (non-smoking) dan area outdoor yang nyaman untuk merokok." },
                { q: "Metode pembayaran apa saja yang diterima?", a: "Kami menerima Cash/Tunai, kartu Debit, QRIS (Gopay, OVO, ShopeePay, Dana, dll), serta Kartu Kredit." }
            ]
        },
        {
            title: "Panduan Pertama Kali",
            subtitle: `3 langkah mudah berkunjung ke ${storeSettings.value.store_name || 'Denjavas Retro Café'}.`,
            type: "guide",
            steps: [
                { number: "01", title: "Pilih Area Nyaman Anda", desc: "Pilih area indoor ber-AC untuk fokus bekerja (WFC) atau area outdoor asri untuk bersantai dengan rekan." },
                { number: "02", title: "Pesan & Bayar di Kasir", desc: "Sebutkan pesanan Anda ke kasir pintar kami dan bayar menggunakan metode non-tunai (QRIS) maupun tunai." },
                { number: "03", title: "Selesaikan & Nikmati Sajian", desc: "Duduk santai di meja Anda, barista kami akan mengantarkan pesanan. Akses Wi-Fi gratis sepuasnya tanpa batas." }
            ]
        },
        {
            title: "Kebijakan Penting",
            subtitle: "Aturan dasar demi kenyamanan bersama di area kafe.",
            type: "policies",
            items: [
                { label: "Kenyamanan WFC", desc: "Harap menggunakan headphone saat mendengarkan audio atau melakukan panggilan video di ruang indoor." },
                { label: "Usia Minimum Pengunjung", desc: "Pengunjung di bawah usia 12 tahun wajib selalu dalam pengawasan orang tua atau wali dewasa." },
                { label: "Keamanan Barang Pribadi", desc: "Jagalah barang bawaan Anda. Pihak manajemen tidak bertanggung jawab atas segala bentuk kehilangan." }
            ]
        },
        {
            title: "Kontak & Live Chat",
            subtitle: "Terhubung langsung dengan tim admin dan layanan pelanggan kami.",
            type: "chat",
            channels: [
                { name: "WhatsApp Chat", value: waPhone, link: waLink, sub: "Respon cepat 09:00 - 23:00" },
                { name: "Email Layanan", value: "hello@denjavas.com", link: "mailto:hello@denjavas.com", sub: "Pertanyaan kemitraan & kelompok" },
                { name: "Instagram DM", value: igHandle, link: igLink, sub: "Ikuti promo menarik kami" }
            ]
        }
    ];
});

const currentHelpIndex = ref(0);
const isHelpDragging = ref(false);
const helpStartX = ref(0);
const helpDragOffset = ref(0);

const handleHelpPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isHelpDragging.value = true;
    helpStartX.value = e.clientX;
    helpDragOffset.value = 0;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.setPointerCapture(e.pointerId);
    }
};

const handleHelpPointerMove = (e: PointerEvent) => {
    if (!isHelpDragging.value) return;
    helpDragOffset.value = e.clientX - helpStartX.value;
};

const handleHelpPointerUp = (e: PointerEvent) => {
    if (!isHelpDragging.value) return;
    isHelpDragging.value = false;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
    
    const threshold = 60;
    if (helpDragOffset.value < -threshold) {
        if (currentHelpIndex.value < helpSlides.value.length - 1) {
            currentHelpIndex.value++;
        } else {
            currentHelpIndex.value = 0;
        }
    } else if (helpDragOffset.value > threshold) {
        if (currentHelpIndex.value > 0) {
            currentHelpIndex.value--;
        } else {
            currentHelpIndex.value = helpSlides.value.length - 1;
        }
    }
    helpDragOffset.value = 0;
};

const handleHelpPointerCancel = (e: PointerEvent) => {
    if (!isHelpDragging.value) return;
    isHelpDragging.value = false;
    helpDragOffset.value = 0;
    const el = e.currentTarget as HTMLElement;
    if (el) {
        el.releasePointerCapture(e.pointerId);
    }
};

const events = ref([
    {
        id: 1,
        title: 'Retro Gaming Tournament',
        date: '15 Juni 2026',
        time: '18:00 - Selesai',
        desc: 'Kompetisi game klasik dengan konsol retro. Tunjukkan keahlianmu dan perebutkan total hadiah jutaan rupiah!',
        status: 'Registrasi Dibuka'
    },
    {
        id: 2,
        title: 'Nusantara Acoustic Night',
        date: '22 Juni 2026',
        time: '19:30 - 22:00',
        desc: 'Malam kehangatan musik akustik membawakan lagu-lagu klasik Nusantara. Disertai promo kopi susu senja buy 1 get 1.',
        status: 'Segera Datang'
    }
]);

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
        return getFallbackImage(menu.name, menu.Category?.name || menu.category?.name);
    }
    
    if (menu.imagePath.startsWith('/') || menu.imagePath.startsWith('http')) {
        return menu.imagePath;
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
    // Clear hash on initial mount/reload and force scroll to top of Hero
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0 });

    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 20;
    });

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);

    // Fetch featured menus and settings
    try {
        const response = await api.get('/admin/public-menus');
        featuredMenus.value = response.data.menus.filter((m: any) => m.isActive).slice(0, 8);
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

    ['menu', 'fasilitas', 'about', 'gallery', 'contact'].forEach(id => {
        const el = document.getElementById(id);
        if (el && spyObserver) spyObserver.observe(el);
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
    window.removeEventListener('resize', updateItemsPerPage);
    if (spyObserver) spyObserver.disconnect();
    if (revealObserver) revealObserver.disconnect();
});
</script>

<template>
    <div class="min-h-screen bg-cafe-base text-cafe-main font-sans selection:bg-cafe-accent selection:text-white overflow-x-hidden transition-colors duration-300">
        
        <!-- Navigation -->
        <nav :class="['fixed w-full z-50 transition-all duration-500 border-b', isScrolled ? 'bg-cafe-surface/90 backdrop-blur-md border-cafe-border py-4 shadow-sm' : 'bg-transparent border-transparent py-4 sm:py-6']">
            <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <!-- Logo -->
                <a href="#" @click="closeMobileMenu" class="flex items-center gap-3 group">
                    <span :class="['font-bold text-2xl tracking-widest font-serif logo-anim transition-colors duration-300', isScrolled ? 'text-cafe-accent group-hover:text-cafe-accent-hover' : 'text-[#C59B76] group-hover:text-white']">Denjavas</span>
                    <span :class="['tracking-[0.2em] text-[10px] hidden sm:block uppercase mt-1 transition-colors font-bold', isScrolled ? 'text-cafe-secondary/80' : 'text-stone-300']">Retro Café</span>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-6 items-center">
                    <a href="#about" :class="['text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', isScrolled ? (activeSection === 'about' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent') : (activeSection === 'about' ? 'text-[#C59B76]' : 'text-stone-300 hover:text-white')]">
                        About Us
                    </a>
                    <a href="#menu" :class="['text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', isScrolled ? (activeSection === 'menu' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent') : (activeSection === 'menu' ? 'text-[#C59B76]' : 'text-stone-300 hover:text-white')]">
                        Menu
                    </a>
                    <a href="#fasilitas" :class="['text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', isScrolled ? (activeSection === 'fasilitas' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent') : (activeSection === 'fasilitas' ? 'text-[#C59B76]' : 'text-stone-300 hover:text-white')]">
                        Fasilitas
                    </a>
                    <a href="#gallery" :class="['text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', isScrolled ? (activeSection === 'gallery' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent') : (activeSection === 'gallery' ? 'text-[#C59B76]' : 'text-stone-300 hover:text-white')]">
                        Gallery
                    </a>
                    <a href="#contact" :class="['text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cafe-accent after:transition-all hover:after:w-full', isScrolled ? (activeSection === 'contact' ? 'text-cafe-accent' : 'text-cafe-secondary hover:text-cafe-accent') : (activeSection === 'contact' ? 'text-[#C59B76]' : 'text-stone-300 hover:text-white')]">
                        Contact
                    </a>

                    <div :class="['w-px h-4 mx-1 transition-colors', isScrolled ? 'bg-cafe-border' : 'bg-stone-700/50']"></div>

                    <a href="#contact" class="bg-cafe-accent hover:bg-cafe-accent-hover text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
                        Hubungi Kami
                    </a>

                    <template v-if="user">
                        <router-link
                            :to="user.role === 'admin' ? { name: 'AdminDashboard' } : { name: 'Pos' }"
                            :class="['text-[10px] font-black transition-all uppercase tracking-[0.25em] flex items-center gap-1.5 ml-2', isScrolled ? 'text-cafe-accent hover:text-cafe-accent-hover' : 'text-[#C59B76] hover:text-white']"
                        >
                            App
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </router-link>
                    </template>
                </div>

                <!-- Mobile Hamburger Button -->
                <button @click="toggleMobileMenu" :class="['md:hidden p-2 focus:outline-none transition-colors', isScrolled ? 'text-cafe-main hover:text-cafe-accent' : 'text-stone-200 hover:text-white']">
                    <svg v-if="!isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            
            <!-- Mobile Menu Drawer -->
            <div :class="['md:hidden absolute top-full left-0 w-full bg-cafe-surface/95 backdrop-blur-lg border-b border-cafe-border transition-all duration-300 overflow-hidden', isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0']">
                <div class="flex flex-col px-6 py-4 gap-3">
                    <a href="#about" @click="closeMobileMenu" :class="['text-xs font-bold uppercase tracking-widest', activeSection === 'about' ? 'text-cafe-accent' : 'text-cafe-main']">About Us</a>
                    <a href="#menu" @click="closeMobileMenu" :class="['text-xs font-bold uppercase tracking-widest', activeSection === 'menu' ? 'text-cafe-accent' : 'text-cafe-main']">Menu</a>
                    <a href="#fasilitas" @click="closeMobileMenu" :class="['text-xs font-bold uppercase tracking-widest', activeSection === 'fasilitas' ? 'text-cafe-accent' : 'text-cafe-main']">Fasilitas</a>
                    <a href="#gallery" @click="closeMobileMenu" :class="['text-xs font-bold uppercase tracking-widest', activeSection === 'gallery' ? 'text-cafe-accent' : 'text-cafe-main']">Gallery</a>
                    <a href="#contact" @click="closeMobileMenu" :class="['text-xs font-bold uppercase tracking-widest', activeSection === 'contact' ? 'text-cafe-accent' : 'text-cafe-main']">Contact</a>
                    <div class="w-full h-px bg-cafe-border my-1"></div>
                    <a href="#contact" @click="closeMobileMenu" class="bg-cafe-accent text-white text-center text-xs font-bold uppercase tracking-widest py-3 rounded-xl">
                        Hubungi Kami
                    </a>
                    <template v-if="user">
                        <router-link :to="user.role === 'admin' ? { name: 'AdminDashboard' } : { name: 'Pos' }" class="text-xs font-bold text-cafe-accent uppercase tracking-widest flex items-center justify-center gap-2 py-2">
                            Ke Aplikasi
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        </router-link>
                    </template>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#18130F] text-white">
            <!-- Subtle Vintage Grid Background -->
            <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
            
            <!-- Fine Vintage Decorative Border -->
            <div class="absolute inset-6 z-0 border border-stone-800/40 pointer-events-none rounded-[2rem]"></div>
            <div class="absolute inset-8 z-0 border border-stone-900/20 pointer-events-none rounded-[1.8rem]"></div>

            <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col lg:flex-row items-center gap-16 mt-20 pb-12">
                <div class="flex-1 text-center lg:text-left animate-fade-in-up">
                    <div class="mb-6 inline-block">
                        <span class="text-[#C59B76] font-black tracking-[0.3em] text-[9px] uppercase border border-[#C59B76]/30 px-6 py-2.5 rounded-full bg-stone-900/60 backdrop-blur-sm shadow-sm">
                            EST. 2019
                        </span>
                    </div>
                    
                    <h1 class="text-3xl sm:text-6xl md:text-7xl font-serif font-black mb-8 leading-[1.15] tracking-tight text-stone-100">
                        Good Coffee <br class="hidden sm:inline" />
                        Good Vibes <br class="hidden sm:inline" />
                        <span class="text-[#C59B76] italic font-light font-serif">Great Day</span>
                    </h1>
                    
                    <p class="text-sm md:text-lg text-stone-400 mb-10 max-w-md leading-relaxed mx-auto lg:mx-0">
                        A cozy place to enjoy delicious food, great coffee and good times.
                    </p>
                    
                    <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center lg:justify-start w-full">
                        <a href="#menu" class="w-full sm:w-auto bg-cafe-accent hover:bg-cafe-accent-hover text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 uppercase text-[10px] tracking-widest">
                            EXPLORE MENU
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="stroke-current" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        
                        <a href="#about" class="w-full sm:w-auto text-stone-300 hover:text-white transition-colors flex items-center justify-center gap-3 font-bold uppercase text-[10px] tracking-widest py-3.5 sm:py-4 hover:-translate-y-0.5">
                            <span class="w-10 h-10 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-white transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-stone-300 pl-0.5"><path d="M8 5v14l11-7z"/></svg>
                            </span>
                            WATCH VIDEO
                        </a>
                    </div>
                </div>

                <!-- Floating Editorial Photograph Frame (Modern Retro Style) -->
                <div class="flex-1 relative animate-fade-in-up delay-300 hidden lg:block h-[500px]">
                    <div class="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-stone-900/60 shadow-2xl bg-stone-950">
                        <img src="/landingpage/hero.png" class="w-full h-full object-cover opacity-90 scale-105 group-hover:scale-100 transition-all duration-1000" alt="Good Coffee Good Vibes" />
                        <!-- Dark fade overlay from left to blend into the background -->
                        <div class="absolute inset-0 bg-gradient-to-r from-[#18130F] via-transparent to-transparent"></div>
                    </div>
                </div>
            </div>
            
            <!-- Torn Paper Bottom Edge Transition -->
            <div class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden h-14">
                <svg class="absolute bottom-0 w-full h-12 text-white fill-current preserve-3d" viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path d="M0,50 L40,43 L80,55 L120,38 L160,45 L200,32 L240,48 L280,35 L320,42 L360,55 L400,38 L440,47 L480,33 L520,40 L560,52 L600,35 L640,45 L680,38 L720,48 L760,32 L800,42 L840,55 L880,38 L920,47 L960,33 L1000,45 L1040,32 L1080,48 L1120,35 L1160,42 L1200,55 L1240,38 L1280,45 L1320,32 L1360,48 L1400,35 L1440,42 L1440,100 L0,100 Z" class="fill-white"></path>
                    <path d="M0,60 L50,55 L100,65 L150,48 L200,58 L250,45 L300,62 L350,48 L400,55 L450,65 L500,48 L550,58 L600,43 L650,55 L700,48 L750,62 L800,45 L850,55 L900,65 L950,48 L1000,58 L1050,43 L1100,55 L1150,48 L1200,62 L1250,45 L1300,55 L1350,65 L1400,48 L1440,58 L1440,100 L0,100 Z" class="fill-white/30"></path>
                </svg>
            </div>
        </section>

        <!-- Fasilitas & Keunggulan Section (FR-03 & FR-04) -->
        <section id="fasilitas" class="py-16 sm:py-24 lg:py-32 bg-white relative transition-colors duration-300 scroll-mt-20">
            <!-- Background Decoration -->
            <div class="absolute inset-0 z-0 bg-[radial-gradient(#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-80"></div>
            
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-12 sm:mb-24 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">KENAPA PILIH KAMI</span>
                    <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Keunggulan & Fasilitas</h2>
                    <div class="w-16 h-0.5 bg-cafe-accent/30 mx-auto rounded-full"></div>
                </div>

                <!-- Circular Feature Layout (Coffee Made Easy Style) -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center max-w-6xl mx-auto reveal-element delay-200">
                    
                    <!-- Left features (2 columns on mobile, stacked on desktop) -->
                    <div class="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-12 lg:space-y-12 w-full text-center lg:text-right">
                        <!-- Point 1: Bumbu Autentik -->
                        <div class="group bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between items-center lg:items-end shadow-sm hover:shadow-md transition-all duration-300">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-cafe-base rounded-full flex items-center justify-center text-cafe-accent mb-3 lg:ml-auto shadow-sm group-hover:bg-cafe-accent group-hover:text-white transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                            <h3 class="text-xs sm:text-lg font-serif font-bold mb-1.5 text-cafe-main group-hover:text-cafe-accent transition-colors">Bumbu Autentik Nusantara</h3>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed max-w-sm mx-auto lg:ml-auto lg:mr-0">Racikan bumbu tradisional warisan segar untuk cita rasa Nusantara sejati.</p>
                        </div>

                        <!-- Point 2: Kopi Pilihan -->
                        <div class="group bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between items-center lg:items-end shadow-sm hover:shadow-md transition-all duration-300">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-cafe-base rounded-full flex items-center justify-center text-cafe-accent mb-3 lg:ml-auto shadow-sm group-hover:bg-cafe-accent group-hover:text-white transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>
                            </div>
                            <h3 class="text-xs sm:text-lg font-serif font-bold mb-1.5 text-cafe-main group-hover:text-cafe-accent transition-colors">Kopi Artisanal Pilihan</h3>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed max-w-sm mx-auto lg:ml-auto lg:mr-0">Diseduh secara teliti oleh barista berpengalaman menggunakan biji kopi lokal berkualitas tinggi.</p>
                        </div>
                    </div>

                    <!-- Center graphic (Rotating / Floating Coffee Cup Image with Dotted Circles) -->
                    <div class="relative flex items-center justify-center py-6 lg:py-8">
                        <!-- Dotted circle layers -->
                        <div class="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-dashed border-cafe-border animate-[spin_60s_linear_infinite]"></div>
                        <div class="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-dotted border-cafe-accent/20 animate-[spin_80s_linear_infinite_reverse]"></div>
                        
                        <!-- Main Central image (No background, floating coffee cup) -->
                        <div class="relative w-40 h-40 sm:w-64 sm:h-64 flex items-center justify-center transform hover:scale-110 transition-all duration-700">
                            <img src="/images/coffee_no_bg.png" class="w-full h-full object-contain mix-blend-multiply" alt="Denjavas Signature Coffee" />
                        </div>
                    </div>

                    <!-- Right features (2 columns on mobile, stacked on desktop) -->
                    <div class="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-12 lg:space-y-12 w-full text-center lg:text-left">
                        <!-- Point 3: Ruang Kerja & Diskusi -->
                        <div class="group bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between items-center lg:items-start shadow-sm hover:shadow-md transition-all duration-300">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-cafe-base rounded-full flex items-center justify-center text-cafe-accent mb-3 lg:mr-auto shadow-sm group-hover:bg-cafe-accent group-hover:text-white transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M7 20v-4h10v4"/></svg>
                            </div>
                            <h3 class="text-xs sm:text-lg font-serif font-bold mb-1.5 text-cafe-main group-hover:text-cafe-accent transition-colors">Ruang Kerja & Diskusi</h3>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed max-w-sm mx-auto lg:ml-0">Area bernuansa retro klasik dengan sudut-sudut estetis khusus untuk rapat kelompok.</p>
                        </div>

                        <!-- Point 4: Wifi Serat Optik -->
                        <div class="group bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl flex flex-col justify-between items-center lg:items-start shadow-sm hover:shadow-md transition-all duration-300">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-cafe-base rounded-full flex items-center justify-center text-cafe-accent mb-3 lg:mr-auto shadow-sm group-hover:bg-cafe-accent group-hover:text-white transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.38 8.86a16.89 16.89 0 0 1 21.24 0M8.5 16.43a6.83 6.83 0 0 1 7 0M12 20h.01"/></svg>
                            </div>
                            <h3 class="text-xs sm:text-lg font-serif font-bold mb-1.5 text-cafe-main group-hover:text-cafe-accent transition-colors">Wifi Serat Optik 150 Mbps</h3>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed max-w-sm mx-auto lg:ml-0">Jaringan internet nirkabel serat optik kecepatan tinggi yang stabil untuk tugas atau streaming.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Menu / Best Seller (Carousel Showcase Layout) -->
        <section id="menu" class="py-16 sm:py-24 lg:py-32 relative bg-cafe-base border-y border-cafe-border/50 scroll-mt-20 overflow-hidden">
            <div class="max-w-7xl mx-auto px-6 relative">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-16 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">PILIHAN KASIR</span>
                    <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Menu Andalan Kami</h2>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-px bg-cafe-border"></div>
                        <span class="text-cafe-accent text-xs">◆</span>
                        <div class="w-12 h-px bg-cafe-border"></div>
                    </div>
                </div>

                <!-- Carousel Viewport Wrapper -->
                <div class="relative px-0 reveal-element delay-200">
                    <!-- Viewport -->
                    <div 
                        class="overflow-hidden w-full py-4 carousel-viewport select-none touch-pan-y"
                        @pointerdown="handlePointerDown"
                        @pointermove="handlePointerMove"
                        @pointerup="handlePointerUp"
                        @pointercancel="handlePointerCancel"
                    >
                        <div 
                            class="flex" 
                            :style="trackStyle"
                        >
                            <div 
                                v-for="(menu, idx) in activeMenus" 
                                :key="idx" 
                                class="flex-shrink-0 px-4 transition-all duration-500"
                                :style="{ width: (100 / itemsPerPage) + '%' }"
                            >
                                <!-- Beautiful retro menu card (Web style, matches PublicMenu) -->
                                <div class="group flex flex-col h-full bg-cafe-surface rounded-3xl overflow-hidden border border-cafe-border hover:border-cafe-accent/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative">
                                    <!-- Image Section (Aspect 4/3) -->
                                    <div class="aspect-[4/3] bg-white relative overflow-hidden border-b border-cafe-border/40">
                                        <!-- Badges (Signature / Best Seller) -->
                                        <div v-if="idx === 0" class="absolute top-3 left-3 z-20 bg-cafe-accent text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                                            Signature
                                        </div>
                                        <div v-else-if="idx === 1" class="absolute top-3 left-3 z-20 bg-cafe-main text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                                            Best Seller
                                        </div>
                                        <img :src="getMenuImage(menu)" :alt="menu.name" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                        <div class="absolute inset-0 bg-amber-900/5 mix-blend-multiply pointer-events-none"></div>
                                    </div>
                                    
                                    <!-- Card Content Body -->
                                    <div class="p-6 flex flex-col flex-grow justify-between bg-cafe-surface">
                                        <div class="space-y-2">
                                            <span class="text-[9px] font-black text-cafe-accent uppercase tracking-widest block">{{ menu.Category?.name || menu.category?.name || 'Sajian' }}</span>
                                            <h3 class="text-sm sm:text-lg font-serif font-bold text-cafe-main mt-1 mb-2 group-hover:text-cafe-accent transition-colors line-clamp-1">{{ menu.name }}</h3>
                                            <p class="text-cafe-secondary text-[11px] sm:text-xs leading-relaxed line-clamp-2 italic">{{ menu.description || 'Tidak ada deskripsi untuk menu klasik ini.' }}</p>
                                        </div>
                                        
                                        <div class="flex items-center justify-between border-t border-cafe-border/50 pt-4 mt-6">
                                            <span class="text-xs sm:text-sm font-bold text-cafe-accent tracking-wide">
                                                {{ typeof menu.basePrice === 'number' ? formatPrice(menu.basePrice) : menu.price || formatPrice(menu.basePrice) }}
                                            </span>
                                            
                                            <button @click="openOrderModal(menu)" class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-cafe-main hover:text-cafe-accent transition-all group/btn cursor-pointer">
                                                Pesan
                                                <span class="w-7 h-7 rounded-full border border-cafe-border flex items-center justify-center group-hover/btn:bg-cafe-accent group-hover/btn:border-cafe-accent group-hover/btn:text-white transition-all duration-300">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bullet Dot Indicators -->
                    <div class="flex justify-center gap-2.5 mt-8">
                        <button 
                            v-for="index in (maxIndex + 1)" 
                            :key="index"
                            @click="currentIndex = index - 1"
                            :class="[
                                'h-2 rounded-full transition-all duration-300 cursor-pointer',
                                currentIndex === index - 1 ? 'w-8 bg-cafe-accent' : 'w-2 bg-cafe-border hover:bg-cafe-accent/50'
                            ]"
                            :aria-label="'Go to slide ' + index"
                        ></button>
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



        <!-- Tentang Kami & Galeri Nostalgia Terpadu (FR-07 & FR-08) -->
        <section id="about" class="py-16 sm:py-24 lg:py-32 bg-cafe-base relative border-t border-cafe-border/50 scroll-mt-20">
            <!-- Anchor for Gallery link to land correctly -->
            <div id="gallery" class="absolute top-0 left-0 scroll-mt-20"></div>

            <div class="max-w-7xl mx-auto px-8 relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    
                    <!-- Left: Narrative Text & Kisah Kami -->
                    <div class="lg:col-span-5 space-y-6 sm:space-y-8 reveal-element text-left">
                        <div>
                            <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] font-bold">KISAH & NOSTALGIA KAMI</span>
                            <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main leading-[1.1] mt-2 mb-4">
                                Kisah di Balik Cita Rasa Kopi Denjavas
                            </h2>
                            <div class="w-12 h-0.5 bg-cafe-accent/30 rounded-full"></div>
                        </div>
                        
                        <!-- 2-Column Cards on Mobile, Stacked on Desktop -->
                        <div class="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6 w-full">
                            <div class="bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <p class="text-cafe-secondary text-[10px] sm:text-xs md:text-sm leading-relaxed">
                                    Denjavas Retro Café lahir dari kecintaan mendalam pada harmoni rasa tradisional Nusantara dan nuansa nostalgia klasik yang tak lekang waktu. Kami memadukan biji kopi artisanal lokal pilihan dengan racikan resep warisan asli untuk menyajikan momen bersantap yang istimewa.
                                </p>
                            </div>
                            <div class="bg-white border border-cafe-border/80 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <p class="text-cafe-secondary text-[10px] sm:text-xs md:text-sm leading-relaxed">
                                    Setiap cangkir kopi dan hidangan yang kami sajikan diracik dengan penuh ketelitian oleh barista dan juru masak berpengalaman kami. Kami percaya bahwa rasa yang jujur dapat mengantarkan kehangatan layaknya rumah, menciptakan cerita baru di setiap sudut nostalgia.
                                </p>
                            </div>
                        </div>
                        
                        <div class="pt-2">
                            <a href="#menu" class="w-full sm:w-auto text-center bg-cafe-accent hover:bg-cafe-accent-hover text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md inline-block uppercase text-[10px] tracking-widest cursor-pointer">
                                LIHAT MENU KAMI
                            </a>
                        </div>
                    </div>

                    <!-- Right: Swipeable Collage -->
                    <div class="lg:col-span-7 reveal-element delay-200">
                        <div 
                            @pointerdown="handleGalleryPointerDown"
                            @pointermove="handleGalleryPointerMove"
                            @pointerup="handleGalleryPointerUp"
                            @pointercancel="handleGalleryPointerCancel"
                            class="relative select-none touch-pan-y cursor-grab active:cursor-grabbing group/gallery"
                        >
                            <!-- Collage Slides -->
                            <transition name="photo-fade" mode="out-in">
                                <div :key="currentCollageIndex" class="grid grid-cols-12 gap-4 sm:gap-6 items-center">
                                    <!-- Column 1 -->
                                    <div class="col-span-6 space-y-4 sm:space-y-6">
                                        <div 
                                            @click="activeLightboxImage = galleryCollages[currentCollageIndex].photos[0].img" 
                                            class="relative rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] h-56 sm:h-72 cursor-zoom-in group/img"
                                        >
                                            <img :src="galleryCollages[currentCollageIndex].photos[0].img" :alt="galleryCollages[currentCollageIndex].photos[0].title" class="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-700" />
                                            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <span class="text-[8px] sm:text-[9px] text-[#C59B76] uppercase tracking-widest font-black mb-1">{{ galleryCollages[currentCollageIndex].photos[0].category }}</span>
                                                <h4 class="text-white font-serif font-bold text-xs sm:text-sm">{{ galleryCollages[currentCollageIndex].photos[0].title }}</h4>
                                            </div>
                                        </div>
                                        <div 
                                            @click="activeLightboxImage = galleryCollages[currentCollageIndex].photos[1].img" 
                                            class="relative rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] h-36 sm:h-48 cursor-zoom-in group/img"
                                        >
                                            <img :src="galleryCollages[currentCollageIndex].photos[1].img" :alt="galleryCollages[currentCollageIndex].photos[1].title" class="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-700" />
                                            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <span class="text-[8px] sm:text-[9px] text-[#C59B76] uppercase tracking-widest font-black mb-1">{{ galleryCollages[currentCollageIndex].photos[1].category }}</span>
                                                <h4 class="text-white font-serif font-bold text-xs sm:text-sm">{{ galleryCollages[currentCollageIndex].photos[1].title }}</h4>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Column 2 -->
                                    <div class="col-span-6 space-y-4 sm:space-y-6 mt-8 lg:mt-12">
                                        <div 
                                            @click="activeLightboxImage = galleryCollages[currentCollageIndex].photos[2].img" 
                                            class="relative rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] h-36 sm:h-48 cursor-zoom-in group/img"
                                        >
                                            <img :src="galleryCollages[currentCollageIndex].photos[2].img" :alt="galleryCollages[currentCollageIndex].photos[2].title" class="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-700" />
                                            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <span class="text-[8px] sm:text-[9px] text-[#C59B76] uppercase tracking-widest font-black mb-1">{{ galleryCollages[currentCollageIndex].photos[2].category }}</span>
                                                <h4 class="text-white font-serif font-bold text-xs sm:text-sm">{{ galleryCollages[currentCollageIndex].photos[2].title }}</h4>
                                            </div>
                                        </div>
                                        <div 
                                            @click="activeLightboxImage = galleryCollages[currentCollageIndex].photos[3].img" 
                                            class="relative rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] h-56 sm:h-72 cursor-zoom-in group/img"
                                        >
                                            <img :src="galleryCollages[currentCollageIndex].photos[3].img" :alt="galleryCollages[currentCollageIndex].photos[3].title" class="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-700" />
                                            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <span class="text-[8px] sm:text-[9px] text-[#C59B76] uppercase tracking-widest font-black mb-1">{{ galleryCollages[currentCollageIndex].photos[3].category }}</span>
                                                <h4 class="text-white font-serif font-bold text-xs sm:text-sm">{{ galleryCollages[currentCollageIndex].photos[3].title }}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </transition>

                            <!-- Swipe indicator dots -->
                            <div class="flex justify-center gap-2 mt-8">
                                <button 
                                    v-for="(collage, idx) in galleryCollages" 
                                    :key="idx"
                                    @click="currentCollageIndex = idx"
                                    :class="['w-2 h-2 rounded-full transition-all duration-300 cursor-pointer', currentCollageIndex === idx ? 'bg-cafe-accent w-6' : 'bg-cafe-border hover:bg-cafe-accent/40']"
                                    :aria-label="'Go to collage slide ' + (idx + 1)"
                                ></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimoni (FR-09) -->
        <section id="testimoni" class="py-16 sm:py-24 lg:py-32 bg-cafe-base relative border-t border-cafe-border/50 scroll-mt-20">
            <div class="max-w-7xl mx-auto px-6">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-12 sm:mb-20 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">ULASAN PELANGGAN</span>
                    <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Apa Kata Mereka</h2>
                    <div class="w-16 h-0.5 bg-cafe-accent/30 mx-auto rounded-full"></div>
                </div>

                <!-- Testimonial Grid (2 columns on mobile, 3 columns on desktop) -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto reveal-element delay-200">
                    <!-- Testimoni 1 -->
                    <div class="col-span-1 bg-white border border-cafe-border p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl relative shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                        <div>
                            <!-- Star Rating -->
                            <div class="flex gap-1 text-amber-500 mb-3 sm:mb-6 text-[10px] sm:text-sm">
                                <span v-for="i in 5" :key="i">★</span>
                            </div>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs italic leading-relaxed mb-4 sm:mb-8">
                                "Tempat favorit saya untuk WFC. Kopi susunya juara, rasanya pas tidak terlalu manis, dan koneksi wifinya cepat & stabil untuk video call."
                            </p>
                        </div>
                        <div class="flex items-center gap-2 sm:gap-3.5 border-t border-cafe-border/60 pt-4">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cafe-base border border-cafe-border flex items-center justify-center font-bold text-cafe-accent font-serif text-xs sm:text-base">B</div>
                            <div>
                                <h4 class="font-serif font-bold text-cafe-main text-[10px] sm:text-xs">Budi Santoso</h4>
                                <span class="text-[7px] sm:text-[8px] text-cafe-muted uppercase tracking-wider font-bold">Local Guide</span>
                            </div>
                        </div>
                    </div>

                    <!-- Testimoni 2 -->
                    <div class="col-span-1 bg-white border border-cafe-border p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl relative shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                        <div>
                            <div class="flex gap-1 text-amber-500 mb-3 sm:mb-6 text-[10px] sm:text-sm">
                                <span v-for="i in 5" :key="i">★</span>
                            </div>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs italic leading-relaxed mb-4 sm:mb-8">
                                "Fasilitas PC di gaming area-nya spec dewa! Sangat seru nongkrong di sini bareng teman-teman kuliah sambil mengerjakan tugas kuliah."
                            </p>
                        </div>
                        <div class="flex items-center gap-2 sm:gap-3.5 border-t border-cafe-border/60 pt-4">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cafe-base border border-cafe-border flex items-center justify-center font-bold text-cafe-accent font-serif text-xs sm:text-base">A</div>
                            <div>
                                <h4 class="font-serif font-bold text-cafe-main text-[10px] sm:text-xs">Amanda Putri</h4>
                                <span class="text-[7px] sm:text-[8px] text-cafe-muted uppercase tracking-wider font-bold">Mahasiswi</span>
                            </div>
                        </div>
                    </div>

                    <!-- Testimoni 3 -->
                    <div class="col-span-2 md:col-span-1 bg-white border border-cafe-border p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl relative shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                        <div>
                            <div class="flex gap-1 text-amber-500 mb-3 sm:mb-6 text-[10px] sm:text-sm">
                                <span v-for="i in 5" :key="i">★</span>
                            </div>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs italic leading-relaxed mb-4 sm:mb-8">
                                "Makanan utamanya sangat lezat, terutama nasi goreng bumbu rempahnya. Layanan kasirnya sangat modern dan cepat, stafnya juga ramah."
                            </p>
                        </div>
                        <div class="flex items-center gap-2 sm:gap-3.5 border-t border-cafe-border/60 pt-4">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cafe-base border border-cafe-border flex items-center justify-center font-bold text-cafe-accent font-serif text-xs sm:text-base">R</div>
                            <div>
                                <h4 class="font-serif font-bold text-cafe-main text-[10px] sm:text-xs">Rian Hidayat</h4>
                                <span class="text-[7px] sm:text-[8px] text-cafe-muted uppercase tracking-wider font-bold">Software Engineer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Lokasi Cafe (FR-11) -->
        <section id="lokasi" class="py-16 sm:py-24 lg:py-32 bg-cafe-base relative border-t border-cafe-border/50 scroll-mt-20">
            <div class="max-w-7xl mx-auto px-6">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-12 sm:mb-20 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">KUNJUNGI KAMI</span>
                    <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Peta & Lokasi Cafe</h2>
                    <div class="w-16 h-0.5 bg-cafe-accent/30 mx-auto rounded-full"></div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center reveal-element delay-200">
                    <!-- Google Maps Frame -->
                    <div class="lg:col-span-7 rounded-3xl overflow-hidden border border-cafe-border shadow-sm relative h-72 sm:h-96 w-full">
                        <iframe 
                            src="https://maps.google.com/maps?q=Denjavas%20Retro%20Cafe,%20Giri%20Mukti,%20Penajam&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                            class="w-full h-full border-none" 
                            allowfullscreen="true" 
                            loading="lazy"
                        ></iframe>
                    </div>

                    <!-- Sidebar Info (2 columns on mobile, 3 columns on tablet, stacked on desktop) -->
                    <div class="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-6 w-full">
                        <div class="col-span-1 lg:col-span-1 bg-white border border-cafe-border p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
                            <h4 class="font-serif font-bold text-cafe-main text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2">Alamat Lengkap</h4>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed">
                                Denjavas Jl. Penajam - Kuaro KM 16, Giri Mukti, Penajam, Kabupaten Penajam Paser Utara, Kalimantan Timur 76143.
                            </p>
                        </div>
                        <div class="col-span-1 lg:col-span-1 bg-white border border-cafe-border p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
                            <h4 class="font-serif font-bold text-cafe-main text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2">Panduan Transportasi</h4>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed">
                                Terletak strategis di pinggir jalan raya utama poros Penajam - Kuaro KM 16. Sangat mudah diakses dengan transportasi umum atau pribadi.
                            </p>
                        </div>
                        <div class="col-span-2 md:col-span-1 lg:col-span-1 bg-white border border-cafe-border p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
                            <h4 class="font-serif font-bold text-cafe-main text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2">Informasi Parkir</h4>
                            <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed">
                                Tersedia area parkir luar yang lapang dan aman untuk kendaraan roda empat maupun roda dua, dilengkapi CCTV pemantau 24 jam.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Kontak & Info (FR-12 - Minimalist Need Help Style) -->
        <section id="contact" class="py-16 sm:py-24 lg:py-32 bg-white relative transition-colors duration-300 scroll-mt-20">
            <!-- Background Decoration -->
            <div class="absolute inset-0 z-0 bg-[radial-gradient(#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-80"></div>

            <div class="max-w-4xl mx-auto px-8 relative z-10">
                <!-- Section Header -->
                <div class="flex flex-col items-center text-center mb-12 reveal-element">
                    <span class="text-cafe-accent text-xs uppercase tracking-[0.25em] mb-4 font-bold">PUSAT BANTUAN</span>
                    <h2 class="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-cafe-main mb-6">Need Help?</h2>
                    <div class="w-16 h-0.5 bg-cafe-accent/30 mx-auto rounded-full"></div>
                </div>

                <!-- Slide tabs (Horizontally scrollable on mobile, centered on desktop) -->
                <div class="flex flex-nowrap overflow-x-auto pb-3 gap-2 mb-8 w-full max-w-full justify-start sm:justify-center no-scrollbar scroll-smooth reveal-element delay-100">
                    <button 
                        v-for="(slide, idx) in helpSlides" 
                        :key="idx" 
                        @click="currentHelpIndex = idx"
                        :class="['shrink-0 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer', 
                            currentHelpIndex === idx 
                                ? 'bg-cafe-accent text-white border-cafe-accent shadow-sm' 
                                : 'bg-cafe-base text-cafe-secondary border-cafe-border hover:bg-white'
                        ]"
                    >
                        {{ slide.title }}
                    </button>
                </div>

                <!-- Swipable Outer Card Container -->
                <div 
                    @pointerdown="handleHelpPointerDown"
                    @pointermove="handleHelpPointerMove"
                    @pointerup="handleHelpPointerUp"
                    @pointercancel="handleHelpPointerCancel"
                    class="relative select-none touch-pan-y cursor-grab active:cursor-grabbing reveal-element delay-200"
                >
                    <!-- Outer double vintage border card -->
                    <div class="bg-cafe-base border-2 border-cafe-accent/30 p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl relative min-h-[420px] flex flex-col justify-between">
                        <div class="absolute inset-3 border border-cafe-border pointer-events-none rounded-[1.6rem] sm:rounded-[2rem]"></div>
                        
                        <!-- Header inside slide -->
                        <div class="relative z-10 text-center mb-6">
                            <h3 class="text-base sm:text-2xl font-serif font-black text-cafe-main mb-2">
                                {{ helpSlides[currentHelpIndex].title }}
                            </h3>
                            <p class="text-[11px] sm:text-xs text-cafe-secondary max-w-lg mx-auto">
                                {{ helpSlides[currentHelpIndex].subtitle }}
                            </p>
                            <div class="w-12 h-0.5 bg-cafe-accent/20 mx-auto mt-4 rounded-full"></div>
                        </div>

                        <!-- Slide Body Content -->
                        <div class="relative z-10 flex-grow flex items-center justify-center py-4">
                            <!-- Type 1: FAQ Slide (2 columns on mobile, 2 columns on desktop) -->
                            <div v-if="helpSlides[currentHelpIndex].type === 'faq'" class="w-full grid grid-cols-2 gap-3 sm:gap-4 text-left">
                                <div 
                                    v-for="(item, itemIdx) in helpSlides[currentHelpIndex].items" 
                                    :key="itemIdx"
                                    class="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-cafe-border/80 flex flex-col justify-between"
                                >
                                    <h4 class="font-serif font-bold text-[10px] sm:text-xs text-cafe-main mb-2 flex items-start gap-1">
                                        <span class="text-cafe-accent font-black">Q:</span>
                                        <span>{{ item.q }}</span>
                                    </h4>
                                    <p class="text-[9px] sm:text-[11px] text-cafe-secondary leading-relaxed">
                                        {{ item.a }}
                                    </p>
                                </div>
                            </div>

                            <!-- Type 2: Guide Slide (2 columns on mobile with 3rd step spanning full width) -->
                            <div v-else-if="helpSlides[currentHelpIndex].type === 'guide'" class="w-full grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left">
                                <div 
                                    v-for="(step, stepIdx) in helpSlides[currentHelpIndex].steps" 
                                    :key="stepIdx"
                                    class="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-cafe-border/80 relative overflow-hidden"
                                    :class="stepIdx === 2 ? 'col-span-2 md:col-span-1' : 'col-span-1'"
                                >
                                    <span class="absolute top-2 right-3 font-serif font-black text-xl sm:text-2xl text-cafe-accent/15">
                                        {{ step.number }}
                                    </span>
                                    <h4 class="font-serif font-bold text-[10px] sm:text-xs text-cafe-main mb-1.5 mt-1">
                                        {{ step.title }}
                                    </h4>
                                    <p class="text-[9px] sm:text-[11px] text-cafe-secondary leading-relaxed">
                                        {{ step.desc }}
                                    </p>
                                </div>
                            </div>

                            <!-- Type 3: Policies Slide (2 columns on mobile with 3rd item spanning full width) -->
                            <div v-else-if="helpSlides[currentHelpIndex].type === 'policies'" class="w-full grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left">
                                <div 
                                    v-for="(policy, policyIdx) in helpSlides[currentHelpIndex].items" 
                                    :key="policyIdx"
                                    class="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-cafe-border/80"
                                    :class="policyIdx === 2 ? 'col-span-2 md:col-span-1' : 'col-span-1'"
                                >
                                    <h4 class="font-serif font-bold text-[10px] sm:text-xs text-cafe-main mb-1.5">
                                        {{ policy.label }}
                                    </h4>
                                    <p class="text-[9px] sm:text-[11px] text-cafe-secondary leading-relaxed">
                                        {{ policy.desc }}
                                    </p>
                                </div>
                            </div>

                            <!-- Type 4: Chat & Channels Slide (2 columns on mobile with 3rd item spanning full width) -->
                            <div v-else-if="helpSlides[currentHelpIndex].type === 'chat'" class="w-full grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-center">
                                <div 
                                    v-for="(channel, channelIdx) in helpSlides[currentHelpIndex].channels" 
                                    :key="channelIdx"
                                    class="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-cafe-border/80 flex flex-col items-center justify-between"
                                    :class="channelIdx === 2 ? 'col-span-2 md:col-span-1' : 'col-span-1'"
                                >
                                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cafe-base flex items-center justify-center text-cafe-accent mb-2 sm:mb-3">
                                        <svg v-if="channel.name.includes('WhatsApp')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                        <svg v-else-if="channel.name.includes('Email')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                    </div>
                                    <h4 class="font-serif font-bold text-[10px] sm:text-xs text-cafe-main mb-0.5">
                                        {{ channel.name }}
                                    </h4>
                                    <p class="text-[7px] sm:text-[9px] text-cafe-muted uppercase tracking-wider font-bold mb-1.5">
                                        {{ channel.sub }}
                                    </p>
                                    <a 
                                        :href="channel.link" 
                                        target="_blank" 
                                        class="mt-1 text-[9px] sm:text-xs font-bold text-cafe-accent hover:underline break-all"
                                    >
                                        {{ channel.value }}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Footer indicator dots -->
                        <div class="relative z-10 flex justify-center gap-1.5 mt-4">
                            <button 
                                v-for="(slide, idx) in helpSlides" 
                                :key="idx" 
                                @click="currentHelpIndex = idx"
                                :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', 
                                    currentHelpIndex === idx ? 'bg-cafe-accent w-4' : 'bg-cafe-border/80 hover:bg-cafe-accent/40'
                                ]"
                                :aria-label="'Go to help slide ' + (idx + 1)"
                            ></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-cafe-surface py-12 sm:py-16 lg:py-20 border-t border-cafe-border/60 text-left relative z-10">
            <div class="max-w-7xl mx-auto px-8 reveal-element">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    <!-- Column 1: Brand & Tagline -->
                    <div class="space-y-6">
                        <div>
                            <h2 class="text-3xl font-serif font-black text-cafe-main mb-2">{{ storeSettings.store_name }}<span class="text-cafe-accent">.</span></h2>
                            <p class="text-cafe-accent text-[9px] tracking-[0.3em] uppercase font-black">Retro Café & Eatery</p>
                        </div>
                        <p class="text-cafe-secondary text-xs leading-relaxed max-w-xs">
                            Harmoni rasa kopi klasik Nusantara dan hidangan legendaris dalam kenyamanan nostalgia.
                        </p>
                        <div class="flex gap-4">
                            <a :href="storeSettings.store_facebook" target="_blank" class="w-8 h-8 rounded-full border border-cafe-border flex items-center justify-center text-cafe-secondary hover:text-cafe-accent hover:border-cafe-accent transition-colors shadow-sm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </a>
                            <a :href="'https://instagram.com/' + storeSettings.store_instagram.replace('@', '')" target="_blank" class="w-8 h-8 rounded-full border border-cafe-border flex items-center justify-center text-cafe-secondary hover:text-cafe-accent hover:border-cafe-accent transition-colors shadow-sm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </a>
                        </div>
                    </div>

                    <!-- Column 2: Navigation Links -->
                    <div class="space-y-6">
                        <h4 class="text-[10px] font-black text-cafe-main uppercase tracking-wider">Navigasi</h4>
                        <ul class="space-y-3">
                            <li>
                                <a href="#" class="text-xs text-cafe-secondary hover:text-cafe-accent transition-colors">Beranda</a>
                            </li>
                            <li>
                                <a href="#about" class="text-xs text-cafe-secondary hover:text-cafe-accent transition-colors">Kisah Kami</a>
                            </li>
                            <li>
                                <a href="#fasilitas" class="text-xs text-cafe-secondary hover:text-cafe-accent transition-colors">Keunggulan</a>
                            </li>
                            <li>
                                <a href="#menu" class="text-xs text-cafe-secondary hover:text-cafe-accent transition-colors">Daftar Menu</a>
                            </li>
                            <li>
                                <a href="#gallery" class="text-xs text-cafe-secondary hover:text-cafe-accent transition-colors">Galeri</a>
                            </li>
                        </ul>
                    </div>

                    <!-- Column 3: Contact Details -->
                    <div class="space-y-6">
                        <h4 class="text-[10px] font-black text-cafe-main uppercase tracking-wider">Kontak Info</h4>
                        <ul class="space-y-3.5 text-xs text-cafe-secondary leading-relaxed">
                            <li class="flex items-start gap-3.5">
                                <svg class="w-5 h-5 shrink-0 text-cafe-accent mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span>{{ storeSettings.store_address }}</span>
                            </li>
                            <li class="flex items-center gap-3.5">
                                <svg class="w-5 h-5 shrink-0 text-cafe-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                <span>{{ storeSettings.store_phone }}</span>
                            </li>
                            <li class="flex items-center gap-3.5">
                                <svg class="w-5 h-5 shrink-0 text-cafe-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                <span>hello@denjavas.com</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Column 4: Operational Hours -->
                    <div class="space-y-6">
                        <h4 class="text-[10px] font-black text-cafe-main uppercase tracking-wider">Jam Operasional</h4>
                        <div class="bg-cafe-base p-5 rounded-2xl border border-cafe-border/80">
                            <p class="text-xs text-cafe-secondary font-serif font-medium leading-relaxed">
                                Setiap Hari: <br/>
                                <span class="text-base font-bold text-cafe-accent">09:00 - 23:00 WIB</span>
                            </p>
                            <p class="text-[9px] text-cafe-muted uppercase tracking-wider font-bold mt-3">
                                Dapur tutup pukul 22:30 WIB
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Bottom copyright bar -->
                <div class="pt-8 border-t border-cafe-border/50 flex justify-center items-center text-center text-xs text-cafe-muted">
                    <p>
                        &copy; 2026 Denjavas Retro Café & Eatery. All rights reserved.
                    </p>
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

        <!-- Lightbox Modal for Gallery (FR-08) -->
        <div v-if="activeLightboxImage" @click="activeLightboxImage = null" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1C1917]/90 backdrop-blur-md cursor-zoom-out transition-all duration-300">
            <div class="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border-2 border-cafe-accent/30 shadow-2xl">
                <img :src="activeLightboxImage" class="max-w-full max-h-[80vh] object-contain" />
                <button @click="activeLightboxImage = null" class="absolute top-4 right-4 bg-cafe-main hover:bg-cafe-accent text-white w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors">×</button>
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

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
