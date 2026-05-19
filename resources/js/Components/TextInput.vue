<script setup>
import { onMounted, ref } from 'vue';

const model = defineModel({
    type: String,
    required: true,
});

const input = ref(null);

onMounted(() => {
    if (input.value.hasAttribute('autofocus')) {
        input.value.focus();
    }
});

defineExpose({ focus: () => input.value.focus() });
</script>

<template>
    <input
        class="rounded-md bg-[#FAFAF9] border-[#E7E5E4] text-[#292524] shadow-sm focus:border-[#B45309] focus:ring-[#D4AF37]"
        v-model="model"
        ref="input"
    />
</template>
