<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
    modelValue: [String, Number],
    options: {
        type: Array,
        required: true
    },
    placeholder: {
        type: String,
        default: 'Pilih...'
    },
    labelKey: {
        type: String,
        default: 'label'
    },
    valueKey: {
        type: String,
        default: 'value'
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedOption = computed(() => {
    return props.options.find(opt => opt[props.valueKey] === props.modelValue);
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
    emit('update:modelValue', option[props.valueKey]);
    emit('change', option[props.valueKey]);
    isOpen.value = false;
};

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="relative w-full" ref="dropdownRef">
        <!-- Trigger -->
        <div 
            @click="toggleDropdown"
            class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer transition-all hover:border-amber-700 focus:border-amber-700 shadow-sm group"
            :class="{ 'border-amber-700 ring-4 ring-amber-700/10': isOpen }"
        >
            <span class="text-sm font-bold" :class="selectedOption ? 'text-slate-900' : 'text-slate-400'">
                {{ selectedOption ? selectedOption[labelKey] : placeholder }}
            </span>
            <div class="text-slate-400 group-hover:text-amber-700 transition-colors">
                <svg 
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" 
                    class="transition-transform duration-300"
                    :class="{ 'rotate-180': isOpen }"
                >
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </div>
        </div>

        <!-- Options List -->
        <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
        >
            <div 
                v-show="isOpen"
                class="absolute z-[110] left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                <div class="max-h-[300px] overflow-y-auto py-2 no-scrollbar">
                    <div 
                        v-for="option in options" 
                        :key="option[valueKey]"
                        @click="selectOption(option)"
                        class="px-6 py-4 text-xs font-black uppercase tracking-widest cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-between group/item"
                        :class="modelValue === option[valueKey] ? 'text-amber-700 bg-amber-50/70' : 'text-slate-600'"
                    >
                        <span>{{ option[labelKey] }}</span>
                        <svg v-if="modelValue === option[valueKey]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-amber-700">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div v-if="options.length === 0" class="px-6 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Tidak ada pilihan
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
