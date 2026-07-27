<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import api from '../utils/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Menu {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  imagePath: string | null;
  basePrice: string | number;
  isActive: boolean;
  category: Category;
}

const menus = ref<Menu[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref('');
const selectedCategoryId = ref<number | null>(null);
const isScrolled = ref(false);
const isCategoryDropdownOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const fetchPublicMenus = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/admin/public-menus');
    menus.value = response.data.menus.filter((m: Menu) => m.isActive);
    categories.value = response.data.categories;
  } catch (err: any) {
    console.error('Gagal mengambil menu:', err);
    error.value = 'Gagal memuat daftar menu. Silakan coba beberapa saat lagi.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPublicMenus();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Format Price helper
const formatPrice = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num);
};

// Fallback image mapper for dynamic menu items
const getMenuImage = (menu: Menu) => {
  if (!menu.imagePath) {
    return getFallbackImage(menu.name, menu.category?.name);
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

// Filtered Menus logic
const filteredMenus = computed(() => {
  return menus.value.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesCategory = selectedCategoryId.value === null || menu.categoryId === selectedCategoryId.value;
    return matchesSearch && matchesCategory;
  });
});

const selectCategory = (id: number | null) => {
  selectedCategoryId.value = id;
};
</script>

<template>
  <div class="min-h-screen bg-cafe-base text-cafe-main font-sans selection:bg-cafe-accent selection:text-white pb-24 transition-colors duration-300">
    <!-- Navbar / Header -->
    <nav :class="['fixed w-full z-50 transition-all duration-500 border-b', isScrolled ? 'bg-cafe-surface/90 backdrop-blur-md border-cafe-border py-4 shadow-sm' : 'bg-transparent border-transparent py-6']">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link :to="{ name: 'Welcome' }" class="flex items-center gap-3 group">
          <span :class="['font-bold text-2xl tracking-widest font-serif logo-anim transition-colors duration-300', isScrolled ? 'text-cafe-accent group-hover:text-cafe-accent-hover' : 'text-[#C59B76] group-hover:text-white']">Denjavas</span>
          <span :class="['tracking-[0.2em] text-[10px] hidden sm:block uppercase mt-1 transition-colors font-bold', isScrolled ? 'text-cafe-secondary/80' : 'text-stone-300']">Retro Café</span>
        </router-link>

        <!-- Back Button -->
        <router-link
          :to="{ name: 'Welcome' }"
          :class="['group text-[10px] font-black transition-colors uppercase tracking-[0.25em] flex items-center gap-2', isScrolled ? 'text-cafe-secondary hover:text-cafe-accent' : 'text-[#C59B76] hover:text-white']"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transform group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Kembali ke Beranda
        </router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative bg-[#18130F] text-white pt-36 pb-28 overflow-hidden">
      <!-- Subtle Vintage Grid Background -->
      <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
      
      <!-- Fine Vintage Decorative Border -->
      <div class="absolute inset-6 z-0 border border-stone-800/40 pointer-events-none rounded-[2rem]"></div>
      <div class="absolute inset-8 z-0 border border-stone-900/20 pointer-events-none rounded-[1.8rem]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-8 text-center animate-fade-in">
        <div class="mb-4 inline-block">
          <span class="text-[#C59B76] font-black tracking-[0.3em] text-[9px] uppercase border border-[#C59B76]/30 px-6 py-2.5 rounded-full bg-stone-900/60 backdrop-blur-sm shadow-sm">
            Cita Rasa Nusantara
          </span>
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-stone-100 tracking-tight leading-tight mb-6">
          Daftar <span class="text-[#C59B76] italic font-light font-serif">Menu Pilihan</span>
        </h1>
        <p class="text-stone-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Jelajahi aneka racikan kopi otentik, makanan khas Nusantara, serta hidangan penutup manis racikan klasik Denjavas Cafe.
        </p>
      </div>

      <!-- Torn Paper Bottom Edge Transition -->
      <div class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden h-14">
        <svg class="absolute bottom-0 w-full h-12 text-cafe-base fill-current preserve-3d" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 L40,43 L80,55 L120,38 L160,45 L200,32 L240,48 L280,35 L320,42 L360,55 L400,38 L440,47 L480,33 L520,40 L560,52 L600,35 L640,45 L680,38 L720,48 L760,32 L800,42 L840,55 L880,38 L920,47 L960,33 L1000,45 L1040,32 L1080,48 L1120,35 L1160,42 L1200,55 L1240,38 L1280,45 L1320,32 L1360,48 L1400,35 L1440,42 L1440,100 L0,100 Z" class="fill-cafe-base"></path>
          <path d="M0,60 L50,55 L100,65 L150,48 L200,58 L250,45 L300,62 L350,48 L400,55 L450,65 L500,48 L550,58 L600,43 L650,55 L700,48 L750,62 L800,45 L850,55 L900,65 L950,48 L1000,58 L1050,43 L1100,55 L1150,48 L1200,62 L1250,45 L1300,55 L1350,65 L1400,48 L1440,58 L1440,100 L0,100 Z" class="fill-cafe-base/35"></path>
        </svg>
      </div>
    </section>

    <!-- Search & Filter Controls -->
    <section class="max-w-7xl mx-auto px-6 mb-16 -mt-8 relative z-30 animate-fade-in-up">
      <div class="bg-white rounded-[2rem] border border-cafe-border p-6 md:p-8 shadow-xl shadow-cafe-main/5 flex flex-col gap-6">
        <!-- Search bar -->
        <div class="relative w-full">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cafe-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kopi, nasi goreng, cemilan..."
            class="w-full bg-cafe-base/40 border border-cafe-border focus:border-cafe-accent/50 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none text-cafe-main"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-cafe-muted hover:text-cafe-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Filter Categories Tabs -->
        <div class="flex flex-col gap-3">
          <span class="text-[9px] font-black text-cafe-muted uppercase tracking-widest">Kategori Menu</span>
          
          <!-- Desktop Tabs (Visible on sm screens and up) -->
          <div class="hidden sm:flex flex-wrap gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              @click="selectCategory(null)"
              :class="[
                'px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border',
                selectedCategoryId === null
                  ? 'bg-cafe-accent text-white border-cafe-accent shadow-md shadow-cafe-accent/15'
                  : 'bg-white border-cafe-border hover:bg-cafe-base text-cafe-secondary hover:text-cafe-main'
              ]"
            >
              Semua Menu
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.id)"
              :class="[
                'px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border',
                selectedCategoryId === cat.id
                  ? 'bg-cafe-accent text-white border-cafe-accent shadow-md shadow-cafe-accent/15'
                  : 'bg-white border-cafe-border hover:bg-cafe-base text-cafe-secondary hover:text-cafe-main'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>

          <!-- Mobile Dropdown Selector (Visible on mobile/tablet below sm) -->
          <div class="sm:hidden relative w-full">
            <button 
              @click="isCategoryDropdownOpen = !isCategoryDropdownOpen"
              class="w-full flex items-center justify-between bg-white border border-cafe-border rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-cafe-secondary hover:text-cafe-main transition-all cursor-pointer"
            >
              <span>{{ selectedCategoryId === null ? 'Semua Menu' : (categories.find(c => c.id === selectedCategoryId)?.name || 'Semua Menu') }}</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2.5"
                :class="['transform transition-transform duration-200', isCategoryDropdownOpen ? 'rotate-180' : '']"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Click Outside Backdrop Overlay -->
            <div 
              v-if="isCategoryDropdownOpen" 
              class="fixed inset-0 z-40 bg-transparent" 
              @click="isCategoryDropdownOpen = false"
            ></div>

            <!-- Dropdown Options Panel -->
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div 
                v-if="isCategoryDropdownOpen" 
                class="absolute left-0 right-0 mt-2 z-50 bg-white border border-cafe-border rounded-xl shadow-xl max-h-60 overflow-y-auto py-1"
              >
                <!-- Option: Semua Menu -->
                <button
                  @click="selectCategory(null); isCategoryDropdownOpen = false;"
                  :class="[
                    'w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left transition-colors cursor-pointer',
                    selectedCategoryId === null ? 'bg-cafe-base text-cafe-accent font-bold' : 'text-cafe-secondary hover:bg-cafe-base/50'
                  ]"
                >
                  <span>Semua Menu</span>
                  <svg v-if="selectedCategoryId === null" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-cafe-accent"><polyline points="20 6 9 17 4 12"/></svg>
                </button>

                <!-- Options: Category list -->
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  @click="selectCategory(cat.id); isCategoryDropdownOpen = false;"
                  :class="[
                    'w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left transition-colors cursor-pointer',
                    selectedCategoryId === cat.id ? 'bg-cafe-base text-cafe-accent font-bold' : 'text-cafe-secondary hover:bg-cafe-base/50'
                  ]"
                >
                  <span>{{ cat.name }}</span>
                  <svg v-if="selectedCategoryId === cat.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-cafe-accent"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu Grid -->
    <main class="max-w-7xl mx-auto px-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-10 h-10 border-4 border-cafe-border border-t-cafe-accent rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-cafe-muted uppercase tracking-widest">Memuat Menu Pilihan...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <p class="text-red-700 text-sm font-bold mb-4">{{ error }}</p>
        <button @click="fetchPublicMenus" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMenus.length === 0" class="text-center py-24 bg-white rounded-[2rem] border border-cafe-border p-8">
        <svg class="mx-auto text-cafe-muted mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        <h3 class="text-xl font-serif font-black text-cafe-main mb-2">Menu tidak ditemukan</h3>
        <p class="text-cafe-secondary text-sm max-w-sm mx-auto leading-relaxed">Tidak ada menu yang sesuai dengan kata kunci atau filter kategori yang Anda cari.</p>
      </div>

      <!-- Menu Items Grid -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        <div
          v-for="menu in filteredMenus"
          :key="menu.id"
          class="group flex flex-col h-full bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden border border-cafe-border hover:border-cafe-accent/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative"
        >
          <!-- Image Section (Aspect 4/3) -->
          <div class="aspect-[4/3] bg-white relative overflow-hidden border-b border-cafe-border/40">
            <!-- Badges overlay -->
            <span class="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-sm border border-cafe-border px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-cafe-accent shadow-sm z-10">
              {{ menu.category?.name || 'Sajian' }}
            </span>
            <img
              :src="getMenuImage(menu)"
              :alt="menu.name"
              loading="lazy"
              decoding="async"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-amber-900/5 mix-blend-multiply pointer-events-none"></div>
          </div>

          <!-- Description Section -->
          <div class="p-4 sm:p-6 flex flex-col flex-grow justify-between bg-white">
            <div class="space-y-1 sm:space-y-2">
              <h3 class="text-sm sm:text-lg font-serif font-black text-cafe-main group-hover:text-cafe-accent transition-colors line-clamp-1">
                {{ menu.name }}
              </h3>
              <p class="text-cafe-secondary text-[10px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-3 italic">
                {{ menu.description || 'Tidak ada deskripsi untuk menu klasik ini.' }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-t border-cafe-border/50 pt-3 sm:pt-4 mt-4 sm:mt-6 gap-2">
              <span class="text-xs sm:text-sm font-black text-cafe-accent tracking-wide">
                {{ formatPrice(menu.basePrice) }}
              </span>
              <span class="self-start sm:self-auto text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-55/40 border border-emerald-200 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
                Tersedia
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.font-sans {
    font-family: 'Inter', sans-serif;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hide scrollbar for category tabs */
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #E7E5E4;
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #B45309;
}
</style>
