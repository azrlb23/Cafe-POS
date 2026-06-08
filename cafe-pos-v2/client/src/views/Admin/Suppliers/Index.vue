<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';

const router = useRouter();

const suppliers = ref([]);
const isLoading = ref(true);
const flashMessage = ref('');

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/admin/suppliers');
        suppliers.value = response.data.suppliers || [];
    } catch (e) {
        console.error("Failed to fetch suppliers", e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const deleteSupplier = async (id) => {
    if (confirm('Yakin ingin menghapus supplier ini?')) {
        try {
            await api.delete(`/admin/suppliers/${id}`);
            flashMessage.value = 'Supplier berhasil dihapus';
            fetchData();
            setTimeout(() => { flashMessage.value = ''; }, 3000);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Gagal menghapus supplier');
        }
    }
};
</script>

<template>
            <div class="max-w-[1400px] mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <!-- MODERN PAGE HEADER -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-800 tracking-tight leading-tight">
                        Mitra <span class="text-amber-700 italic">Supplier</span>
                    </h2>
                    <p class="text-slate-400 text-[10px] sm:text-xs mt-1.5 font-medium">
                        Kelola data rekanan supplier, alamat operasional, kontak PIC, serta hubungan rantai pasok Denjavas Cafe.
                    </p>
                    <div class="flex items-center gap-3 mt-2 text-[10px] sm:text-xs font-bold text-slate-500">
                        <span>Total Supplier: {{ suppliers.length }} Rekanan</span>
                    </div>
                </div>
                <router-link
                    :to="{ name: 'AdminSuppliersCreate' }"
                    class="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 text-center flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Supplier
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

            <div v-else class="overflow-x-auto delay-200">
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
                                <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-700 transition-colors">{{ supplier.name }}</div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ supplier.address || '-' }}</div>
                            </td>
                            <td class="py-6 px-8">
                                <span class="text-sm font-black text-slate-700">{{ supplier.contactPerson || supplier.contact_person || '-' }}</span>
                            </td>
                            <td class="py-6 px-8">
                                <div class="flex flex-col gap-1">
                                    <span class="text-xs font-bold text-slate-500">{{ supplier.phone || '-' }}</span>
                                    <span class="text-xs font-medium text-slate-400">{{ supplier.email || '-' }}</span>
                                </div>
                            </td>
                            <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <router-link
                                        :to="{ name: 'AdminSuppliersEdit', params: { id: supplier.id } }"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-700 hover:border-amber-500 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                                        title="Edit Supplier"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </router-link>
                                    
                                    <button
                                        @click="deleteSupplier(supplier.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
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
    </template>
