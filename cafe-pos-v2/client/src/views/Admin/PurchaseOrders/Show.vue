<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const purchaseOrder = ref(null);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const response = await api.get(`/admin/purchase-orders/${route.params.id}`);
        purchaseOrder.value = response.data.purchaseOrder;
    } catch (e) {
        console.error("Failed to fetch purchase order details", e);
    } finally {
        isLoading.value = false;
    }
});

const calculateTotal = (po) => {
    if (!po.purchaseOrderItems || po.purchaseOrderItems.length === 0) return 0;
    return po.purchaseOrderItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost || item.unit_cost)), 0);
};
</script>

<template>
            <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in-up">
            <!-- Back Button and Title in Canvas -->
            <div class="flex items-center gap-6 mb-10">
                <router-link :to="{ name: 'AdminPurchaseOrders' }" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90 cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </router-link>
                <div>
                    <h2 class="text-4xl font-serif font-black text-[#1C1917] tracking-tight leading-tight">
                        Detail <span class="text-amber-600 italic">Stok Masuk</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Audit Transaksi Penerimaan: {{ purchaseOrder?.poNumber || purchaseOrder?.order_number || 'Loading...' }}
                    </p>
                </div>
            </div>

            <div v-if="isLoading" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex justify-center items-center">
                <div class="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>

            <div v-else-if="purchaseOrder" class="space-y-12">
                <!-- Header Info Card -->
                <div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 delay-100">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Pesanan</p>
                            <p class="text-2xl font-serif font-black text-slate-900">{{ purchaseOrder.poNumber || purchaseOrder.order_number }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</p>
                            <p class="text-xl font-bold text-slate-800">{{ purchaseOrder.supplier?.name || '-' }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</p>
                            <p class="text-xl font-bold text-slate-800">{{ new Date(purchaseOrder.createdAt || purchaseOrder.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaksi</p>
                            <p class="text-2xl font-black text-amber-600">Rp {{ parseInt(calculateTotal(purchaseOrder)).toLocaleString('id-ID') }}</p>
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
                        <div class="overflow-x-auto">
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
                                    <tr v-for="item in (purchaseOrder.purchaseOrderItems || purchaseOrder.items)" :key="item.id" class="hover:bg-slate-50 transition-colors">
                                        <td class="py-6 px-10">
                                            <span class="text-base font-black text-slate-900">{{ item.rawMaterial?.name || item.raw_material?.name || '-' }}</span>
                                        </td>
                                        <td class="py-6 px-10 text-center">
                                            <span class="text-base font-bold text-slate-700">{{ item.quantity }}</span>
                                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ item.rawMaterial?.unit || item.raw_material?.unit }}</span>
                                        </td>
                                        <td class="py-6 px-10 text-slate-500 font-medium">
                                            Rp {{ parseInt(item.unitCost || item.unit_cost || 0).toLocaleString('id-ID') }}
                                        </td>
                                        <td class="py-6 px-10 text-right">
                                            <span class="text-base font-black text-slate-900">Rp {{ parseInt(item.quantity * (item.unitCost || item.unit_cost || 0)).toLocaleString('id-ID') }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Bottom Actions -->
                <div class="flex justify-center pt-8 delay-300">
                    <router-link :to="{ name: 'AdminPurchaseOrders' }" class="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                        Kembali ke Riwayat
                    </router-link>
                </div>
            </div>

            <div v-else class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Purchase Order tidak ditemukan</div>
            </div>
        </div>
    </template>
