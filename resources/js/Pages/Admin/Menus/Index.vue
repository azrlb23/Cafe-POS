<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import CustomSelect from '@/Components/CustomSelect.vue';


const props = defineProps({
    menus: {
        type: Array,
        required: true,
    },
    categories: {
        type: Array,
        required: true,
    },
    filters: {
        type: Object,
        default: () => ({}),
    }
});

const search = ref(props.filters.search || '');
const categoryId = ref(props.filters.category_id || '');

// Vanilla Debounce
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

const performSearch = debounce(() => {
    router.get(route('admin.menus.index'), {
        search: search.value,
        category_id: categoryId.value
    }, {
        preserveState: true,
        preserveScroll: true,
        replace: true
    });
}, 300);


watch([search, categoryId], () => {
    performSearch();
});

const resetFilters = () => {
    search.value = '';
    categoryId.value = '';
};

</script>

<template>
    <Head title="Katalog Menu" />

    <AuthenticatedLayout>
        <div class="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
                <div>
                    <h2 class="text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Katalog <span class="text-amber-600 italic">Menu</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Kelola menu makanan, minuman, harga jual, resep bahan baku, serta ketersediaan stok di Denjavas Cafe.
                    </p>
                    <div class="flex flex-wrap items-center gap-3 mt-3">
                        <span class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            {{ menus.length }} Menu Terdaftar
                        </span>
                        <span class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            {{ categories.length }} Kategori Aktif
                        </span>
                    </div>
                </div>

                <Link
                    :href="route('admin.menus.create')"
                    class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-2xl font-black transition-all duration-300 shadow-lg shadow-amber-500/20 text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 text-center"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Menu Baru
                </Link>
            </div>
            <!-- Flash Messages -->
            <Transition
                enter-active-class="transform transition duration-500 ease-out"
                enter-from-class="translate-y-[-20px] opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transform transition duration-300 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="$page.props.flash && $page.props.flash.success" class="mb-8 bg-white border-l-4 border-amber-500 text-slate-900 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
                    <div class="flex items-center gap-3">
                        <div class="bg-amber-100 p-2 rounded-full">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <span class="font-bold tracking-wide">{{ $page.props.flash.success }}</span>
                    </div>
                </div>
            </Transition>

            <!-- Top Toolbar: Search & Filters -->
            <div class="flex flex-col lg:flex-row gap-6 mb-10 items-end delay-100">
                <div class="flex-1 w-full">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Pencarian Menu</label>
                    <div class="relative group">
                        <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <input v-model="search" type="text" placeholder="Cari nama kopi, snack, atau minuman..." class="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-bold shadow-sm">
                    </div>
                </div>
                
                <div class="w-full lg:w-72">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Filter Kategori</label>
                    <CustomSelect
                        v-model="categoryId"
                        :options="[{ id: '', name: 'Semua Kategori' }, ...categories]"
                        label-key="name"
                        value-key="id"
                        placeholder="Filter Kategori"
                    />
                </div>

                <button @click="resetFilters" class="px-8 py-4 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border border-slate-200 active:scale-95">
                    Reset
                </button>
            </div>

            <!-- Main Content Area -->
            <div class="overflow-x-auto -mx-4 sm:mx-0 delay-200">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-slate-400">
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Informasi Produk</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Kategori</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Harga</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="menu in menus" :key="menu.id" class="group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-1">
                            <td class="py-6 px-8 first:rounded-l-[2rem]">
                                <div class="flex items-center gap-6">
                                    <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-700">
                                        <img v-if="menu.image_path" :src="'/storage/' + menu.image_path" alt="Menu" class="w-full h-full object-cover" />
                                        <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="font-serif font-black text-slate-900 text-xl mb-1 group-hover:text-amber-600 transition-colors">{{ menu.name }}</div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-black text-amber-500/50 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded">
                                                {{ menu.recipes?.length || 0 }} Bahan
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-6 px-6">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1.5 rounded-xl bg-slate-50 group-hover:bg-white transition-colors">
                                    {{ menu.category?.name }}
                                </span>
                            </td>
                            <td class="py-6 px-6">
                                <div class="flex flex-col">
                                    <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Base Price</span>
                                    <span class="text-slate-900 font-black text-lg">Rp {{ parseInt(menu.base_price).toLocaleString('id-ID') }}</span>
                                </div>
                            </td>
                            <td class="py-6 px-6">
                                <div :class="menu.is_active ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent text-[10px] font-black uppercase tracking-widest transition-all">
                                    <span :class="menu.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                                    {{ menu.is_active ? 'Tersedia' : 'Hidden' }}
                                </div>
                            </td>
                            <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <Link
                                        :href="route('admin.menus.edit', menu.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90"
                                        title="Edit Menu"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </Link>
                                    
                                    <button
                                        @click="confirmDeletion(menu)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90"
                                        title="Hapus Menu"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="menus.length === 0">
                            <td colspan="5" class="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div class="bg-slate-50 inline-flex p-8 rounded-full mb-6">
                                    <svg class="text-slate-200 w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <div class="text-slate-900 font-serif font-black text-2xl">Menu Tidak Ditemukan</div>
                                <p class="text-slate-400 text-sm mt-2 max-w-xs mx-auto uppercase font-bold tracking-widest leading-loose">Coba gunakan kata kunci lain atau ubah kategori pilihan Anda.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script>
export default {
    methods: {
        confirmDeletion(menu) {
            if (confirm(`Yakin ingin menghapus menu "${menu.name}"? Semua resep dan opsi akan ikut terhapus selamanya.`)) {
                this.$inertia.delete(route('admin.menus.destroy', menu.id), {
                    preserveScroll: true
                });
            }
        }
    }
}
</script>

