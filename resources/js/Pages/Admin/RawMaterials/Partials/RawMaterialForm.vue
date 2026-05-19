<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import CustomSelect from '@/Components/CustomSelect.vue';

const props = defineProps({
    material: {
        type: Object,
        default: null
    },
    suppliers: {
        type: Array,
        required: true
    }
});

const isEdit = !!props.material;

const form = useForm({
    name: props.material?.name || '',
    unit: props.material?.unit || '',
    cost_per_unit: props.material?.cost_per_unit || 0,
    current_stock: props.material?.current_stock || 0,
    minimum_stock: props.material?.minimum_stock || 0,
    par_level: props.material?.par_level || 0,
    default_supplier_id: props.material?.default_supplier_id || ''
});

const submit = () => {
    if (isEdit) {
        form.put(route('admin.raw-materials.update', props.material.id));
    } else {
        form.post(route('admin.raw-materials.store'));
    }
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-20">
            <!-- SECTION 1: Informasi Dasar -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Informasi Utama</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Identitas dasar bahan baku dan ketersediaan stok fisik saat ini di gudang.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div class="col-span-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nama Bahan Baku</label>
                            <input v-model="form.name" type="text" placeholder="Misal: Biji Kopi Arabika" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-xl shadow-sm" required>
                        </div>
                        
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Stok Saat Ini</label>
                            <div class="relative group">
                                <input v-model.number="form.current_stock" type="number" step="0.01" class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-black text-lg shadow-sm" required>
                                <span class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fisik</span>
                            </div>
                        </div>

                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Satuan Ukur</label>
                            <input v-model="form.unit" type="text" placeholder="gr, ml, pcs" class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-lg shadow-sm" required>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 2: Otomasi & Inventory -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Otomasi & Supplier</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Pengaturan ambang batas untuk fitur peringatan stok menipis dan rekomendasi belanja otomatis.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] ml-1">Minimum Stok (Threshold)</label>
                            <input v-model.number="form.minimum_stock" type="number" step="0.01" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold shadow-sm">
                            <p class="text-[10px] text-slate-400 italic">Sistem akan memberi peringatan jika stok di bawah angka ini.</p>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] ml-1">Par Level (Ideal)</label>
                            <input v-model.number="form.par_level" type="number" step="0.01" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold shadow-sm">
                            <p class="text-[10px] text-slate-400 italic">Target jumlah stok yang ingin dipertahankan di gudang.</p>
                        </div>

                        <div class="col-span-2 space-y-2 pt-4">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Default Supplier</label>
                            <CustomSelect 
                                v-model="form.default_supplier_id" 
                                :options="suppliers" 
                                label-key="name" 
                                value-key="id" 
                                placeholder="Pilih Supplier Pengadaan..." 
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 3: Finansial -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Data Keuangan</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Informasi harga beli terakhir untuk kalkulasi HPP dan nilai inventaris cafe Anda.</p>
                </div>
                
                <div class="xl:col-span-2">
                    <div class="max-w-md space-y-2">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Harga Beli per Satuan (Cost)</label>
                        <div class="relative group">
                            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-amber-700 transition-colors">Rp</span>
                            <input v-model.number="form.cost_per_unit" type="number" step="0.01" class="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-black text-2xl shadow-sm" required>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-slate-900 border border-amber-700/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-5 pl-5">
                <div class="w-12 h-12 bg-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-700/20">
                    <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <span class="text-amber-700 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Stok' : 'Daftarkan Bahan' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Perubahan stok akan langsung tercatat' : 'Bahan baru akan segera tersedia untuk resep' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <Link :href="route('admin.raw-materials.index')" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800">Batal</Link>
                <button type="submit" :disabled="form.processing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-700/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95">
                    {{ form.processing ? 'Memproses...' : 'Simpan Data Bahan' }}
                </button>
            </div>
        </div>
    </form>
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
