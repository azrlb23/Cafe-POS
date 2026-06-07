<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    to: {
        type: [String, Object],
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() =>
    props.active
        ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 bg-indigo-50 text-indigo-600 font-bold shadow-sm'
        : 'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-semibold'
);
</script>

<template>
    <router-link :to="to" :class="classes">
        <div class="flex-shrink-0">
            <slot name="icon" />
        </div>
        <span><slot /></span>
    </router-link>
</template>
