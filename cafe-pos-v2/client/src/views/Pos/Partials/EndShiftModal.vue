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

const formatRp = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(val || 0);
};

const submit = async () => {
    const msg = discrepancy.value !== 0 
        ? `Terdapat selisih ${formatRp(Math.abs(discrepancy.value))} (${discrepancy.value > 0 ? 'Surplus' : 'Kurang'}). Yakin ingin menutup shift?`
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
        } catch (e: any) {
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
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Container -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <!-- Header -->
            <div class="px-6 pt-6 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
                <div class="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
                    </svg>
                </div>
                <h2 class="text-lg font-bold text-slate-800 tracking-tight">Tutup Shift Kasir</h2>
                <p class="text-slate-500 text-xs mt-0.5">Ringkasan transaksi & penghitungan laci kasir</p>
            </div>

            <div class="p-6">
                <!-- Shift Summary Card -->
                <div class="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200/80 space-y-2.5 text-xs">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-500 font-medium">Modal Awal</span>
                        <span class="font-bold text-slate-800">{{ formatRp(Number(activeShift?.openingCash || 0)) }}</span>
                    </div>

                    <div class="border-t border-slate-200/60 pt-2.5 space-y-1.5">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-700 font-semibold">Total Omset Penjualan</span>
                            <span class="font-bold text-slate-900">{{ formatRp(Number(activeShift?.totalSales || 0)) }}</span>
                        </div>
                        
                        <div class="pl-3 space-y-1 border-l-2 border-slate-200 text-[11px] text-slate-500">
                            <div class="flex justify-between">
                                <span>Penjualan Tunai</span>
                                <span class="font-semibold text-slate-700">{{ formatRp(Number(activeShift?.totalCashSales || 0)) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>QRIS</span>
                                <span class="font-semibold text-slate-700">{{ formatRp(Number(activeShift?.paymentTotals?.qris || 0)) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>E-Wallet</span>
                                <span class="font-semibold text-slate-700">{{ formatRp(Number(activeShift?.paymentTotals?.ewallet || 0)) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-2 border-t border-slate-200/60">
                        <span class="text-slate-500 font-medium">Kas Keluar (Petty Cash)</span>
                        <span class="font-bold text-rose-600">- {{ formatRp(Number(activeShift?.totalPettyCash || 0)) }}</span>
                    </div>

                    <div class="pt-2.5 border-t border-slate-300 flex justify-between items-center">
                        <span class="font-bold text-slate-800">Kas Laci Seharusnya</span>
                        <span class="text-sm font-black text-amber-700">{{ formatRp(expectedCash) }}</span>
                    </div>
                </div>

                <form @submit.prevent="submit" class="space-y-4">
                    <!-- Physical Cash Entry -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah Kas Fisik di Laci</label>
                        <div class="relative">
                            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rp</span>
                            <input 
                                v-model.number="form.closing_cash" 
                                type="number" 
                                min="0" 
                                step="1000" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 font-bold text-base focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all outline-none" 
                                placeholder="0"
                                required
                            >
                        </div>

                        <!-- Discrepancy Badge -->
                        <div v-if="form.closing_cash > 0" class="mt-2 text-right">
                            <span 
                                :class="discrepancy === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                                class="inline-block px-2.5 py-1 rounded-lg border text-[11px] font-semibold"
                            >
                                Selisih: {{ formatRp(discrepancy) }} ({{ discrepancy === 0 ? 'Pas' : (discrepancy > 0 ? 'Surplus' : 'Kurang') }})
                            </span>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Kasir (Opsional)</label>
                        <textarea 
                            v-model="form.notes" 
                            rows="2" 
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all outline-none" 
                            placeholder="Tuliskan catatan selisih atau laporan kasir jika ada..."
                        ></textarea>
                    </div>

                    <!-- Buttons -->
                    <div class="flex items-center gap-3 pt-2">
                        <button 
                            type="button" 
                            @click="$emit('close')" 
                            class="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            :disabled="processing" 
                            class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                            {{ processing ? 'Memproses...' : 'Tutup Shift Kasir' }}
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
