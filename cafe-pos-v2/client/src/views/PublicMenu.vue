<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
    <header class="sticky top-0 z-50 bg-cafe-base/80 backdrop-blur-md border-b border-cafe-border/60 py-4">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link :to="{ name: 'Welcome' }" class="flex items-center gap-3 group">
          <span class="font-bold text-2xl tracking-widest text-cafe-accent font-serif transition-colors duration-300 group-hover:text-cafe-accent-hover">Denjavas</span>
          <span class="tracking-[0.2em] text-[10px] uppercase mt-1 text-cafe-secondary/70 font-bold hidden sm:block">Retro Café</span>
        </router-link>

        <!-- Back Button -->
        <router-link
          :to="{ name: 'Welcome' }"
          class="group text-[10px] font-black text-cafe-secondary hover:text-cafe-accent transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transform group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Kembali ke Beranda
        </router-link>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center animate-fade-in">
      <span class="text-cafe-accent text-xs font-bold uppercase tracking-[0.25em] mb-3 inline-block">Cita Rasa Nusantara</span>
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-cafe-main tracking-tight leading-tight mb-4">
        Daftar <span class="text-cafe-accent italic font-light font-serif">Menu Pilihan</span>
      </h1>
      <p class="text-cafe-secondary max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        Jelajahi aneka racikan kopi otentik, makanan khas Nusantara, serta hidangan penutup manis racikan klasik Denjavas Cafe.
      </p>
    </section>

    <!-- Search & Filter Controls -->
    <section class="max-w-7xl mx-auto px-6 mb-12 animate-fade-in-up">
      <div class="bg-cafe-surface rounded-3xl border border-cafe-border p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <!-- Search bar -->
        <div class="relative w-full">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cafe-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kopi, nasi goreng, cemilan..."
            class="w-full bg-cafe-base/40 border border-cafe-border focus:border-cafe-accent/50 focus:bg-cafe-surface rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none text-cafe-main"
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
          <div class="flex flex-wrap gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              @click="selectCategory(null)"
              :class="[
                'px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                selectedCategoryId === null
                  ? 'bg-cafe-accent text-white shadow-md shadow-cafe-accent/15'
                  : 'bg-cafe-surface border border-cafe-border hover:bg-cafe-base text-cafe-secondary hover:text-cafe-main'
              ]"
            >
              Semua Menu
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.id)"
              :class="[
                'px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                selectedCategoryId === cat.id
                  ? 'bg-cafe-accent text-white shadow-md shadow-cafe-accent/15'
                  : 'bg-cafe-surface border border-cafe-border hover:bg-cafe-base text-cafe-secondary hover:text-cafe-main'
              ]"
            >
              {{ cat.name }}
            </button>
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
      <div v-else-if="filteredMenus.length === 0" class="text-center py-24 bg-cafe-surface rounded-3xl border border-cafe-border p-8">
        <svg class="mx-auto text-cafe-muted mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        <h3 class="text-xl font-serif font-bold text-cafe-main mb-2">Menu tidak ditemukan</h3>
        <p class="text-cafe-secondary text-sm max-w-sm mx-auto">Tidak ada menu yang sesuai dengan kata kunci atau filter kategori yang Anda cari.</p>
      </div>

      <!-- Menu Items Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div
          v-for="menu in filteredMenus"
          :key="menu.id"
          class="bg-cafe-surface rounded-3xl overflow-hidden border border-cafe-border hover:border-cafe-accent/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col"
        >
          <!-- Image Section -->
          <div class="aspect-[4/3] bg-white relative overflow-hidden border-b border-cafe-border/40">
            <img
              :src="getMenuImage(menu)"
              :alt="menu.name"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-amber-900/5 mix-blend-multiply pointer-events-none"></div>
            
            <!-- Category Badge overlay -->
            <span class="absolute bottom-3 left-3 bg-cafe-surface/90 backdrop-blur-sm border border-cafe-border px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-cafe-accent shadow-sm">
              {{ menu.category.name }}
            </span>
          </div>

          <!-- Description Section -->
          <div class="p-6 flex flex-col flex-grow justify-between bg-cafe-surface">
            <div class="space-y-2">
              <h3 class="text-lg font-serif font-bold text-cafe-main group-hover:text-cafe-accent transition-colors line-clamp-1">
                {{ menu.name }}
              </h3>
              <p class="text-cafe-secondary text-xs line-clamp-3 leading-relaxed">
                {{ menu.description || 'Tidak ada deskripsi untuk menu klasik ini.' }}
              </p>
            </div>

            <div class="flex items-center justify-between border-t border-cafe-border/50 pt-4 mt-6">
              <span class="text-sm font-bold text-cafe-accent tracking-wide">
                {{ formatPrice(menu.basePrice) }}
              </span>
              <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50/70 border border-emerald-200/40 px-2.5 py-0.5 rounded-md">
                Tersedia
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Staff Portal Link -->
    <div class="w-full text-center mt-24">
      <router-link
        :to="{ name: 'Login' }"
        class="text-[9px] font-bold text-cafe-muted hover:text-cafe-accent transition-colors uppercase tracking-[0.25em] border border-cafe-border px-4 py-2 rounded-lg bg-cafe-surface/40 hover:bg-cafe-surface shadow-sm inline-block"
      >
        Staff Portal
      </router-link>
    </div>
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
