<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
    show: Boolean,
    menu: Object
});

const emit = defineEmits(['close', 'add']);

const selectedOptions = reactive({}); // { groupId: [itemIds] }

const initOptions = () => {
    if (!props.menu) return;
    const groups = props.menu.menuOptionGroups || props.menu.menu_option_groups || [];
    groups.forEach(group => {
        selectedOptions[group.id] = [];
    });
};

const toggleOption = (group, item) => {
    const current = [...(selectedOptions[group.id] || [])];
    const index = current.indexOf(item.id);

    if (index > -1) {
        current.splice(index, 1);
    } else {
        // Check max select
        if (group.max_select === 1) {
            selectedOptions[group.id] = [item.id];
            return; // Early return for single select to ensure reactivity
        } else if (current.length < group.max_select) {
            current.push(item.id);
        }
    }
    selectedOptions[group.id] = current;
};

const isSelected = (groupId, itemId) => {
    return (selectedOptions[groupId] || []).includes(itemId);
};

const isValid = computed(() => {
    if (!props.menu) return false;
    const groups = props.menu.menuOptionGroups || props.menu.menu_option_groups || [];
    return groups.every(group => {
        const count = (selectedOptions[group.id] || []).length;
        return count >= group.min_select && count <= group.max_select;
    });
});

const totalPrice = computed(() => {
    if (!props.menu) return 0;
    let extra = 0;
    const groups = props.menu.menuOptionGroups || props.menu.menu_option_groups || [];
    groups.forEach(group => {
        const items = group.menuOptionItems || group.menu_option_items || [];
        items.forEach(item => {
            if (isSelected(group.id, item.id)) {
                extra += parseFloat(item.price_modifier || 0);
            }
        });
    });
    return parseFloat(props.menu.base_price || 0) + extra;
});

const addToCart = () => {
    if (!isValid.value) return;
    
    // Flatten selected items
    const options = [];
    const groups = props.menu.menuOptionGroups || props.menu.menu_option_groups || [];
    groups.forEach(group => {
        const items = group.menuOptionItems || group.menu_option_items || [];
        items.forEach(item => {
            if (isSelected(group.id, item.id)) {
                options.push(item);
            }
        });
    });

    emit('add', {
        menu: props.menu,
        options: options,
        finalPrice: totalPrice.value
    });
    emit('close');
};

// Reset options when menu changes
import { watch } from 'vue';
watch(() => props.menu, () => {
    initOptions();
}, { immediate: true });

</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-0" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            
            <div class="p-8 border-b border-slate-200 shrink-0 bg-white">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-6">
                        <div class="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner">
                            <img v-if="menu?.image_path" :src="'/storage/' + menu.image_path" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h2 class="text-2xl font-serif font-black text-slate-900 leading-tight">{{ menu?.name }}</h2>
                            <p class="text-amber-600 font-bold text-lg mt-1">Rp {{ parseFloat(menu?.base_price).toLocaleString('id-ID') }}</p>
                        </div>
                    </div>
                    <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 p-2 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <div class="p-8 overflow-y-auto space-y-10 flex-1 bg-slate-50/50">
                <div v-for="group in (menu?.menuOptionGroups || menu?.menu_option_groups || [])" :key="group.id" class="space-y-4">
                    <div class="flex justify-between items-end">
                        <div>
                            <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ group.name }}</h3>
                            <p class="text-[10px] text-amber-600 font-bold mt-1">
                                {{ group.min_select === 1 && group.max_select === 1 ? 'Pilih salah satu' : `Minimal ${group.min_select}, Maksimal ${group.max_select}` }}
                            </p>
                        </div>
                        <div v-if="(selectedOptions[group.id] || []).length < group.min_select" class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black animate-pulse">WAJIB</div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button 
                            v-for="item in (group.menuOptionItems || group.menu_option_items || [])" 
                            :key="item.id"
                            @click="toggleOption(group, item)"
                            :class="isSelected(group.id, item.id) ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30' : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'"
                            class="p-4 rounded-2xl border text-sm font-bold transition-all active:scale-95 text-left flex flex-col justify-between relative z-20"
                        >
                            <span class="pointer-events-none">{{ item.name }}</span>
                            <span v-if="parseFloat(item.price_modifier) > 0" class="text-[10px] mt-2 pointer-events-none" :class="isSelected(group.id, item.id) ? 'text-amber-100' : 'text-amber-600'">
                                +{{ parseFloat(item.price_modifier).toLocaleString('id-ID') }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-8 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between">
                <div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total Item</span>
                    <span class="text-2xl font-black text-slate-900">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
                </div>
                
                <button 
                    @click="addToCart"
                    :disabled="!isValid"
                    class="bg-amber-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:hover:bg-amber-500 shadow-md shadow-amber-500/20 relative z-20"
                >
                    Tambah Pesanan
                </button>
            </div>
        </div>
    </div>
</template>
