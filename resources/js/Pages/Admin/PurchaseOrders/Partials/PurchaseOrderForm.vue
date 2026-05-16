<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';
import DatePicker from '@/Components/DatePicker.vue';

const props = defineProps({
    suppliers: Array,
    rawMaterials: Array,
    autofill: Object,
    nextOrderNumber: String
});

const form = useForm({
    supplier_id: props.autofill?.supplier_id || '',
    order_number: props.nextOrderNumber || '',
    purchase_date: new Date().toISOString().substr(0, 10),
    notes: '',
    items: props.autofill?.items?.map(i => ({
        raw_material_id: i.raw_material_id,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
        name: i.name, // helper for display
        unit: i.unit
    })) || []
});

const addItem = () => {
    form.items.push({
        raw_material_id: '',
        quantity: 0,
        unit_cost: 0
    });
};

const removeItem = (index) => {
    form.items.splice(index, 1);
};

const updateItemInfo = (index) => {
    const material = props.rawMaterials.find(m => m.id === form.items[index].raw_material_id);
    if (material) {
        form.items[index].unit_cost = material.cost_per_unit;
        form.items[index].unit = material.unit;
    }
};

const submit = () => {
    form.post(route('admin.purchase-orders.store'));
};

const calculateTotal = () => {
    return form.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-20">
            <!-- SECTION 1: Detail Transaksi -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Detail Transaksi</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Informasi utama pembelian stok seperti nomor referensi, supplier, dan tanggal belanja.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div class="col-span-2 md:col-span-1">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nomor Pesanan (PO Number)</label>
                            <input v-model="form.order_number" type="text" class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-black text-lg shadow-sm" required>
                        </div>
                        
                        <div class="col-span-2 md:col-span-1">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Tanggal Pembelian</label>
                            <DatePicker 
                                v-model="form.purchase_date" 
                                placeholder="Pilih Tanggal"
                            />
                        </div>

                        <div class="col-span-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Supplier</label>
                            <select v-model="form.supplier_id" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-xl shadow-sm" required>
                                <option value="">Pilih Supplier Pengirim</option>
                                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                                    {{ supplier.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 2: Daftar Item Barang -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <div class="flex justify-between items-start xl:block">
                        <div>
                            <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Daftar Bahan</h3>
                            <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Daftar bahan baku yang dibeli beserta jumlah dan harga terbarunya.</p>
                        </div>
                        <button type="button" @click="addItem" class="mt-6 bg-slate-900 text-white hover:bg-amber-600 px-8 py-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> Tambah Bahan
                        </button>
                    </div>
                </div>
                
                <div class="xl:col-span-2">
                    <div v-if="form.items.length === 0" class="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p class="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Belum ada bahan yang dimasukkan</p>
                    </div>
                    
                    <div v-else class="space-y-6">
                        <div v-for="(item, index) in form.items" :key="index" class="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:border-amber-200">
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                <div class="md:col-span-5 space-y-2">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bahan Baku</label>
                                    <select v-model="item.raw_material_id" @change="updateItemInfo(index)" class="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500" required>
                                        <option value="">Pilih Bahan...</option>
                                        <option v-for="m in rawMaterials" :key="m.id" :value="m.id">{{ m.name }}</option>
                                    </select>
                                </div>
                                <div class="md:col-span-3 space-y-2">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah</label>
                                    <div class="relative">
                                        <input v-model.number="item.quantity" type="number" step="0.01" class="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-900 focus:ring-2 focus:ring-amber-500" required>
                                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {{ rawMaterials.find(m => m.id === item.raw_material_id)?.unit || '' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="md:col-span-3 space-y-2">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Beli (@)</label>
                                    <div class="relative">
                                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">Rp</span>
                                        <input v-model.number="item.unit_cost" type="number" step="0.01" class="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-4 font-black text-slate-900 focus:ring-2 focus:ring-amber-500" required>
                                    </div>
                                </div>
                                <div class="md:col-span-1 flex justify-center pb-2">
                                    <button type="button" @click="removeItem(index)" class="text-slate-300 hover:text-red-500 transition-colors">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 3: Catatan Tambahan -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Informasi Penutup</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Tambahkan catatan khusus terkait pengiriman atau kondisi barang jika diperlukan.</p>
                </div>
                
                <div class="xl:col-span-2">
                    <textarea v-model="form.notes" rows="4" placeholder="Misal: Barang diterima dengan kondisi baik, pengiriman terlambat 1 hari, dll..." class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-6 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-sm leading-relaxed shadow-sm"></textarea>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-slate-900 border border-amber-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-8 pl-5">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
                    </div>
                    <div>
                        <span class="text-emerald-500 font-serif text-xl font-bold tracking-wide">Total Belanja</span>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Rp {{ calculateTotal().toLocaleString('id-ID') }}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <Link :href="route('admin.purchase-orders.index')" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800">Batal</Link>
                <button type="submit" :disabled="form.processing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-500/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95">
                    {{ form.processing ? 'Memproses...' : 'Simpan Stok Masuk' }}
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
