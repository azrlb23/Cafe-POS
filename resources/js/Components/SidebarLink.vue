<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    href: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() =>
    props.active
        ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
        : 'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 font-semibold'
);
</script>

<template>
    <Link :href="href" :class="classes">
        <div class="flex-shrink-0">
            <slot name="icon" />
        </div>
        <span><slot /></span>
    </Link>
</template>
