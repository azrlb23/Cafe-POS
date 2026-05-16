<script setup>
import { useForm, Link } from '@inertiajs/vue3';

const props = defineProps({
    supplier: {
        type: Object,
        default: null
    }
});

const isEdit = !!props.supplier;

const form = useForm({
    name: props.supplier?.name || '',
    contact_person: props.supplier?.contact_person || '',
    phone: props.supplier?.phone || '',
    email: props.supplier?.email || '',
    address: props.supplier?.address || '',
});

const submit = () => {
    if (isEdit) {
        form.put(route('admin.suppliers.update', props.supplier.id));
    } else {
        form.post(route('admin.suppliers.store'));
    }
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-20">
            <!-- SECTION 1: Profil Supplier -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Profil Supplier</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Informasi identitas perusahaan atau perorangan yang menyuplai bahan baku ke cafe Anda.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="space-y-8">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nama Supplier / Perusahaan</label>
                            <input v-model="form.name" type="text" placeholder="Misal: PT. Kopi Nusantara" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-xl shadow-sm" required autofocus>
                        </div>
                        
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nama Kontak (Contact Person)</label>
                            <input v-model="form.contact_person" type="text" placeholder="Misal: Bapak Budi" class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-lg shadow-sm">
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 2: Kontak & Alamat -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Kontak & Alamat</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Detail komunikasi untuk mempermudah pemesanan stok barang.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nomor Telepon / WhatsApp</label>
                            <input v-model="form.phone" type="text" placeholder="0812xxxx" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold shadow-sm">
                        </div>

                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                            <input v-model="form.email" type="email" placeholder="supplier@mail.com" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold shadow-sm">
                        </div>

                        <div class="col-span-2 space-y-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Alamat Kantor / Gudang</label>
                            <textarea v-model="form.address" rows="4" placeholder="Detail alamat lengkap..." class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-6 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-sm leading-relaxed shadow-sm"></textarea>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-slate-900 border border-amber-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-5 pl-5">
                <div class="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                    <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m14-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                    <span class="text-amber-500 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Supplier' : 'Daftarkan Supplier' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Informasi supplier akan diperbarui' : 'Supplier baru akan tersimpan dalam daftar relasi' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <Link :href="route('admin.suppliers.index')" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800">Batal</Link>
                <button type="submit" :disabled="form.processing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-500/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95">
                    {{ form.processing ? 'Memproses...' : 'Simpan Data Supplier' }}
                </button>
            </div>
        </div>
    </form>
</template>
