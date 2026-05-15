<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    href: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <Link
        :href="href"
        class="block w-full px-6 py-4 text-start text-xs font-black uppercase tracking-widest leading-5 text-slate-600 transition duration-150 ease-in-out hover:bg-slate-50 hover:text-amber-600 focus:outline-none focus:bg-slate-50"
    >
        <slot />
    </Link>
</template>
