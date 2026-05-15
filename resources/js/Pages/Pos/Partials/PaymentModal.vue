<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    show: Boolean,
    total: Number,
    processing: Boolean
});

const emit = defineEmits(['close', 'submit']);

const paymentMethod = ref('cash');
const amountReceived = ref(0);
const change = computed(() => Math.max(0, amountReceived.value - props.total));
const isAmountValid = computed(() => paymentMethod.value !== 'cash' || amountReceived.value >= props.total);

const quickAmounts = [20000, 50000, 100000];
const suggestAmounts = computed(() => {
    const suggestions = [props.total];
    quickAmounts.forEach(amt => {
        if (amt > props.total) suggestions.push(amt);
    });
    return [...new Set(suggestions)].sort((a, b) => a - b);
});

const setAmount = (amt) => {
    amountReceived.value = amt;
};

const submit = () => {
    if (!isAmountValid.value) return;
    emit('submit', {
        payment_method: paymentMethod.value,
        payment_amount: paymentMethod.value === 'cash' ? amountReceived.value : props.total
    });
};

// Reset when shown
watch(() => props.show, (val) => {
    if (val) {
        amountReceived.value = 0;
        paymentMethod.value = 'cash';
    }
});
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div class="p-8 border-b border-slate-200 flex justify-between items-center bg-white">
                <h2 class="text-2xl font-serif font-black text-amber-600 uppercase tracking-widest">Pembayaran</h2>
                <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 p-2 transition-colors relative z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <div class="p-10 space-y-10">
                <!-- Total Display -->
                <div class="text-center">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Total yang harus dibayar</span>
                    <span class="text-5xl font-black text-slate-900">Rp {{ total.toLocaleString('id-ID') }}</span>
                </div>

                <!-- Payment Method Toggle -->
                <div class="flex gap-3">
                    <button 
                        v-for="method in ['cash', 'qris', 'transfer']" 
                        :key="method"
                        @click="paymentMethod = method"
                        :class="paymentMethod === method ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
                        class="flex-1 py-4 rounded-2xl border font-black uppercase text-xs tracking-widest transition-all relative z-20"
                    >
                        {{ method }}
                    </button>
                </div>

                <!-- Cash Entry (Only if method is cash) -->
                <div v-if="paymentMethod === 'cash'" class="space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Uang Diterima</label>
                            <input 
                                v-model.number="amountReceived" 
                                type="number" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-3xl py-6 text-center text-3xl font-black text-slate-900 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 outline-none transition-all shadow-inner relative z-20"
                                autofocus
                            >
                        </div>
                        <div class="flex flex-col justify-center text-center">
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Kembalian</label>
                            <span :class="change > 0 ? 'text-green-600' : 'text-slate-300'" class="text-3xl font-black transition-colors">
                                Rp {{ change.toLocaleString('id-ID') }}
                            </span>
                        </div>
                    </div>

                    <!-- Quick Cash Buttons -->
                    <div class="flex flex-wrap justify-center gap-3">
                        <button 
                            v-for="amt in suggestAmounts" 
                            :key="amt"
                            @click="setAmount(amt)"
                            class="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-all active:scale-95 relative z-20"
                        >
                            Rp {{ amt.toLocaleString('id-ID') }}
                        </button>
                    </div>
                </div>

                <!-- QRIS Placeholder -->
                <div v-else class="py-10 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                    <div class="w-32 h-32 bg-white border border-slate-200 p-3 rounded-2xl mb-4 shadow-sm">
                        <div class="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-center font-black text-slate-400">QRIS CODE<br>GENERATE</div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Silakan Scan Kode QR di Atas</p>
                </div>
            </div>

            <!-- Submit Footer -->
            <div class="p-10 bg-slate-50 border-t border-slate-200 flex gap-4">
                <button 
                    @click="emit('close')"
                    class="flex-1 py-5 rounded-3xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-100 relative z-20"
                >
                    Kembali
                </button>
                <button 
                    @click="submit"
                    :disabled="!isAmountValid || processing"
                    class="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-amber-500 relative z-20"
                >
                    {{ processing ? 'Memproses...' : 'Selesaikan & Cetak' }}
                </button>
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
