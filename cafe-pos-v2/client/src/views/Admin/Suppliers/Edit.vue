<script setup lang="ts">
import SupplierForm from './Partials/SupplierForm.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const supplier = ref(null);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const response = await api.get(`/admin/suppliers/${route.params.id}`);
        supplier.value = response.data.supplier;
    } catch (e) {
        console.error("Failed to fetch supplier data", e);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
            <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
            <!-- Back Button and Title in Canvas -->
            <div class="flex items-center gap-6 mb-10">
                <router-link :to="{ name: 'AdminSuppliers' }" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90 cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </router-link>
                <div>
                    <h2 class="text-4xl font-serif font-black text-[#1C1917] tracking-tight leading-tight">
                        Edit <span class="text-amber-600 italic">Supplier</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Memperbarui Informasi Mitra: {{ supplier?.name || 'Loading...' }}
                    </p>
                </div>
            </div>

            <div v-if="isLoading" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex justify-center items-center">
                <div class="w-8 h-8 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>

            <div v-else-if="supplier" class="delay-100">
                <SupplierForm :supplier="supplier" />
            </div>
            
            <div v-else class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Supplier tidak ditemukan</div>
            </div>
        </div>
    </template>
