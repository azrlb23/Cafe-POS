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
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div class="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-serif font-black text-amber-600 uppercase tracking-widest">Pilih Meja</h2>
                    <p class="text-slate-500 text-xs uppercase tracking-wider mt-1">Dine-in Only</p>
                </div>
                <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 p-2 transition-colors relative z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <div class="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/50">
                <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
                    <button 
                        v-for="table in tables || []" 
                        :key="table.id"
                        @click="select(table)"
                        :class="[
                            selectedTableId === table.id ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30' : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300',
                            table.status === 'occupied' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                        ]"
                        :disabled="table.status === 'occupied'"
                        class="aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-90 relative z-20"
                    >
                        <span class="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60 pointer-events-none">NO.</span>
                        <span class="text-3xl font-black pointer-events-none">{{ table.number }}</span>
                        <span v-if="table.status === 'occupied'" class="text-[8px] font-bold text-red-500 absolute bottom-2">TERISI</span>
                    </button>
                </div>
            </div>

            <div class="p-8 bg-white border-t border-slate-200 flex justify-center">
                <button 
                    @click="select({ id: null, number: null })"
                    class="bg-white hover:bg-amber-50 px-12 py-4 rounded-2xl text-amber-600 font-black uppercase tracking-[0.2em] transition-all active:scale-95 border-2 border-amber-200 hover:border-amber-400 relative z-20"
                >
                    Take Away
                </button>
            </div>
        </div>
    </div>
</template>
