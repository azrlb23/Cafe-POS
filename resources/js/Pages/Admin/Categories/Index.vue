<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const props = defineProps({
    categories: {
        type: Array,
        required: true,
    },
    filters: {
        type: Object,
        default: () => ({ search: '' }),
    }
});

const search = ref(props.filters.search || '');

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
    router.get(route('admin.categories.index'), {
        search: search.value,
    }, {
        preserveState: true,
        preserveScroll: true,
        replace: true
    });
}, 300);

watch(search, () => {
    performSearch();
});

const form = useForm({});
const resetSearch = () => {
    search.value = '';
};
</script>

<template>
    <Head title="Kategori Menu" />

    <AuthenticatedLayout>
        <div class="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in">
                <div>
                    <h2 class="text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Kategori <span class="text-amber-700 italic">Menu</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Kelola klasifikasi, pengelompokan produk makanan & minuman, serta relasi menu di Denjavas Cafe.
                    </p>
                    <div class="flex items-center gap-3 mt-3">
                        <span class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Total Kategori: {{ categories.length }}
                        </span>
                    </div>
                </div>
                <Link
                    :href="route('admin.categories.create')"
                    class="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-700/10 hover:shadow-amber-700/20 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shrink-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Kategori
                </Link>
            </div>
            <!-- Search Toolbar -->
            <div class="flex flex-col md:flex-row gap-4 mb-8 delay-100">
                <div class="flex-1 relative group">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-700 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input 
                        v-model="search" 
                        type="text" 
                        placeholder="Cari nama kategori..." 
                        class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all text-sm font-bold shadow-sm"
                    >
                    <button 
                        v-if="search" 
                        @click="resetSearch"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
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
                <div v-if="$page.props.flash && $page.props.flash.success" class="mb-8 bg-white border-l-4 border-amber-700 text-slate-900 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
                    <div class="flex items-center gap-3">
                        <div class="bg-amber-100/80 p-2 rounded-full">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <span class="font-bold tracking-wide">{{ $page.props.flash.success }}</span>
                    </div>
                </div>
            </Transition>

            <div class="overflow-x-auto -mx-4 sm:mx-0 delay-200">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-slate-400">
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] w-20">ID</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Kategori</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Slug (URL)</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in categories" :key="category.id" class="group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-1">
                            <td class="py-6 px-8 first:rounded-l-[2rem]">
                                <span class="text-xs font-black text-slate-300">#{{ String(category.id).padStart(2, '0') }}</span>
                            </td>
                            <td class="py-6 px-6">
                                <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-700 transition-colors">{{ category.name }}</div>
                            </td>
                            <td class="py-6 px-6">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                                    /{{ category.slug }}
                                </span>
                            </td>
                            <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <Link
                                        :href="route('admin.categories.edit', category.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-700 hover:border-amber-500 p-3 rounded-2xl transition-all shadow-sm active:scale-90"
                                        title="Edit Kategori"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </Link>
                                    
                                    <Link
                                        :href="route('admin.categories.destroy', category.id)"
                                        method="delete"
                                        as="button"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90"
                                        title="Hapus Kategori"
                                        preserve-scroll
                                        @click="if(!confirm('Yakin ingin menghapus kategori ini? Menu yang berelasi mungkin akan terpengaruh.')) { $event.preventDefault(); }"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="categories.length === 0">
                            <td colspan="4" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Belum ada kategori terdaftar</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
