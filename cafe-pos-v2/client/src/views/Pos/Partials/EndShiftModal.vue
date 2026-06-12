<script setup lang="ts">
import { computed, ref } from 'vue';
import api from '@/utils/api';

const props = defineProps({
    show: Boolean,
    activeShift: Object,
});

const emit = defineEmits(['close', 'success']);

const form = ref({
    closing_cash: 0,
    notes: '',
});

const processing = ref(false);

const expectedCash = computed(() => {
    if (!props.activeShift) return 0;
    return parseFloat(props.activeShift.openingCash) + parseFloat(props.activeShift.totalCashSales) - parseFloat(props.activeShift.totalPettyCash || 0);
});

const discrepancy = computed(() => {
    return form.value.closing_cash - expectedCash.value;
});

const submit = async () => {
    const msg = discrepancy.value !== 0 
        ? `Terdapat selisih Rp ${Math.abs(discrepancy.value).toLocaleString('id-ID')} (${discrepancy.value > 0 ? 'Surplus' : 'Kurang'}). Yakin ingin menutup shift?`
        : 'Apakah Anda yakin ingin menutup shift sekarang?';
        
    if (confirm(msg)) {
        processing.value = true;
        try {
            await api.post('/pos/shifts/end', {
                closing_cash: form.value.closing_cash,
                notes: form.value.notes
            });
            form.value.closing_cash = 0;
            form.value.notes = '';
            emit('success');
        } catch (e) {
            console.error('Failed to end shift', e);
            alert(e.response?.data?.message || 'Gagal menutup shift');
        } finally {
            processing.value = false;
        }
    }
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
                    <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-200">
                        <svg class="text-red-600 w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-serif font-black text-red-600 uppercase tracking-widest">Tutup Shift</h2>
                    <p class="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">Ringkasan & Verifikasi Kas</p>
                </div>

                <div class="bg-slate-50 rounded-2xl p-4 mb-4 sm:mb-6 space-y-2.5 sm:space-y-3 border border-slate-100">
                    <div class="flex justify-between text-xs">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Saldo Awal</span>
                        <span class="font-bold text-slate-700 font-jakarta">Rp {{ Number(activeShift?.openingCash || 0).toLocaleString('id-ID') }}</span>
                    </div>

                    <!-- Hasil Penjualan Asli -->
                    <div class="border-t border-dashed border-slate-200 pt-2 space-y-1.5 sm:space-y-2">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Hasil Penjualan</span>
                        
                        <div class="flex justify-between text-xs">
                            <span class="text-slate-500 font-medium">Total Penjualan (Omset)</span>
                            <span class="font-bold text-slate-800 font-jakarta">Rp {{ Number(activeShift?.totalSales || 0).toLocaleString('id-ID') }}</span>
                        </div>
                        <div class="pl-2.5 space-y-1 border-l-2 border-slate-200">
                            <div class="flex justify-between text-[11px] sm:text-xs">
                                <span class="text-slate-400 font-medium">Tunai</span>
                                <span class="font-bold text-slate-600 font-jakarta">Rp {{ Number(activeShift?.totalCashSales || 0).toLocaleString('id-ID') }}</span>
                            </div>
                            <div class="flex justify-between text-[11px] sm:text-xs">
                                <span class="text-slate-400 font-medium">QRIS</span>
                                <span class="font-bold text-slate-600 font-jakarta">Rp {{ Number(activeShift?.paymentTotals?.qris || 0).toLocaleString('id-ID') }}</span>
                            </div>
                            <div class="flex justify-between text-[11px] sm:text-xs">
                                <span class="text-slate-400 font-medium">E-Wallet</span>
                                <span class="font-bold text-slate-600 font-jakarta">Rp {{ Number(activeShift?.paymentTotals?.ewallet || 0).toLocaleString('id-ID') }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between text-xs pt-2 border-t border-dashed border-slate-200">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Kas Keluar (-)</span>
                        <span class="font-bold text-red-600 font-jakarta">- Rp {{ Number(activeShift?.totalPettyCash || 0).toLocaleString('id-ID') }}</span>
                    </div>
                    <div class="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Kas Laci Seharusnya</span>
                        <span class="text-base sm:text-lg font-black text-amber-600 font-jakarta font-bold">Rp {{ expectedCash.toLocaleString('id-ID') }}</span>
                    </div>
                </div>

                <form @submit.prevent="submit" class="space-y-4 sm:space-y-6">
                    <div>
                        <label class="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 sm:mb-2 text-center">Input Kas Fisik (Di Laci)</label>
                        <input v-model.number="form.closing_cash" type="number" min="0" step="1000" class="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 sm:py-3.5 text-center text-lg sm:text-2xl font-black text-slate-900 focus:border-red-400 outline-none transition-all font-jakarta" required>
                        
                        <div v-if="form.closing_cash > 0" class="mt-2.5 text-center">
                            <span :class="discrepancy === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'" class="px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest font-jakarta">
                                Selisih: Rp {{ discrepancy.toLocaleString('id-ID') }} 
                                ({{ discrepancy === 0 ? 'Sesuai' : (discrepancy > 0 ? 'Surplus' : 'Kurang') }})
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 sm:mb-2">Alasan Selisih / Catatan</label>
                        <textarea v-model="form.notes" rows="1.5" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:border-red-400 outline-none" placeholder="Tuliskan alasan jika ada selisih uang..."></textarea>
                    </div>

                    <div class="flex gap-3 sm:gap-4">
                        <button type="button" @click="$emit('close')" class="flex-1 h-11 sm:h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                        <button type="submit" :disabled="processing" class="flex-1 h-11 sm:h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer">
                            {{ processing ? '...' : 'Tutup Shift' }}
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
