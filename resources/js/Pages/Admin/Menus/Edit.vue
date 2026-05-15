<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import MenuForm from './Partials/MenuForm.vue';

defineProps({
    menu: {
        type: Object,
        required: true
    },
    categories: {
        type: Array,
        required: true
    },
    raw_materials: {
        type: Array,
        required: true
    }
});
</script>

<template>
    <Head :title="'Edit Menu - ' + menu.name" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center gap-4">
                <Link :href="route('admin.menus.index')" class="text-[#78716C] hover:text-[#292524] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <h2 class="text-xl font-serif font-bold text-[#292524] leading-tight flex items-center gap-2">
                    Edit Menu <span class="text-[#D97706]">/ {{ menu.name }}</span>
                </h2>
            </div>
        </template>

        <div class="py-12 px-4 sm:px-6 lg:px-8">
            <div class="">
                <MenuForm 
                    :menu="menu"
                    :categories="categories" 
                    :raw_materials="raw_materials" 
                />
            </div>
        </div>
    </AuthenticatedLayout>
</template>
