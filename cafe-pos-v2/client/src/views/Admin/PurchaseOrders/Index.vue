<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';

const router = useRouter();

const purchaseOrders = ref([]);
const suppliers = ref([]);
const rawMaterials = ref([]);
const suggestions = ref([]);
const isLoading = ref(true);
const flashMessage = ref('');

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/admin/purchase-orders');
        purchaseOrders.value = response.data.purchaseOrders || [];
        suppliers.value = response.data.suppliers || [];
        rawMaterials.value = response.data.rawMaterials || [];
        
        // Transform suggestions format slightly if needed, or use as is
        const rawSuggestions = response.data.suggestions || [];
        
        // Group low stock materials by supplier to match the UI expectations
        // The endpoint currently returns an array of lowStockMaterials with their defaultSupplier.
        // Let's group them by supplier.
        const groupedSuggestions = {};
        
        rawSuggestions.forEach(item => {
            if (!item.defaultSupplier) return;
            const supplierId = item.defaultSupplier.id;
            
            if (!groupedSuggestions[supplierId]) {
                groupedSuggestions[supplierId] = {
                    supplier: item.defaultSupplier,
                    items: []
                };
            }
            
            const suggestedQty = (item.parLevel || item.par_level || 0) - (item.currentStock || item.current_stock || 0);
            
            groupedSuggestions[supplierId].items.push({
                raw_material_id: item.id,
                name: item.name,
                current_stock: item.currentStock || item.current_stock,
                par_level: item.parLevel || item.par_level,
                unit: item.unit,
                suggested_quantity: suggestedQty > 0 ? suggestedQty : 0
            });
        });
        
        suggestions.value = Object.values(groupedSuggestions);
        
    } catch (e) {
        console.error("Failed to fetch purchase orders", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price || 0);
};

const deletePO = async (id) => {
    if (confirm('Yakin ingin menghapus riwayat pengadaan ini?')) {
        try {
            await api.delete(`/admin/purchase-orders/${id}`);
            flashMessage.value = 'Riwayat pengadaan berhasil dihapus';
            fetchData();
            setTimeout(() => { flashMessage.value = ''; }, 3000);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Gagal menghapus riwayat');
        }
    }
};

const calculateTotal = (po) => {
    if (!po.purchaseOrderItems || po.purchaseOrderItems.length === 0) return 0;
    return po.purchaseOrderItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost || item.unit_cost)), 0);
};
</script>

