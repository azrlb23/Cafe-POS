<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    rawMaterials: Array
});

const isModalOpen = ref(false);
const editingMaterial = ref(null);

const form = useForm({
    name: '',
    unit: '',
    current_stock: 0
});

const openModal = (material = null) => {
    editingMaterial.value = material;
    if (material) {
        form.name = material.name;
        form.unit = material.unit;
        form.current_stock = material.current_stock;
    } else {
        form.reset();
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    editingMaterial.value = null;
    form.reset();
};

const submit = () => {
    if (editingMaterial.value) {
        form.put(route('admin.raw-materials.update', editingMaterial.value.id), {
            onSuccess: () => closeModal()
        });
    } else {
        form.post(route('admin.raw-materials.store'), {
            onSuccess: () => closeModal()
        });
    }
};

const deleteMaterial = (id) => {
    if (confirm('Yakin ingin menghapus bahan baku ini? Ini dapat merusak data resep yang sudah ada.')) {
        form.delete(route('admin.raw-materials.destroy', id));
    }
};
</script>

<template>
    <Head title="Stok Bahan Baku" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 class="text-2xl font-serif font-bold text-[#292524] leading-tight">
                    Stok <span class="text-amber-600">Bahan Baku</span>
                </h2>
                <button
                    @click="openModal()"
                    class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-black transition-all duration-300 shadow-lg text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95"
                >
                    + Tambah Bahan Baku
                </button>
            </div>
        </template>

        <div class="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <!-- Flash Messages -->
            <div v-if="$page.props.flash && $page.props.flash.success" class="mb-8 bg-white border-l-4 border-amber-500 text-slate-900 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
                <div class="flex items-center gap-3">
                    <div class="bg-amber-100 p-2 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <span class="font-bold tracking-wide">{{ $page.props.flash.success }}</span>
                </div>
            </div>

            <div class="overflow-x-auto -mx-4 sm:mx-0">
                <table class="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr class="text-slate-400">
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Bahan Baku</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Stok Saat Ini</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Satuan</th>
                            <th class="pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                            <th class="pb-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-right">Manajemen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="material in rawMaterials" :key="material.id" class="group bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl">
                            <td class="py-6 px-8 first:rounded-l-[2rem]">
                                <div class="font-serif font-black text-slate-900 text-xl group-hover:text-amber-600 transition-colors">{{ material.name }}</div>
                            </td>
                            <td class="py-6 px-6">
                                <span :class="material.current_stock <= 10 ? 'text-red-600' : 'text-slate-900'" class="text-2xl font-black">
                                    {{ material.current_stock.toLocaleString('id-ID') }}
                                </span>
                            </td>
                            <td class="py-6 px-6">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                    {{ material.unit }}
                                </span>
                            </td>
                            <td class="py-6 px-6">
                                <div v-if="material.current_stock <= 10" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                                    Stok Menipis
                                </div>
                                <div v-else class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Aman
                                </div>
                            </td>
                            <td class="py-6 px-8 text-right last:rounded-r-[2rem]">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <button
                                        @click="openModal(material)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-sm"
                                        title="Edit Bahan"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    
                                    <button
                                        @click="deleteMaterial(material.id)"
                                        class="bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-400 p-3 rounded-2xl transition-all shadow-sm"
                                        title="Hapus Bahan"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="rawMaterials.length === 0">
                            <td colspan="5" class="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <p class="text-slate-400 font-black uppercase text-[10px] tracking-widest leading-loose">Belum ada bahan baku yang terdaftar.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Form -->
        <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeModal"></div>
            <div class="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
                <h3 class="text-2xl font-serif font-bold text-slate-900 mb-6">
                    {{ editingMaterial ? 'Edit' : 'Tambah' }} Bahan Baku
                </h3>
                
                <form @submit.prevent="submit" class="space-y-6">
                    <div>
                        <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nama Bahan</label>
                        <input v-model="form.name" type="text" placeholder="Misal: Espresso Beans" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold" required>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Stok Saat Ini</label>
                            <input v-model.number="form.current_stock" type="number" step="0.01" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-amber-500 font-bold" required>
                        </div>
                        <div>
                            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Satuan</label>
                            <input v-model="form.unit" type="text" placeholder="gr, ml, pcs" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-amber-500 font-bold" required>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="closeModal" class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Batal</button>
                        <button type="submit" :disabled="form.processing" class="flex-1 bg-amber-600 text-white py-3 rounded-xl font-black shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all disabled:opacity-50">
                            {{ form.processing ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </AuthenticatedLayout>
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
