<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';

const props = defineProps({
    category: {
        type: Object,
        default: null
    }
});

const isEdit = !!props.category;
const router = useRouter();

const form = ref({
    name: props.category?.name || '',
});
const isProcessing = ref(false);
const formErrors = ref({});

const submit = async () => {
    isProcessing.value = true;
    formErrors.value = {};
    
    try {
        if (isEdit) {
            await api.put(`/admin/categories/${props.category.id}`, form.value);
        } else {
            await api.post('/admin/categories', form.value);
        }
        router.push({ name: 'AdminCategories' });
    } catch (e) {
        if (e.response && e.response.status === 422) {
            // Validation errors
            // If API returns Laravel-style validation errors
            const errors = e.response.data.errors;
            if (errors) {
                // simple mapping for now
                if (errors.name) formErrors.value.name = errors.name[0];
            } else if (e.response.data.message) {
                formErrors.value.name = e.response.data.message;
            }
        } else {
            console.error("Failed to save category", e);
            alert("Terjadi kesalahan sistem.");
        }
    } finally {
        isProcessing.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-20">
            <!-- SECTION 1: Informasi Utama -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Informasi Kategori</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Nama kategori yang akan digunakan untuk mengelompokkan menu di aplikasi POS.</p>
                </div>
                
                <div class="xl:col-span-2">
                    <div class="space-y-4">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nama Kategori</label>
                        <input v-model="form.name" type="text" placeholder="Misal: Coffee, Non-Coffee, Snack..." class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-xl shadow-sm" required autofocus>
                        <p v-if="formErrors.name" class="text-red-500 text-xs mt-2 ml-2 font-bold">{{ formErrors.name }}</p>
                    </div>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-slate-900 border border-amber-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-5 pl-5">
                <div class="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                    <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <span class="text-amber-500 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Kategori' : 'Simpan Kategori' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Perubahan akan langsung terlihat di POS' : 'Kategori baru akan segera tersedia untuk menu' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <router-link :to="{ name: 'AdminCategories' }" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800 cursor-pointer">Batal</router-link>
                <button type="submit" :disabled="isProcessing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-500/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer">
                    {{ isProcessing ? 'Memproses...' : 'Simpan Kategori' }}
                </button>
            </div>
        </div>
    </form>
</template>
