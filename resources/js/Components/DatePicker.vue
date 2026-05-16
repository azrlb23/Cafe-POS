<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: String, // format: YYYY-MM-DD
    label: String,
    placeholder: {
        type: String,
        default: 'Pilih Tanggal'
    }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const datePickerRef = ref(null);

// Current view state
const viewDate = ref(props.modelValue ? new Date(props.modelValue) : new Date());
const currentMonth = computed(() => viewDate.value.getMonth());
const currentYear = computed(() => viewDate.value.getFullYear());

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Calendar calculation logic
const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const calendarDays = computed(() => {
    const days = [];
    
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth.value; i++) {
        days.push({ day: null, currentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth.value; i++) {
        days.push({ 
            day: i, 
            currentMonth: true,
            dateString: `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        });
    }
    
    return days;
});

const selectDate = (dateString) => {
    emit('update:modelValue', dateString);
    isOpen.value = false;
};

const changeMonth = (offset) => {
    const newDate = new Date(viewDate.value);
    newDate.setMonth(newDate.getMonth() + offset);
    viewDate.value = newDate;
};

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Close on click outside
const handleClickOutside = (event) => {
    if (datePickerRef.value && !datePickerRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
};

const isSelected = (dateString) => {
    return props.modelValue === dateString;
};
</script>

<template>
    <div class="relative inline-block w-full" ref="datePickerRef">
        <!-- Input Display -->
        <div 
            @click="isOpen = !isOpen"
            class="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-amber-200 hover:bg-white transition-all group"
        >
            <div class="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-amber-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <span v-if="label" class="text-[9px] font-black uppercase text-amber-600/60 tracking-widest border-r border-slate-200 pr-2 mr-1">{{ label }}</span>
                <span class="text-xs font-bold text-slate-700 min-w-[100px]">
                    {{ modelValue ? formatDateDisplay(modelValue) : placeholder }}
                </span>
            </div>
        </div>

        <!-- Pop-up Calendar -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-4"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-4"
        >
            <div 
                v-if="isOpen" 
                class="absolute left-0 mt-4 w-80 bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.2)] border border-slate-100 p-8 z-[200] overflow-hidden"
            >
                <!-- Month/Year Header -->
                <div class="flex items-center justify-between mb-8">
                    <button @click="changeMonth(-1)" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-100 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div class="text-center">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ currentYear }}</p>
                        <h4 class="text-xl font-serif font-black text-slate-900 leading-tight italic">{{ monthNames[currentMonth] }}</h4>
                    </div>
                    <button @click="changeMonth(1)" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-100 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>

                <!-- Days of Week Header -->
                <div class="grid grid-cols-7 gap-1 mb-4">
                    <div v-for="day in dayNames" :key="day" class="text-center">
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">{{ day }}</span>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="grid grid-cols-7 gap-1">
                    <div v-for="(item, index) in calendarDays" :key="index" class="aspect-square flex items-center justify-center">
                        <button 
                            v-if="item.day"
                            @click="selectDate(item.dateString)"
                            :class="[
                                isSelected(item.dateString) 
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-black' 
                                    : (isToday(item.dateString) ? 'text-amber-600 bg-amber-50 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'),
                                'w-full h-full rounded-xl text-xs transition-all flex items-center justify-center relative group'
                            ]"
                        >
                            {{ item.day }}
                            <!-- Selection Dot for hover -->
                            <div v-if="!isSelected(item.dateString)" class="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber-600 scale-0 group-hover:scale-100 transition-transform"></div>
                        </button>
                    </div>
                </div>

                <!-- Quick Actions Footer -->
                <div class="mt-8 pt-6 border-t border-slate-50 flex justify-center">
                    <button 
                        @click="selectDate(new Date().toISOString().split('T')[0])"
                        class="text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                    >
                        Pilih Hari Ini
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.font-serif {
    font-family: 'Playfair Display', serif;
}
</style>
