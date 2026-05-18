<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';

const props = defineProps({
    purchaseOrder: Object
});
</script>

<template>
    <Head :title="'Detail PO: ' + purchaseOrder.order_number" />

    <AuthenticatedLayout>
        <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in-up">
            <!-- Back Button and Title in Canvas -->
            <div class="flex items-center gap-6 mb-10">
                <Link :href="route('admin.purchase-orders.index')" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div>
                    <h2 class="text-4xl font-serif font-black text-[#1C1917] tracking-tight leading-tight">
                        Detail <span class="text-amber-600 italic">Stok Masuk</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Audit Transaksi Penerimaan: {{ purchaseOrder.order_number }}
                    </p>
                </div>
            </div>
            <!-- Header Info Card -->
            <div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 delay-100">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Pesanan</p>
                        <p class="text-2xl font-serif font-black text-slate-900">{{ purchaseOrder.order_number }}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</p>
                        <p class="text-xl font-bold text-slate-800">{{ purchaseOrder.supplier.name }}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</p>
                        <p class="text-xl font-bold text-slate-800">{{ new Date(purchaseOrder.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaksi</p>
                        <p class="text-2xl font-black text-amber-600">Rp {{ parseInt(purchaseOrder.total_amount).toLocaleString('id-ID') }}</p>
                    </div>
                </div>
                
                <div v-if="purchaseOrder.notes" class="mt-12 pt-12 border-t border-slate-50">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Catatan Tambahan</p>
                    <p class="text-slate-600 leading-relaxed italic">{{ purchaseOrder.notes }}</p>
                </div>
            </div>

            <!-- Items Table -->
            <div class="space-y-6 delay-200">
                <h3 class="text-xl font-serif font-black text-slate-900 ml-4">Rincian Bahan Baku</h3>
                <div class="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50/50 border-b border-slate-100">
                                <th class="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bahan Baku</th>
                                <th class="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jumlah</th>
                                <th class="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga Satuan</th>
                                <th class="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="item in purchaseOrder.items" :key="item.id" class="hover:bg-slate-50 transition-colors">
                                <td class="py-6 px-10">
                                    <span class="text-base font-black text-slate-900">{{ item.raw_material.name }}</span>
                                </td>
                                <td class="py-6 px-10 text-center">
                                    <span class="text-base font-bold text-slate-700">{{ item.quantity }}</span>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ item.raw_material.unit }}</span>
                                </td>
                                <td class="py-6 px-10 text-slate-500 font-medium">
                                    Rp {{ parseInt(item.unit_cost).toLocaleString('id-ID') }}
                                </td>
                                <td class="py-6 px-10 text-right">
                                    <span class="text-base font-black text-slate-900">Rp {{ parseInt(item.subtotal).toLocaleString('id-ID') }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bottom Actions -->
            <div class="flex justify-center pt-8 delay-300">
                <Link :href="route('admin.purchase-orders.index')" class="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
                    Kembali ke Riwayat
                </Link>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
