<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '@/utils/api';

const props = defineProps({
    show: Boolean,
});

const emit = defineEmits(['close', 'success']);

// Step 1: Input Opening Cash, Step 2: Enter PIN
const currentStep = ref(1);

const form = ref({
    opening_cash: 100000,
    pin: '',
});

const formErrors = ref<Record<string, string>>({});
const processing = ref(false);

const formattedOpeningCash = computed(() => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(form.value.opening_cash || 0);
});

const setPresetCash = (amount: number) => {
    form.value.opening_cash = amount;
};

const addPresetCash = (amount: number) => {
    form.value.opening_cash = (form.value.opening_cash || 0) + amount;
};

const goToPinStep = () => {
    if (form.value.opening_cash < 0) return;
    currentStep.value = 2;
    formErrors.value = {};
};

const goToCashStep = () => {
    currentStep.value = 1;
    formErrors.value = {};
};

const submit = async () => {
    processing.value = true;
    formErrors.value = {};
    
    try {
        await api.post('/pos/shifts/start', {
            pin: form.value.pin,
            opening_cash: form.value.opening_cash
        });
        
        // Reset form
        form.value.pin = '';
        form.value.opening_cash = 100000;
        currentStep.value = 1;
        emit('success');
    } catch (e: any) {
        if (e.response && e.response.status === 422 && e.response.data.errors) {
            formErrors.value = e.response.data.errors;
        } else if (e.response && e.response.status === 400) {
            formErrors.value.pin = e.response.data.message;
        } else {
            formErrors.value.general = e.response?.data?.message || 'Gagal membuka shift. Periksa PIN Anda.';
        }
    } finally {
        processing.value = false;
    }
};

const appendPin = (num: string) => {
    if (form.value.pin.length < 6) {
        form.value.pin += num;
    }
};

const clearPin = () => {
    form.value.pin = '';
};

const backspacePin = () => {
    form.value.pin = form.value.pin.slice(0, -1);
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Container -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <!-- Step Indicators Header -->
            <div class="px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span 
                        :class="currentStep === 1 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'"
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    >
                        {{ currentStep === 1 ? '1' : '2' }}
                    </span>
                    <span class="text-xs font-bold text-slate-700">
                        {{ currentStep === 1 ? 'Langkah 1: Modal Awal' : 'Langkah 2: PIN Kasir' }}
                    </span>
                </div>

                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {{ currentStep }}/2
                </span>
            </div>

            <!-- STEP 1: MODAL INPUT SALDO AWAL LACI -->
            <div v-if="currentStep === 1" class="p-6">
                <div class="text-center mb-5">
                    <div class="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <path d="M6 12h.01M18 12h.01"/>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-slate-800">Saldo Modal Awal Laci</h3>
                    <p class="text-slate-500 text-xs mt-0.5">Masukkan jumlah uang tunai di laci sebelum transaksi</p>
                </div>

                <form @submit.prevent="goToPinStep" class="space-y-5">
                    <!-- Displayed Currency Amount -->
                    <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-center">
                        <span class="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-0.5">Total Modal Awal</span>
                        <span class="text-2xl font-black text-amber-900 tracking-tight">{{ formattedOpeningCash }}</span>
                    </div>

                    <!-- Custom Amount Input -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Input Nominal (Rp)</label>
                        <div class="relative">
                            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rp</span>
                            <input 
                                v-model.number="form.opening_cash" 
                                type="number" 
                                min="0" 
                                step="5000" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 font-bold text-base focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 transition-all outline-none" 
                                required
                            >
                        </div>

                        <!-- Quick Presets -->
                        <div class="grid grid-cols-4 gap-1.5 mt-2.5">
                            <button 
                                type="button" 
                                @click="setPresetCash(50000)"
                                :class="form.opening_cash === 50000 ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'"
                                class="py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer"
                            >
                                50rb
                            </button>
                            <button 
                                type="button" 
                                @click="setPresetCash(100000)"
                                :class="form.opening_cash === 100000 ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'"
                                class="py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer"
                            >
                                100rb
                            </button>
                            <button 
                                type="button" 
                                @click="setPresetCash(200000)"
                                :class="form.opening_cash === 200000 ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'"
                                class="py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer"
                            >
                                200rb
                            </button>
                            <button 
                                type="button" 
                                @click="addPresetCash(50000)"
                                class="py-1.5 rounded-xl border border-slate-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                            >
                                +50rb
                            </button>
                        </div>
                    </div>

                    <!-- Next Step Button -->
                    <button 
                        type="submit" 
                        class="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm tracking-wide transition-all active:scale-98 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>Lanjut ke Verifikasi PIN</span>
                        <span>→</span>
                    </button>
                </form>
            </div>

            <!-- STEP 2: MODAL VERIFIKASI PIN KASIR -->
            <div v-else-if="currentStep === 2" class="p-6">
                <!-- Summary of Selected Cash -->
                <div class="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 mb-4 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Modal Awal</span>
                        <span class="text-xs font-black text-amber-800">{{ formattedOpeningCash }}</span>
                    </div>
                    <button 
                        type="button" 
                        @click="goToCashStep"
                        class="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                    >
                        Ubah
                    </button>
                </div>

                <div class="text-center mb-4">
                    <div class="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-slate-800">Verifikasi PIN Kasir</h3>
                    <p class="text-slate-500 text-xs mt-0.5">Masukkan 6 digit PIN kasir Anda</p>
                </div>

                <form @submit.prevent="submit" class="space-y-4">
                    <!-- PIN Dots -->
                    <div>
                        <div class="flex justify-center gap-2.5 my-2">
                            <div 
                                v-for="i in 6" 
                                :key="i" 
                                :class="form.pin.length >= i ? 'bg-amber-600 border-amber-600' : 'bg-slate-100 border-slate-300'"
                                class="w-3.5 h-3.5 rounded-full border transition-all duration-150"
                            ></div>
                        </div>

                        <p v-if="formErrors.pin" class="text-rose-600 text-xs font-semibold text-center mt-1.5">{{ formErrors.pin }}</p>
                        <p v-if="formErrors.general" class="text-rose-600 text-xs font-semibold text-center mt-1.5">{{ formErrors.general }}</p>
                    </div>

                    <!-- Numpad -->
                    <div class="grid grid-cols-3 gap-1.5">
                        <button 
                            v-for="n in ['1','2','3','4','5','6','7','8','9']" 
                            :key="n" 
                            type="button" 
                            @click="appendPin(n)" 
                            class="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-base font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                            {{ n }}
                        </button>
                        
                        <button 
                            type="button" 
                            @click="clearPin" 
                            class="h-11 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                            Reset
                        </button>
                        
                        <button 
                            type="button" 
                            @click="appendPin('0')" 
                            class="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-base font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                            0
                        </button>
                        
                        <button 
                            type="button" 
                            @click="backspacePin" 
                            class="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                        </button>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 pt-1">
                        <button 
                            type="button" 
                            @click="goToCashStep" 
                            class="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                            ← Kembali
                        </button>
                        <button 
                            type="submit" 
                            :disabled="form.pin.length < 6 || processing" 
                            class="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {{ processing ? 'Memproses...' : 'Mulai Shift Kasir' }}
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
