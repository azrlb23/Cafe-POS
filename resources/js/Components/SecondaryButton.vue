<script setup>
defineProps({
    type: {
        type: String,
        default: 'button',
    },
});
</script>

<template>
    <button
        :type="type"
        class="inline-flex items-center rounded-md border border-black/20 bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#57534E] shadow-sm transition duration-150 ease-in-out hover:bg-black/10 hover:text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-25"
    >
        <slot />
    </button>
</template>
