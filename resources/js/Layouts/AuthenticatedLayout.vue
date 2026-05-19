<script setup>
import { ref } from 'vue';
import SidebarLink from '@/Components/SidebarLink.vue';
import { Link } from '@inertiajs/vue3';

const sidebarOpen = ref(false);
</script>

<template>
    <div class="min-h-screen bg-[#F8F9FD] text-[#292524] font-sans transition-colors duration-300">
        <div class="flex">
            <!-- SIDEBAR (Admin Only) -->
            <aside 
                v-if="$page.props.auth.user.role === 'admin'"
                class="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-100 z-50 flex flex-col transition-all duration-300 lg:translate-x-0 shadow-sm"
                :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
            >
                <!-- Logo -->
                <div class="h-20 flex items-center px-8 border-b border-slate-50">
                    <Link :href="route('dashboard')" class="text-2xl font-serif font-bold tracking-wider text-[#B45309]">
                        Denjavas <span class="text-slate-800 font-serif font-medium italic text-xl">Cafe</span>
                    </Link>
                </div>

                <!-- Navigation Menu -->
                <div class="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
                    <!-- Section: UTAMA -->
                    <div class="space-y-2">
                        <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Utama</p>
                        <SidebarLink :href="route('dashboard')" :active="route().current('dashboard')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                            </template>
                            Dashboard
                        </SidebarLink>
                    </div>

                    <!-- Section: PRODUK -->
                    <div class="space-y-2">
                        <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Produk & Layout</p>
                        <SidebarLink :href="route('admin.menus.index')" :active="route().current('admin.menus.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21V3"/><path d="M18 21V3"/><path d="M6 21V3"/><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></svg>
                            </template>
                            Katalog Menu
                        </SidebarLink>
                        <SidebarLink :href="route('admin.categories.index')" :active="route().current('admin.categories.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            </template>
                            Kategori Menu
                        </SidebarLink>
                        <SidebarLink :href="route('admin.tables.index')" :active="route().current('admin.tables.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
                            </template>
                            Layout Meja
                        </SidebarLink>
                    </div>

                    <!-- Section: INVENTORI -->
                    <div class="space-y-2">
                        <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventori</p>
                        <SidebarLink :href="route('admin.raw-materials.index')" :active="route().current('admin.raw-materials.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                            </template>
                            Bahan Baku
                        </SidebarLink>
                        <SidebarLink :href="route('admin.suppliers.index')" :active="route().current('admin.suppliers.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                            </template>
                            Supplier
                        </SidebarLink>
                        <SidebarLink :href="route('admin.purchase-orders.index')" :active="route().current('admin.purchase-orders.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </template>
                            Stok Masuk
                        </SidebarLink>
                    </div>

                    <!-- Section: KASIR -->
                    <div class="space-y-2">
                        <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Karyawan</p>
                        <SidebarLink :href="route('admin.cashiers.index')" :active="route().current('admin.cashiers.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </template>
                            Manajemen Kasir
                        </SidebarLink>
                    </div>

                    <!-- Section: LAPORAN -->
                    <div class="space-y-2">
                        <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Analitik</p>
                        <SidebarLink :href="route('admin.reports.index')" :active="route().current('admin.reports.*')">
                            <template #icon>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                            </template>
                            Laporan
                        </SidebarLink>
                    </div>
                </div>

                <!-- User Profile Card -->
                <div class="p-4 border-t border-slate-50">
                    <div class="bg-slate-50 rounded-2xl p-4 flex items-center justify-between group">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
                                {{ $page.props.auth.user.name.charAt(0) }}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[13px] font-bold text-slate-800 leading-tight truncate w-24">{{ $page.props.auth.user.name }}</span>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ $page.props.auth.user.role }}</span>
                            </div>
                        </div>
                        <Link :href="route('logout')" method="post" as="button" class="text-slate-400 hover:text-red-500 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </Link>
                    </div>
                </div>
            </aside>

            <!-- MOBILE OVERLAY -->
            <div 
                v-if="sidebarOpen" 
                @click="sidebarOpen = false"
                class="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300" 
            />

            <!-- MAIN WRAPPER -->
            <div 
                class="flex-1 flex flex-col min-w-0"
                :class="$page.props.auth.user.role === 'admin' ? 'lg:ml-[260px]' : ''"
            >
                <!-- TOP BAR -->
                <header class="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10">
                    <div class="flex items-center gap-4 flex-1">
                        <!-- Hamburger (Mobile Only) -->
                        <button 
                            v-if="$page.props.auth.user.role === 'admin'"
                            @click="sidebarOpen = !sidebarOpen"
                            class="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>

                        <!-- Page Header Slot -->
                        <div v-if="$slots.header" class="animate-fade-in flex-1 mr-6">
                            <slot name="header" />
                        </div>
                        
                        <!-- Premium Minimal Breadcrumbs -->
                        <div v-else class="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 select-none animate-fade-in">
                            <span class="hover:text-amber-700 transition-colors">Admin</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" class="text-slate-300 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                            <span v-if="route().current('dashboard')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Dashboard</span>
                            <span v-else-if="route().current('admin.menus.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Katalog Menu</span>
                            <span v-else-if="route().current('admin.categories.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Kategori Menu</span>
                            <span v-else-if="route().current('admin.tables.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Layout Meja</span>
                            <span v-else-if="route().current('admin.raw-materials.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Bahan Baku</span>
                            <span v-else-if="route().current('admin.suppliers.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Supplier</span>
                            <span v-else-if="route().current('admin.purchase-orders.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Stok Masuk</span>
                            <span v-else-if="route().current('admin.cashiers.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Manajemen Kasir</span>
                            <span v-else-if="route().current('admin.reports.*')" class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Laporan</span>
                            <span v-else class="text-slate-800 font-serif font-black normal-case text-sm italic tracking-normal">Portal</span>
                        </div>
                    </div>

                    <!-- Right Side Controls -->
                    <div v-if="$page.props.auth.user.role !== 'kasir'" class="flex items-center gap-4">
                        <!-- Logout (If Not Admin, Mobile Hamburger handles Admin logout) -->
                        <Link 
                            v-if="$page.props.auth.user.role !== 'admin'"
                            :href="route('logout')" 
                            method="post" 
                            as="button"
                            class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </Link>
                    </div>
                </header>

                <!-- PAGE CONTENT -->
                <main class="flex-1 overflow-x-hidden no-scrollbar">
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap');

.font-sans {
    font-family: 'Inter', sans-serif;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}


@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
</style>
