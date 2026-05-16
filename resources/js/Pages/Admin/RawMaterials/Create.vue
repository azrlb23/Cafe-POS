<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import RawMaterialForm from './Partials/RawMaterialForm.vue';

const props = defineProps({
    suppliers: Array
});
</script>

<template>
    <Head title="Tambah Bahan Baku" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center gap-6 animate-fade-in">
                <Link :href="route('admin.raw-materials.index')" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div>
                    <h2 class="text-3xl font-serif font-bold text-[#1C1917] tracking-tight">
                        Tambah <span class="text-amber-600 italic">Bahan Baku</span>
                    </h2>
                    <p class="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black mt-2">
                        Daftarkan Inventaris Baru untuk Operasional Cafe
                    </p>
                </div>
            </div>
        </template>

        <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div class="delay-100">
                <RawMaterialForm :suppliers="suppliers" />
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
