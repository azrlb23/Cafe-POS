<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps({
    categories: {
        type: Array,
        required: true,
    },
});

const form = useForm({});
</script>

<template>
    <Head title="Kategori Menu" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-serif font-bold text-[#292524] leading-tight">
                    Kategori Menu
                </h2>
                <Link
                    :href="route('admin.categories.create')"
                    class="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-[#FFFFFF] px-6 py-2 rounded-md font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)] text-sm uppercase tracking-widest hover:scale-105"
                >
                    + Tambah Kategori
                </Link>
            </div>
        </template>

        <div class="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

            <div class="overflow-x-auto -mx-4 sm:mx-0">
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
                        <tr v-for="category in categories" :key="category.id" class="group bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl">
                            <td class="py-6 px-8 first:rounded-l-[2rem]">
                                <span class="text-xs font-black text-slate-300">#{{ String(category.id).padStart(2, '0') }}</span>
                            </td>
                            <td class="py-6 px-6">
                                <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-600 transition-colors">{{ category.name }}</div>
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
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-sm"
                                        title="Edit Kategori"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </Link>
                                    
                                    <Link
                                        :href="route('admin.categories.destroy', category.id)"
                                        method="delete"
                                        as="button"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm"
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
