<script setup>
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    show: Boolean,
});

const emit = defineEmits(['close']);

const form = useForm({
    amount: '',
    description: '',
});

const submit = () => {
    form.post(route('pos.petty-cash'), {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
            emit('close');
        },
    });
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div class="p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                        <svg class="text-amber-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h2 class="text-2xl font-serif font-black text-amber-600 uppercase tracking-widest">Kas Keluar</h2>
                    <p class="text-slate-500 text-sm mt-2">Catat pengeluaran operasional darurat</p>
                </div>

                <form @submit.prevent="submit" class="space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Nominal (Rp)</label>
                        <input v-model.number="form.amount" type="number" min="100" step="100" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 text-center text-2xl font-black text-slate-900 focus:border-amber-400 outline-none transition-all" placeholder="50000" required>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Keterangan / Alasan</label>
                        <textarea v-model="form.description" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-amber-400 outline-none" placeholder="Cth: Beli es batu tambahan..." required></textarea>
                    </div>

                    <div class="flex gap-4">
                        <button type="button" @click="$emit('close')" class="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">Batal</button>
                        <button type="submit" :disabled="form.processing" class="flex-1 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
                            {{ form.processing ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
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
