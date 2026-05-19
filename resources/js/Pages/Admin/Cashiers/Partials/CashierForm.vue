<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    cashier: {
        type: Object,
        default: null
    }
});

const isEdit = !!props.cashier;

const form = useForm({
    name: props.cashier?.name || '',
    email: props.cashier?.email || '',
    pin: props.cashier?.pin || '',
    password: '',
});

// PIN Generator Helper
const generateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    form.pin = randomPin;
};

const submit = () => {
    if (isEdit) {
        form.put(route('admin.cashiers.update', props.cashier.id));
    } else {
        form.post(route('admin.cashiers.store'));
    }
};
</script>

<template>
    <form @submit.prevent="submit" class="pb-40">
        <div class="space-y-16">
            <!-- SECTION 1: Informasi Profil -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Profil Kasir</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Nama lengkap dan email kasir untuk identifikasi login serta tanda tangan transaksi.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Nama Lengkap</label>
                        <input v-model="form.name" type="text" placeholder="Misal: Budi Santoso..." class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-lg shadow-sm" required autofocus>
                        <div v-if="form.errors.name" class="text-red-500 text-xs mt-2 ml-1">{{ form.errors.name }}</div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Alamat Email</label>
                        <input v-model="form.email" type="email" placeholder="Contoh: budi@denjavas.com..." class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-lg shadow-sm" required>
                        <div v-if="form.errors.email" class="text-red-500 text-xs mt-2 ml-1">{{ form.errors.email }}</div>
                    </div>
                </div>
            </section>

            <!-- Divider -->
            <div class="h-px bg-slate-200/50"></div>

            <!-- SECTION 2: Otorisasi & Akses -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Otorisasi & Keamanan</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">PIN 6-digit untuk membuka/menutup shift kasir, dan password untuk akses otentikasi akun.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-6">
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">PIN Otorisasi Shift (6 Digit)</label>
                            <button type="button" @click="generateRandomPin" class="text-[10px] font-black text-amber-700 hover:text-amber-800 uppercase tracking-widest transition-colors">Generate PIN</button>
                        </div>
                        <input v-model="form.pin" type="text" maxlength="6" placeholder="Contoh: 123456" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-lg shadow-sm font-mono tracking-widest" required>
                        <div v-if="form.errors.pin" class="text-red-500 text-xs mt-2 ml-1">{{ form.errors.pin }}</div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                            {{ isEdit ? 'Password Baru (Opsional)' : 'Password Akun' }}
                        </label>
                        <input v-model="form.password" type="password" :placeholder="isEdit ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'" class="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10 transition-all font-bold text-lg shadow-sm" :required="!isEdit">
                        <div v-if="form.errors.password" class="text-red-500 text-xs mt-2 ml-1">{{ form.errors.password }}</div>
                    </div>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-[#1C1E23] border border-amber-700/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-5 pl-5">
                <div class="w-12 h-12 bg-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-700/20">
                    <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <span class="text-amber-500 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Akun Kasir' : 'Simpan Akun Kasir' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Perubahan otorisasi akan langsung aktif' : 'Kasir baru akan segera bisa melakukan login' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <Link :href="route('admin.cashiers.index')" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800">Batal</Link>
                <button type="submit" :disabled="form.processing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-700/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95">
                    {{ form.processing ? 'Memproses...' : 'Simpan Kasir' }}
                </button>
            </div>
        </div>
    </form>
</template>
