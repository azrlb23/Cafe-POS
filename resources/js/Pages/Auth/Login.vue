<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import { Head, useForm, Link } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

defineProps({
    canResetPassword: {
        type: Boolean,
    },
    status: {
        type: String,
    },
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};

</script>

<template>
    <GuestLayout>
        <Head title="Masuk ke Denjavas" />

        <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
            {{ status }}
        </div>

        <div class="text-center mb-10">
            <h2 class="text-3xl font-serif font-black text-[#1C1917] mb-2 uppercase tracking-tighter italic">Selamat <span class="text-amber-600">Datang</span></h2>
            <p class="text-xs text-[#78716C] font-black uppercase tracking-[0.2em] opacity-60">Silakan masuk ke akun Anda</p>
        </div>

        <!-- Unified Login Form -->
        <form @submit.prevent="submit" class="flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
            <!-- Email Field -->
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div class="relative">
                    <input
                        id="email"
                        type="email"
                        v-model="form.email"
                        required
                        autofocus
                        autocomplete="username"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm shadow-sm"
                        placeholder="admin@denjavas.com atau kasir@denjavas.com"
                    />
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.email" />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
                <div class="flex justify-between items-center px-1">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                    <Link v-if="canResetPassword" :href="route('password.request')" class="text-[9px] text-amber-600 hover:text-amber-700 font-black uppercase tracking-widest transition-colors">
                        Lupa?
                    </Link>
                </div>
                <div class="relative flex items-center">
                    <input
                        id="password"
                        type="password"
                        v-model="form.password"
                        required
                        autocomplete="current-password"
                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[#1C1917] font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder-slate-300 text-sm pr-12 shadow-sm"
                        placeholder="••••••••"
                    />
                    <div class="absolute right-4 text-slate-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                </div>
                <InputError class="mt-1 ml-1" :message="form.errors.password" />
            </div>

            <!-- Remember Me -->
            <div class="flex items-center px-1">
                <label class="flex items-center cursor-pointer group">
                    <input type="checkbox" v-model="form.remember" class="hidden" />
                    <div :class="form.remember ? 'bg-amber-500 border-amber-500' : 'bg-slate-50 border-slate-200'" class="w-5 h-5 border rounded-lg transition-all flex items-center justify-center mr-3 group-active:scale-90">
                        <svg v-if="form.remember" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingat Saya</span>
                </label>
            </div>

            <!-- Submit Button -->
            <button
                type="submit"
                :class="{ 'opacity-50 cursor-not-allowed': form.processing }"
                :disabled="form.processing"
                class="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-[0.3em] shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
                Masuk Sekarang
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            
            <div class="text-center mt-4">
                <span class="text-xs text-[#78716C] font-medium tracking-tight">Butuh akses baru? </span>
                <Link :href="route('register')" class="text-xs text-amber-600 hover:text-amber-700 font-bold underline transition-colors decoration-2 underline-offset-4">Daftar Akun Staff</Link>
            </div>
        </form>

    </GuestLayout>
</template>