<template>
            <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in">
                <div>
                    <h2 class="text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Stok <span class="text-amber-600 italic">Masuk</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Catat dan pantau transaksi pembelian bahan baku, audit barang masuk, serta monitoring pengadaan otomatis di Denjavas Cafe.
                    </p>
                    <div class="flex items-center gap-3 mt-3">
                        <span class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Total Transaksi: {{ purchaseOrders.length }} PO
                        </span>
                    </div>
                </div>
                <router-link
                    :to="{ name: 'AdminPurchaseOrdersCreate' }"
                    class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Input Stok Baru
                </router-link>
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
                <div v-if="flashMessage" class="mb-8 bg-white border-l-4 border-amber-700 text-slate-900 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
                    <div class="flex items-center gap-3">
                        <div class="bg-amber-100/80 p-2 rounded-full">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <span class="font-bold tracking-wide">{{ flashMessage }}</span>
                    </div>
                </div>
            </Transition>

            <div v-if="isLoading" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex justify-center items-center">
                <div class="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>

            <div v-else>
                <!-- Smart Suggestions Section -->
                <div v-if="suggestions.length > 0" class="mb-16 animate-in slide-in-from-bottom-4 duration-700">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-serif font-black text-slate-900">Rekomendasi <span class="text-amber-600">Pengadaan Otomatis</span></h3>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem mendeteksi {{ suggestions.length }} supplier yang memerlukan restock segera</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div v-for="suggestion in suggestions" :key="suggestion.supplier.id" class="bg-white rounded-[3rem] p-8 border-2 border-amber-100 shadow-xl shadow-amber-600/5 flex flex-col justify-between hover:border-amber-400 transition-all duration-500 group">
                            <div>
                                <div class="flex justify-between items-start mb-6">
                                    <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                                        {{ suggestion.supplier.name[0] }}
                                    </div>
                                    <span class="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                        {{ suggestion.items.length }} Item Perlu Restock
                                    </span>
                                </div>
                                <h4 class="text-xl font-black text-slate-900 mb-4">{{ suggestion.supplier.name }}</h4>
                                
                                <div class="space-y-3 mb-8">
                                    <div v-for="item in suggestion.items" :key="item.raw_material_id" class="flex justify-between items-center text-sm">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-slate-700">{{ item.name }}</span>
                                            <span class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Stok: {{ item.current_stock }} / Target: {{ item.par_level }}</span>
                                        </div>
                                        <span class="font-black text-amber-600">+{{ item.suggested_quantity }} {{ item.unit }}</span>
                                    </div>
                                </div>
                            </div>

                            <router-link 
                                :to="{ name: 'AdminPurchaseOrdersCreate', query: { supplier_id: suggestion.supplier.id } }"
                                class="w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-center text-[10px] shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95 group-hover:scale-[1.02] cursor-pointer"
                            >
                                Buat Draft Order Sekarang
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Summary Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 delay-100">
                    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pengadaan</p>
                        <p class="text-3xl font-serif font-black text-slate-900">{{ purchaseOrders.length }}</p>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bahan Baku Aktif</p>
                        <p class="text-3xl font-serif font-black text-amber-600">{{ rawMaterials.length }}</p>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier Terdaftar</p>
                        <p class="text-3xl font-serif font-black text-slate-900">{{ suppliers.length }}</p>
                    </div>
                </div>

                <!-- PO List -->
                <div class="overflow-x-auto delay-200">
                    <table class="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr class="text-slate-400">
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Order Info</th>
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Supplier</th>
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Bahan</th>
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Total</th>
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="po in purchaseOrders" :key="po.id" class="group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-1">
                                <td class="py-6 px-8 first:rounded-l-[2rem]">
                                    <router-link :to="{ name: 'AdminPurchaseOrdersShow', params: { id: po.id } }" class="block cursor-pointer">
                                        <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-600 transition-colors">#{{ po.poNumber || po.order_number }}</div>
                                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ new Date(po.createdAt).toLocaleDateString('id-ID') }}</div>
                                    </router-link>
                                </td>
                                <td class="py-6 px-8">
                                    <span class="text-sm font-black text-slate-700">{{ po.supplier?.name || '-' }}</span>
                                </td>
                                <td class="py-6 px-8">
                                    <div class="flex flex-wrap gap-1">
                                        <span v-for="item in (po.purchaseOrderItems || po.items || []).slice(0, 2)" :key="item.id" class="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {{ item.rawMaterial?.name || item.raw_material?.name || '-' }}
                                        </span>
                                        <span v-if="(po.purchaseOrderItems || po.items || []).length > 2" class="text-[9px] font-black text-slate-300 uppercase tracking-widest self-center ml-1">
                                            +{{ (po.purchaseOrderItems || po.items).length - 2 }}
                                        </span>
                                    </div>
                                </td>
                                <td class="py-6 px-8 text-sm font-black text-slate-900">
                                    Rp {{ formatPrice(calculateTotal(po)) }}
                                </td>
                                <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                    <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <router-link
                                            :to="{ name: 'AdminPurchaseOrdersShow', params: { id: po.id } }"
                                            class="bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                                            title="Detail PO"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        </router-link>
                                        
                                        <button
                                            @click="deletePO(po.id)"
                                            class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                                            title="Hapus Riwayat"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="purchaseOrders.length === 0">
                                <td colspan="5" class="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">Belum ada riwayat stok masuk.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
