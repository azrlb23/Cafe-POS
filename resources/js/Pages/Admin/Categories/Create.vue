<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';

const form = useForm({
    name: '',
});

const submit = () => {
    form.post(route('admin.categories.store'));
};
</script>

<template>
    <Head title="Tambah Kategori" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center gap-4">
                <Link :href="route('admin.categories.index')" class="text-[#78716C] hover:text-[#292524] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <h2 class="text-xl font-serif font-bold text-[#292524] leading-tight">
                    Tambah Kategori Menu
                </h2>
            </div>
        </template>

        <div class="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 lg:p-14">
                <form @submit.prevent="submit" class="space-y-8">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Nama Kategori</label>
                        <input
                            id="name"
                            type="text"
                            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-base font-bold shadow-sm"
                            v-model="form.name"
                            required
                            autofocus
                            placeholder="Misal: Minuman Panas, Snack, dll..."
                        />
                        <InputError class="mt-2" :message="form.errors.name" />
                    </div>

                    <div class="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                        <Link
                            :href="route('admin.categories.index')"
                            class="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            :class="{ 'opacity-25': form.processing }"
                            :disabled="form.processing"
                            class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-10 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-600/20 text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95"
                        >
                            Simpan Kategori
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
