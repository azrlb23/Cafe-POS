<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import PurchaseOrderForm from './Partials/PurchaseOrderForm.vue';

const props = defineProps({
    suppliers: Array,
    rawMaterials: Array,
    autofill: Object,
    nextOrderNumber: String
});
</script>

<template>
    <Head title="Tambah Stok Masuk" />

    <AuthenticatedLayout>
        <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
            <!-- Back Button and Title in Canvas -->
            <div class="flex items-center gap-6 mb-10">
                <Link :href="route('admin.purchase-orders.index')" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div>
                    <h2 class="text-4xl font-serif font-black text-[#1C1917] tracking-tight leading-tight">
                        Catat <span class="text-amber-600 italic">Stok Masuk</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Dokumentasi Penerimaan Barang dan Audit Harga Beli
                    </p>
                </div>
            </div>

            <div class="delay-100">
                <PurchaseOrderForm 
                    :suppliers="suppliers" 
                    :raw-materials="rawMaterials" 
                    :autofill="autofill"
                    :next-order-number="nextOrderNumber"
                />
            </div>
        </div>
    </AuthenticatedLayout>
</template>
