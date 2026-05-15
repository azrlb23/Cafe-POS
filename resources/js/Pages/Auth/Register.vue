<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const submit = () => {
    form.post(route('register'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Daftar Admin" />

        <div class="text-center mb-10">
            <h2 class="text-3xl font-serif font-black text-[#1C1917] mb-2 uppercase tracking-tighter italic">Buat <span class="text-amber-600">Akun</span></h2>
            <p class="text-xs text-[#78716C] font-black uppercase tracking-[0.2em] opacity-60">Daftar sebagai Administrator</p>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Name Field -->
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div class="relative">
                    <input
                        id="name"
                        type="text"
                        v-model="form.name"
                        required
                        autofocus
                        autocomplete="name"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm shadow-sm"
                        placeholder="Nama Lengkap"
                    />
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.name" />
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div class="relative">
                    <input
                        id="email"
                        type="email"
                        v-model="form.email"
                        required
                        autocomplete="username"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm shadow-sm"
                        placeholder="email@example.com"
                    />
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.email" />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div class="relative">
                    <input
                        id="password"
                        type="password"
                        v-model="form.password"
                        required
                        autocomplete="new-password"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm shadow-sm"
                        placeholder="••••••••"
                    />
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.password" />
            </div>

            <!-- Confirm Password Field -->
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div class="relative">
                    <input
                        id="password_confirmation"
                        type="password"
                        v-model="form.password_confirmation"
                        required
                        autocomplete="new-password"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm shadow-sm"
                        placeholder="••••••••"
                    />
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.password_confirmation" />
            </div>

            <!-- Submit Button -->
            <button
                type="submit"
                :class="{ 'opacity-50 cursor-not-allowed': form.processing }"
                :disabled="form.processing"
                class="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-[0.3em] shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
                Daftar Akun
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </button>
            
            <div class="text-center mt-4">
                <span class="text-xs text-[#78716C] font-medium tracking-tight">Sudah terdaftar? </span>
                <Link :href="route('login')" class="text-xs text-amber-600 hover:text-amber-700 font-bold underline transition-colors decoration-2 underline-offset-4">Masuk Admin</Link>
            </div>
        </form>
    </GuestLayout>
</template>
