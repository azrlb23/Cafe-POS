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
        
        <!-- Modal Content (Sticky Header/Footer & Flex-1 Scrollable Body) -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <!-- Sticky Header -->
            <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <h2 class="text-xl font-serif font-black text-amber-600 uppercase tracking-widest">Pembayaran</h2>
                <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 p-2 transition-colors relative z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Scrollable Body Content -->
            <div class="p-8 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <!-- Total Display -->
                <div class="text-center">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-1">Total yang harus dibayar</span>
                    <span class="text-4xl font-black text-slate-900">Rp {{ total.toLocaleString('id-ID') }}</span>
                </div>

                <!-- Payment Method Toggle -->
                <div class="flex gap-3">
                    <button 
                        v-for="method in [
                            { id: 'cash', label: 'Tunai' },
                            { id: 'qris', label: 'QRIS' },
                            { id: 'transfer', label: 'Transfer' }
                        ]" 
                        :key="method.id"
                        @click="paymentMethod = method.id"
                        :class="paymentMethod === method.id ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
                        class="flex-1 py-3.5 rounded-2xl border font-black uppercase text-xs tracking-widest transition-all relative z-20"
                    >
                        {{ method.label }}
                    </button>
                </div>
 
                <!-- Cash Entry (Only if method is cash) -->
                <div v-if="paymentMethod === 'cash'" class="space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Uang Diterima</label>
                            <input 
                                v-model.number="amountReceived" 
                                type="number" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 text-center text-2xl font-black text-slate-900 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 outline-none transition-all shadow-inner relative z-20"
                                autofocus
                            >
                        </div>
                        <div class="flex flex-col justify-center text-center">
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kembalian</label>
                            <span :class="change > 0 ? 'text-green-600' : 'text-slate-300'" class="text-2xl font-black transition-colors">
                                Rp {{ change.toLocaleString('id-ID') }}
                            </span>
                        </div>
                    </div>
 
                    <!-- Quick Cash Buttons -->
                    <div class="flex flex-wrap justify-center gap-2">
                        <button 
                            v-for="amt in suggestAmounts" 
                            :key="amt"
                            @click="setAmount(amt)"
                            class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-all active:scale-95 relative z-20"
                        >
                            Rp {{ amt.toLocaleString('id-ID') }}
                        </button>
                    </div>
                </div>
 
                <!-- QRIS Manual Payment -->
                <div v-else-if="paymentMethod === 'qris'" class="space-y-4 animate-in zoom-in-95 duration-300">
                    <div class="py-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
                        <div class="w-28 h-28 bg-white border border-slate-200 p-2.5 rounded-2xl mb-3 shadow-sm flex items-center justify-center">
                            <!-- Visual static placeholder for merchant QRIS -->
                            <div class="w-full h-full bg-slate-100/80 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="3" height="3" /><rect x="7" y="18" width="3" height="3" /></svg>
                                <span class="text-[8px] font-black text-amber-700 uppercase tracking-widest mt-1.5">QRIS DENJAVAS</span>
                            </div>
                        </div>
                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center">Tunjukkan QRIS meja kasir ke pelanggan</p>
                    </div>
 
                    <!-- MANDATORY VERIFICATION WARNING CARD -->
                    <div class="bg-amber-50/60 border border-amber-200/60 rounded-3xl p-4 flex gap-3.5 items-start shadow-sm">
                        <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                            <h4 class="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-0.5">Verifikasi Mandiri Wajib</h4>
                            <p class="text-[9px] text-amber-800 font-semibold leading-relaxed">
                                Kasir bertanggung jawab penuh memverifikasi keberhasilan transfer dan mencocokkan nominal <strong class="text-amber-950 font-black text-[10px]">Rp {{ total.toLocaleString('id-ID') }}</strong> di ponsel pelanggan secara mandiri sebelum menekan tombol penyelesaian.
                            </p>
                        </div>
                    </div>
                </div>
 
                <!-- Bank Transfer Manual Payment -->
                <div v-else-if="paymentMethod === 'transfer'" class="space-y-4 animate-in zoom-in-95 duration-300">
                    <div class="py-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                        <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        </div>
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nomor Rekening Denjavas</p>
                        <h4 class="text-base font-serif font-black text-slate-800 mt-0.5">Bank BCA — 872-0988-121</h4>
                        <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">a.n. Denjavas Cafe Utama</p>
                    </div>
 
                    <!-- MANDATORY VERIFICATION WARNING CARD -->
                    <div class="bg-amber-50/60 border border-amber-200/60 rounded-3xl p-4 flex gap-3.5 items-start shadow-sm">
                        <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                            <h4 class="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-0.5">Verifikasi Mandiri Wajib</h4>
                            <p class="text-[9px] text-amber-800 font-semibold leading-relaxed">
                                Kasir bertanggung jawab penuh memverifikasi keberhasilan transfer dan mencocokkan nominal <strong class="text-amber-950 font-black text-[10px]">Rp {{ total.toLocaleString('id-ID') }}</strong> di ponsel pelanggan secara mandiri sebelum menekan tombol penyelesaian.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sticky Footer -->
            <div class="p-6 bg-slate-50 border-t border-slate-200 flex gap-4 shrink-0">
                <button 
                    @click="emit('close')"
                    class="flex-1 py-4 rounded-3xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-100 relative z-20"
                >
                    Kembali
                </button>
                <button 
                    @click="submit"
                    :disabled="!isAmountValid || processing"
                    class="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-3xl font-black uppercase tracking-[0.3em] shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-amber-500 relative z-20"
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

.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
