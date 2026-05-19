<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    show: Boolean,
});

const form = useForm({
    pin: '',
    opening_cash: 0,
});

const emit = defineEmits(['close', 'success']);

const submit = () => {
    form.post(route('pos.shifts.start'), {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
            emit('success');
        },
    });
};

const appendPin = (num) => {
    if (form.pin.length < 6) {
        form.pin += num;
    }
};

const clearPin = () => {
    form.pin = '';
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
                    <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                        <svg class="text-amber-700" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h2 class="text-2xl font-serif font-black text-amber-700 uppercase tracking-widest">Buka Kasir</h2>
                    <p class="text-slate-500 text-sm mt-2">Masukkan PIN dan Saldo Awal Laci</p>
                </div>

                <form @submit.prevent="submit" class="space-y-6">
                    <!-- PIN Input (Hidden Display) -->
                    <div class="space-y-2">
                        <div class="flex justify-center gap-3">
                            <div v-for="i in 6" :key="i" 
                                :class="form.pin.length >= i ? 'bg-amber-600 scale-110 shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-slate-200'"
                                class="w-4 h-4 rounded-full transition-all duration-200">
                            </div>
                        </div>
                        <p v-if="form.errors.pin" class="text-red-500 text-xs text-center mt-2">{{ form.errors.pin }}</p>
                    </div>

                    <!-- Opening Cash -->
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Saldo Awal (Rp)</label>
                        <input v-model.number="form.opening_cash" type="number" min="0" step="1000" class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 text-center text-2xl font-bold text-slate-900 focus:border-amber-600 focus:ring focus:ring-amber-600/10 focus:ring-opacity-50 transition-all outline-none" required>
                    </div>

                    <!-- Numpad for PIN -->
                    <div class="grid grid-cols-3 gap-3">
                        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" type="button" @click="appendPin(n.toString())" class="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xl font-bold transition-all active:scale-90">
                            {{ n }}
                        </button>
                        <button type="button" @click="clearPin" class="h-16 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 font-bold transition-all active:scale-90 uppercase text-xs tracking-widest">Clear</button>
                        <button type="button" @click="appendPin('0')" class="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xl font-bold transition-all active:scale-90">0</button>
                        <button type="submit" :disabled="form.pin.length < 6 || form.processing" class="h-16 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black transition-all active:scale-90 disabled:opacity-50 shadow-md">
                            {{ form.processing ? '...' : 'OK' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
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
