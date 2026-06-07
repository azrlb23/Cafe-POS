<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api';

const props = defineProps({
    supplier: {
        type: Object,
        default: null
    }
});

const isEdit = !!props.supplier;
const router = useRouter();

const form = ref({
    name: props.supplier?.name || '',
    address: props.supplier?.address || '',
    contact_person: props.supplier?.contactPerson || props.supplier?.contact_person || '',
    phone: props.supplier?.phone || '',
    email: props.supplier?.email || ''
});

const isProcessing = ref(false);

const submit = async () => {
    isProcessing.value = true;
    try {
        const payload = {
            name: form.value.name,
            address: form.value.address,
            contact_person: form.value.contact_person,
            phone: form.value.phone,
            email: form.value.email
        };

        if (isEdit) {
            await api.put(`/admin/suppliers/${props.supplier.id}`, payload);
        } else {
            await api.post('/admin/suppliers', payload);
        }
        router.push({ name: 'AdminSuppliers' });
    } catch (e) {
        console.error("Failed to save supplier", e);
        alert(e.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
        isProcessing.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-20">
            <!-- SECTION 1: Informasi Perusahaan -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Informasi Perusahaan</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Detail legal dan alamat operasional dari mitra supplier Anda.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div class="col-span-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nama Perusahaan / Toko</label>
                            <input v-model="form.name" type="text" placeholder="PT. Sukses Makmur Kopi" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-xl shadow-sm" required>
                        </div>
                        
                        <div class="col-span-2">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Alamat Lengkap</label>
                            <textarea v-model="form.address" rows="3" placeholder="Jl. Raya Utama No. 123..." class="w-full bg-white border border-slate-200 rounded-3xl px-8 py-6 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-medium text-slate-700 shadow-sm leading-relaxed"></textarea>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 2: Kontak Person -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Kontak Person (PIC)</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Informasi orang yang dapat dihubungi langsung untuk keperluan pemesanan stok.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                        <div class="col-span-2">
                            <label class="block text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-4 ml-1">Nama PIC (Person in Charge)</label>
                            <input v-model="form.contact_person" type="text" placeholder="Budi Santoso" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-slate-900 shadow-sm">
                        </div>

                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nomor Telepon / WhatsApp</label>
                            <input v-model="form.phone" type="text" placeholder="081234567890" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-slate-900 shadow-sm">
                        </div>

                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Alamat Email</label>
                            <input v-model="form.email" type="email" placeholder="budi@contoh.com" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-slate-900 shadow-sm">
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
                    <span class="text-amber-700 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Supplier' : 'Daftarkan Supplier' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Data rekanan akan segera diperbarui' : 'Mitra baru akan segera tersedia di sistem' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <router-link :to="{ name: 'AdminSuppliers' }" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800 cursor-pointer">Batal</router-link>
                <button type="submit" :disabled="isProcessing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-700/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer">
                    {{ isProcessing ? 'Memproses...' : 'Simpan Data Supplier' }}
                </button>
            </div>
        </div>
    </form>
</template>
