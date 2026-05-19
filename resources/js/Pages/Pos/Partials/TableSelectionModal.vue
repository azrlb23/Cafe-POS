<script setup>
defineProps({
    show: Boolean,
    tables: Array,
    selectedTableId: Number
});

const emit = defineEmits(['close', 'select']);

const select = (table) => {
    emit('select', table);
    emit('close');
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div class="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-serif font-black text-amber-700 uppercase tracking-widest">Pilih Meja</h2>
                    <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Silakan pilih meja untuk Dine-In</p>
                </div>
                <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 p-2 transition-colors relative z-20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <div class="p-6 max-h-[55vh] overflow-y-auto bg-slate-50/50">
                <div class="grid grid-cols-5 gap-2.5">
                    <button 
                        v-for="table in tables || []" 
                        :key="table.id"
                        @click="select(table)"
                        :class="[
                            selectedTableId === table.id ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10 scale-[1.02]' : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-500',
                            table.status === 'occupied' ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200' : ''
                        ]"
                        :disabled="table.status === 'occupied'"
                        class="aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 relative z-20"
                    >
                        <span class="text-[8px] font-black uppercase tracking-tighter mb-0.5 opacity-55 pointer-events-none">MEJA</span>
                        <span class="text-xl font-black pointer-events-none">{{ table.number }}</span>
                        <span v-if="table.status === 'occupied'" class="text-[7px] font-black text-red-500 absolute bottom-1.5 uppercase tracking-wider">Terisi</span>
                    </button>
                </div>
            </div>

            <div class="p-5 bg-white border-t border-slate-100 flex justify-end gap-3">
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
</template>
