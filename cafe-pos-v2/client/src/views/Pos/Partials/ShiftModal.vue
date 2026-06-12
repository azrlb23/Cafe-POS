<script setup lang="ts">
import { ref } from 'vue';
import api from '@/utils/api';

const props = defineProps({
    show: Boolean,
});

const form = ref({
    pin: '',
    opening_cash: 0,
});

const formErrors = ref({});
const processing = ref(false);

const emit = defineEmits(['close', 'success']);

const submit = async () => {
    processing.value = true;
    formErrors.value = {};
    
    try {
        await api.post('/pos/shifts/start', {
            pin: form.value.pin,
            opening_cash: form.value.opening_cash
        });
        
        form.value.pin = '';
        form.value.opening_cash = 0;
        emit('success');
    } catch (e) {
        if (e.response && e.response.status === 422 && e.response.data.errors) {
            formErrors.value = e.response.data.errors;
        } else if (e.response && e.response.status === 400) {
            formErrors.value.pin = e.response.data.message;
        } else {
            formErrors.value.general = 'Terjadi kesalahan sistem.';
        }
    } finally {
        processing.value = false;
    }
};

const appendPin = (num) => {
    if (form.value.pin.length < 6) {
        form.value.pin += num;
    }
};

const clearPin = () => {
    form.value.pin = '';
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in duration-300">
            <div class="p-5 sm:p-8">
                <div class="text-center mb-4 sm:mb-6">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-amber-200">
                        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-serif font-black text-amber-700 uppercase tracking-widest">Buka Kasir</h2>
                    <p class="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">Masukkan PIN dan Saldo Awal Laci</p>
                </div>

                <form @submit.prevent="submit" class="space-y-4 sm:space-y-6">
                    <!-- PIN Input (Hidden Display) -->
                    <div class="space-y-2">
                        <div class="flex justify-center gap-3">
                            <div v-for="i in 6" :key="i" 
                                :class="form.pin.length >= i ? 'bg-amber-600 scale-110 shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-slate-200'"
                                class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200">
                            </div>
                        </div>
                        <p v-if="formErrors.pin" class="text-red-500 text-xs text-center mt-2">{{ formErrors.pin }}</p>
                        <p v-if="formErrors.shift" class="text-red-500 text-xs text-center mt-2">{{ formErrors.shift }}</p>
                        <p v-if="formErrors.general" class="text-red-500 text-xs text-center mt-2">{{ formErrors.general }}</p>
                    </div>

                    <!-- Opening Cash -->
                    <div>
                        <label class="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 sm:mb-2 text-center">Saldo Awal (Rp)</label>
                        <input v-model.number="form.opening_cash" type="number" min="0" step="1000" class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 sm:py-3.5 text-center text-lg sm:text-2xl font-bold text-slate-900 focus:border-amber-600 focus:ring focus:ring-amber-600/10 focus:ring-opacity-50 transition-all outline-none" required>
                    </div>

                    <!-- Numpad for PIN -->
                    <div class="grid grid-cols-3 gap-2 sm:gap-3">
                        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" type="button" @click="appendPin(n.toString())" class="h-12 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-lg font-bold transition-all active:scale-90 cursor-pointer">
                             {{ n }}
                         </button>
                         <button type="button" @click="clearPin" class="h-12 sm:h-14 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 font-bold transition-all active:scale-90 uppercase text-[10px] tracking-wider cursor-pointer">Clear</button>
                         <button type="button" @click="appendPin('0')" class="h-12 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-lg font-bold transition-all active:scale-90 cursor-pointer">0</button>
                         <button type="submit" :disabled="form.pin.length < 6 || processing" class="h-12 sm:h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black transition-all active:scale-90 disabled:opacity-50 shadow-md cursor-pointer">
                            {{ processing ? '...' : 'OK' }}
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
