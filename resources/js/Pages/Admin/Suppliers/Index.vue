<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';

const props = defineProps({
    suppliers: Array
});

const deleteSupplier = (id) => {
    if (confirm('Yakin ingin menghapus supplier ini?')) {
        router.delete(route('admin.suppliers.destroy', id));
    }
};
</script>

<template>
    <Head title="Manajemen Supplier" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in">
                <div>
                    <h2 class="text-3xl font-serif font-bold text-[#1C1917] tracking-tight">
                        Mitra <span class="text-amber-600 italic">Supplier</span>
                    </h2>
                    <p class="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black mt-2">
                        Manajemen Rekanan dan Rantai Pasok Bahan Baku
                    </p>
                </div>
                <Link
                    :href="route('admin.suppliers.create')"
                    class="w-full md:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-black transition-all duration-300 shadow-xl shadow-amber-600/20 text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 text-center"
                >
                    + Tambah Supplier
                </Link>
            </div>
        </template>

        <div class="max-w-[1400px] mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- Flash Messages -->
            <div v-if="$page.props.flash.success" class="mb-8 bg-white border-l-4 border-amber-500 text-slate-900 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
                <div class="flex items-center gap-3">
                    <div class="bg-amber-100 p-2 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <span class="font-bold tracking-wide">{{ $page.props.flash.success }}</span>
                </div>
            </div>

            <div class="overflow-x-auto delay-200">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-slate-400">
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Supplier</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Kontak PIC</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Info Kontak</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="supplier in suppliers" :key="supplier.id" class="group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-1">
                            <td class="py-6 px-8 first:rounded-l-[2rem]">
                                <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-600 transition-colors">{{ supplier.name }}</div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ supplier.address || '-' }}</div>
                            </td>
                            <td class="py-6 px-8">
                                <span class="text-sm font-black text-slate-700">{{ supplier.contact_person || '-' }}</span>
                            </td>
                            <td class="py-6 px-8">
                                <div class="flex flex-col gap-1">
                                    <span class="text-xs font-bold text-slate-500">{{ supplier.phone || '-' }}</span>
                                    <span class="text-xs font-medium text-slate-400">{{ supplier.email || '-' }}</span>
                                </div>
                            </td>
                            <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <Link
                                        :href="route('admin.suppliers.edit', supplier.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90"
                                        title="Edit Supplier"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </Link>
                                    
                                    <button
                                        @click="deleteSupplier(supplier.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90"
                                        title="Hapus Supplier"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="suppliers.length === 0">
                            <td colspan="4" class="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">Belum ada data supplier.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
