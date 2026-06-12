<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const adminStore = useAdminStore();

const search = ref('');
const isLoading = ref(true);
const flashMessage = ref('');

const rawMaterials = computed(() => {
    let list = adminStore.rawMaterials;
    
    if (search.value) {
        const q = search.value.toLowerCase();
        list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    
    return list;
});

const fetchData = async (force = false) => {
    if (!adminStore.isRawMaterialsLoaded) {
        isLoading.value = true;
    }
    try {
        await adminStore.fetchRawMaterials(force);
    } catch (e) {
        console.error("Failed to fetch raw materials", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchData();
    fetchData(true);
});

const resetSearch = () => {
    search.value = '';
};

const deleteMaterial = async (id) => {
    if (confirm('Yakin ingin menghapus bahan baku ini? Ini dapat merusak data resep yang sudah ada.')) {
        try {
            await api.delete(`/admin/raw-materials/${id}`);
            flashMessage.value = 'Bahan baku berhasil dihapus';
            await fetchData(true);
            setTimeout(() => { flashMessage.value = ''; }, 3000);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Gagal menghapus bahan baku');
        }
    }
};
</script>

<template>
            <div class="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Stok <span class="text-amber-700 italic">Bahan Baku</span>
                    </h2>
                    <p class="text-slate-400 text-[10px] sm:text-xs mt-1.5 font-medium">
                        Pantau ketersediaan, par level, biaya satuan, serta ambang minimum stok bahan baku di Denjavas Cafe.
                    </p>
                    <div class="flex items-center gap-3 mt-2 text-[10px] sm:text-xs font-bold text-slate-500">
                        <span>Total Item: {{ rawMaterials.length }} Bahan</span>
                        <span class="text-slate-300">•</span>
                        <span class="text-rose-600">Kritis/Menipis: {{ rawMaterials.filter(m => m.currentStock <= m.minimumStock).length }} Bahan</span>
                    </div>
                </div>
                <router-link
                    :to="{ name: 'AdminRawMaterialsCreate' }"
                    class="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 text-center flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Bahan Baku
                </router-link>
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
                        placeholder="Cari nama bahan baku (kopi, gula, susu...)" 
                        class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all text-sm font-bold shadow-sm"
                    >
                    <button 
                        v-if="search" 
                        @click="resetSearch"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
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

            <div v-else class="delay-200">
                <!-- Desktop Table View -->
                <div class="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
                    <table class="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr class="text-slate-400">
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Bahan Baku</th>
                                <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Stok / Min / Par</th>
                                <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Unit Cost</th>
                                <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Satuan</th>
                                <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Default Supplier</th>
                                <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="material in rawMaterials" :key="material.id" class="group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl hover:-translate-y-1">
                                <td class="py-6 px-8 first:rounded-l-[2rem]">
                                    <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-700 transition-colors">{{ material.name }}</div>
                                </td>
                                <td class="py-6 px-6">
                                    <div class="flex items-baseline gap-2">
                                        <span :class="(material.currentStock || material.current_stock) <= (material.minimumStock || material.minimum_stock) ? 'text-red-600' : 'text-slate-900'" class="text-2xl font-black">
                                            {{ Number(material.currentStock || material.current_stock || 0).toLocaleString('id-ID') }}
                                        </span>
                                        <span class="text-[10px] font-black text-slate-300">/ {{ material.minimumStock || material.minimum_stock }} / {{ material.parLevel || material.par_level }}</span>
                                    </div>
                                </td>
                                <td class="py-6 px-6">
                                    <span class="text-sm font-black text-slate-400">Rp</span>
                                    <span class="text-sm font-black text-slate-900 ml-1">{{ parseInt(material.costPerUnit || material.cost_per_unit || 0).toLocaleString('id-ID') }}</span>
                                </td>
                                <td class="py-6 px-6">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                        {{ material.unit }}
                                    </span>
                                </td>
                                <td class="py-6 px-6">
                                    <span class="text-xs font-bold text-slate-500">
                                        {{ (material.defaultSupplier || material.default_supplier) ? (material.defaultSupplier || material.default_supplier).name : '-' }}
                                    </span>
                                </td>
                                <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                    <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <router-link
                                            :to="{ name: 'AdminRawMaterialsEdit', params: { id: material.id } }"
                                            class="bg-white border border-slate-200 text-slate-400 hover:text-amber-700 hover:border-amber-500 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                                            title="Edit Bahan"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </router-link>
                                        
                                        <button
                                            @click="deleteMaterial(material.id)"
                                            class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                                            title="Hapus Bahan"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="rawMaterials.length === 0">
                                <td colspan="6" class="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">Belum ada bahan baku yang terdaftar.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Card View -->
                <div class="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 -mx-4 sm:mx-0 px-4 sm:px-0">
                    <div 
                        v-for="material in rawMaterials" 
                        :key="material.id" 
                        class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
                    >
                        <div>
                            <div class="flex items-start justify-between mb-4">
                                <div class="font-serif font-black text-slate-900 text-xl">{{ material.name }}</div>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                    {{ material.unit }}
                                </span>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 my-6">
                                <div class="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stok Saat Ini</span>
                                    <div class="flex items-baseline gap-1.5">
                                        <span :class="(material.currentStock || material.current_stock) <= (material.minimumStock || material.minimum_stock) ? 'text-red-600 animate-pulse' : 'text-slate-900'" class="text-2xl font-black">
                                            {{ Number(material.currentStock || material.current_stock || 0).toLocaleString('id-ID') }}
                                        </span>
                                    </div>
                                </div>
                                <div class="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min / Par Level</span>
                                    <span class="text-sm font-black text-slate-600">
                                        {{ material.minimumStock || material.minimum_stock }} / {{ material.parLevel || material.par_level }}
                                    </span>
                                </div>
                                <div class="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Biaya Satuan</span>
                                    <span class="text-sm font-black text-slate-900">
                                        Rp {{ parseInt(material.costPerUnit || material.cost_per_unit || 0).toLocaleString('id-ID') }}
                                    </span>
                                </div>
                                <div class="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Supplier Utama</span>
                                    <span class="text-xs font-bold text-slate-500 truncate block">
                                        {{ (material.defaultSupplier || material.default_supplier) ? (material.defaultSupplier || material.default_supplier).name : '-' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <router-link
                                :to="{ name: 'AdminRawMaterialsEdit', params: { id: material.id } }"
                                class="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-800 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 cursor-pointer border border-amber-200/40"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                            </router-link>
                            <button
                                @click="deleteMaterial(material.id)"
                                class="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 cursor-pointer border border-rose-200/40"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                Hapus
                            </button>
                        </div>
                    </div>
                    
                    <div v-if="rawMaterials.length === 0" class="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 px-4">
                        <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">Belum ada bahan baku yang terdaftar.</p>
                    </div>
                </div>
            </div>
        </div>
    </template>

<style scoped>
/* Hide spin buttons for numeric inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
