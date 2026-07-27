<script setup lang="ts">
import { ref } from 'vue';
import api from '@/utils/api';
import { usePosStore } from '@/stores/pos';

const props = defineProps({
    show: Boolean,
    tables: Array,
    selectedTableId: Number
});

const emit = defineEmits(['close', 'select', 'refresh']);
const posStore = usePosStore();

const isManageMode = ref(false);
const loadingTableId = ref<number | null>(null);
const isResetting = ref(false);

const select = (table: any) => {
    if (isManageMode.value) {
        toggleTableStatus(table);
        return;
    }
    emit('select', table);
    emit('close');
};

const toggleTableStatus = async (table: any) => {
    const newStatus = table.status === 'occupied' ? 'available' : 'occupied';
    loadingTableId.value = table.id;
    try {
        await api.patch(`/pos/tables/${table.id}/status`, { status: newStatus });
        await posStore.fetchPosData(true);
        emit('refresh');
    } catch (err) {
        console.error('Failed to toggle table status', err);
    } finally {
        loadingTableId.value = null;
    }
};

const resetAllTables = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset semua meja menjadi Kosong (Available)?')) return;
    isResetting.value = true;
    try {
        await api.post('/pos/tables/reset-all');
        await posStore.fetchPosData(true);
        emit('refresh');
    } catch (err) {
        console.error('Failed to reset all tables', err);
    } finally {
        isResetting.value = false;
    }
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <!-- Header -->
            <div class="bg-white px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-serif font-black text-amber-700 uppercase tracking-widest">
                        {{ isManageMode ? 'Kelola Status Meja' : 'Pilih Meja' }}
                    </h2>
                    <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        {{ isManageMode ? 'Klik meja mana saja untuk mengubah status Terisi / Kosong' : 'Silakan pilih meja untuk pesanan Dine-In' }}
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Toggle Mode Button -->
                    <button 
                        @click="isManageMode = !isManageMode"
                        :class="[
                            'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5',
                            isManageMode 
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                        ]"
                    >
                        <span>{{ isManageMode ? 'Mode Pesan' : 'Atur Status Meja' }}</span>
                    </button>

                    <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 p-2 transition-colors relative z-20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <!-- Legend Info Bar -->
            <div class="bg-amber-50/60 px-6 py-2 border-b border-amber-100/60 flex items-center justify-between text-[10px] font-bold text-slate-600">
                <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Kosong
                    </span>
                    <span class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Terisi
                    </span>
                </div>
                <button 
                    v-if="isManageMode"
                    @click="resetAllTables"
                    :disabled="isResetting"
                    class="text-rose-600 hover:text-rose-700 font-black uppercase tracking-wider text-[9px] underline cursor-pointer"
                >
                    {{ isResetting ? 'Me-reset...' : 'Kosongkan Semua Meja' }}
                </button>
            </div>

            <!-- Tables Grid -->
            <div class="p-4 sm:p-6 max-h-[55vh] overflow-y-auto bg-slate-50/50">
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    <button 
                         v-for="table in tables || []" 
                         :key="table.id"
                         @click="select(table)"
                         :disabled="!isManageMode && table.status === 'occupied'"
                         :class="[
                             selectedTableId === table.id && !isManageMode ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10 scale-[1.02]' : '',
                             table.status === 'occupied' 
                                 ? (isManageMode ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800' : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed') 
                                 : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-500',
                             isManageMode ? 'ring-2 ring-transparent hover:ring-amber-400' : ''
                         ]"
                         class="aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 relative z-20"
                     >
                         <span class="text-[8px] font-black uppercase tracking-tighter mb-0.5 opacity-55 pointer-events-none">MEJA</span>
                         <span class="text-xl font-black pointer-events-none">{{ table.number }}</span>
                         
                         <!-- Status indicator -->
                         <span 
                            :class="[
                                'text-[7px] font-black absolute bottom-1.5 uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                                table.status === 'occupied' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
                            ]"
                         >
                             {{ table.status === 'occupied' ? 'Terisi' : 'Kosong' }}
                         </span>

                         <!-- Manage Mode Overlay Spinner -->
                         <div v-if="loadingTableId === table.id" class="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                             <div class="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                     </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 sm:p-5 bg-white border-t border-slate-100 flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400">
                    {{ isManageMode ? 'Klik meja untuk mengubah statusnya' : 'Dine-In / Takeaway' }}
                </span>
                <div class="flex items-center gap-3">
                    <button 
                        @click="emit('close')"
                        class="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all relative z-20"
                    >
                        Batal
                    </button>
                    <button 
                        @click="select({ id: null, number: null })"
                        class="bg-amber-600 hover:bg-amber-700 text-white px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-amber-600/10 relative z-20"
                    >
                        Bawa Pulang (Takeout)
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
