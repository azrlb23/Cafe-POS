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
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0 animate-in fade-in duration-300" @click="emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative z-10 bg-[#FCFAF7] border border-stone-200 rounded-[2.2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            
            <!-- Header -->
            <div class="p-8 border-b border-stone-150 shrink-0 bg-[#FCFAF7]">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-6">
                        <div class="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-inner">
                            <img v-if="menu?.image_path" :src="'/storage/' + menu.image_path" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h2 class="text-2xl font-serif font-black text-stone-850 leading-tight">{{ menu?.name }}</h2>
                            <p class="text-amber-700 font-jakarta font-bold text-lg mt-1">Rp {{ parseFloat(menu?.base_price).toLocaleString('id-ID') }}</p>
                        </div>
                    </div>
                    <button @click="emit('close')" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <!-- Options List Body -->
            <div class="p-8 overflow-y-auto space-y-10 flex-1 bg-stone-50/20">
                <div v-for="group in (menu?.menuOptionGroups || menu?.menu_option_groups || [])" :key="group.id" class="space-y-4">
                    <div class="flex justify-between items-end">
                        <div>
                            <h3 class="text-xs font-serif font-black text-[#B45309] uppercase tracking-widest">{{ group.name }}</h3>
                            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
                                {{ group.min_select === 1 && group.max_select === 1 ? 'Pilih salah satu' : `Minimal ${group.min_select}, Maksimal ${group.max_select}` }}
                            </p>
                        </div>
                        <div v-if="(selectedOptions[group.id] || []).length < group.min_select" class="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">WAJIB</div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button 
                            v-for="item in (group.menuOptionItems || group.menu_option_items || [])" 
                            :key="item.id"
                            @click="toggleOption(group, item)"
                            :class="isSelected(group.id, item.id) ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10 hover:bg-amber-700' : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-500'"
                            class="p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-left flex flex-col justify-between relative z-20"
                        >
                            <span class="pointer-events-none">{{ item.name }}</span>
                            <span v-if="parseFloat(item.price_modifier) > 0" class="text-[9px] mt-2 font-jakarta pointer-events-none" :class="isSelected(group.id, item.id) ? 'text-amber-100' : 'text-amber-700'">
                                +Rp {{ parseFloat(item.price_modifier).toLocaleString('id-ID') }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Total & Add to cart -->
            <div class="p-8 bg-[#FCFAF7] border-t border-stone-150 shrink-0 flex items-center justify-between">
                <div>
                    <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">Total Item</span>
                    <span class="text-2xl font-jakarta font-black text-stone-850">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
                </div>
                
                <button 
                    @click="addToCart"
                    :disabled="!isValid"
                    class="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed shadow-md shadow-amber-600/10 relative z-20"
                >
                    Tambah Pesanan
                </button>
            </div>
        </div>
    </div>
</template>
