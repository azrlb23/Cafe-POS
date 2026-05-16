<script setup>
import { ref } from 'vue';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import NavLink from '@/Components/NavLink.vue';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink.vue';
import { Link } from '@inertiajs/vue3';
import { useTheme } from '@/Composables/useTheme';

const { isDark, toggleTheme } = useTheme();
const showingNavigationDropdown = ref(false);
</script>

<template>
    <div>
        <div class="min-h-screen bg-[#FAFAF9] text-[#292524] font-sans">
            <nav class="border-b border-[#E7E5E4] bg-[#FFFFFF]">
                <!-- Primary Navigation Menu -->
                <div class="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <div class="flex h-16 justify-between">
                        <div class="flex">
                            <!-- Logo -->
                            <div class="flex shrink-0 items-center">
                                <Link :href="$page.props.auth.user.role === 'admin' ? route('dashboard') : route('pos')" class="text-[#D97706] font-serif font-bold text-xl tracking-widest">
                                    Denjavas.
                                </Link>
                            </div>

                            <!-- Navigation Links -->
                            <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('dashboard')"
                                    :active="route().current('dashboard')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.tables.index')"
                                    :active="route().current('admin.tables.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Layout Meja
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'kasir'"
                                    :href="route('pos')"
                                    :active="route().current('pos')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    POS Kasir
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.menus.index')"
                                    :active="route().current('admin.menus.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Katalog Menu
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.categories.index')"
                                    :active="route().current('admin.categories.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Kategori Menu
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.raw-materials.index')"
                                    :active="route().current('admin.raw-materials.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Stok Bahan Baku
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.suppliers.index')"
                                    :active="route().current('admin.suppliers.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Supplier
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.purchase-orders.index')"
                                    :active="route().current('admin.purchase-orders.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Stok Masuk
                                </NavLink>
                                <NavLink
                                    v-if="$page.props.auth.user.role === 'admin'"
                                    :href="route('admin.reports.index')"
                                    :active="route().current('admin.reports.*')"
                                    class="text-[#57534E] hover:text-[#D97706]"
                                >
                                    Laporan
                                </NavLink>
                            </div>
                        </div>

                        <div class="hidden sm:ms-6 sm:flex sm:items-center">
                            <!-- Kasir View Toggle -->
                            <div v-if="$page.props.auth.user.role === 'kasir'" class="flex items-center me-4">
                                <Link
                                    v-if="!route().current('pos.history')"
                                    :href="route('pos.history')"
                                    class="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-100 transition-all gap-2"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Riwayat
                                </Link>
                                <Link
                                    v-else
                                    :href="route('pos')"
                                    class="inline-flex items-center px-4 py-2 bg-slate-900 border border-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all gap-2"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
                                    Buka POS
                                </Link>
                            </div>

                            <!-- Theme Switcher -->
                            <button
                                @click="toggleTheme"
                                class="p-2 text-[#78716C] hover:text-[#D97706] focus:outline-none transition-colors rounded-md hover:bg-black/5"
                                title="Toggle Theme"
                            >
                                <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            </button>

                            <!-- Settings Dropdown -->
                            <div class="relative ms-3">
                                <Dropdown align="right" width="48">
                                    <template #trigger>
                                        <span class="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                class="inline-flex items-center rounded-md border border-transparent bg-transparent px-3 py-2 text-sm font-medium leading-4 text-[#57534E] transition duration-150 ease-in-out hover:text-[#D97706] focus:outline-none"
                                            >
                                                {{ $page.props.auth.user.name }}

                                                <svg
                                                    class="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </template>

                                    <template #content>
                                        <DropdownLink
                                            :href="route('profile.edit')"
                                        >
                                            Profile
                                        </DropdownLink>
                                        <DropdownLink
                                            :href="route('logout')"
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </DropdownLink>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>

                        <!-- Hamburger & Theme Mobile -->
                        <div class="-me-2 flex items-center sm:hidden gap-2">
                            <button
                                @click="toggleTheme"
                                class="p-2 text-[#78716C] transition duration-150 ease-in-out hover:bg-black/5 hover:text-[#57534E] focus:outline-none rounded-md"
                            >
                                <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            </button>

                            <button
                                @click="
                                    showingNavigationDropdown =
                                        !showingNavigationDropdown
                                "
                                class="inline-flex items-center justify-center rounded-md p-2 text-[#78716C] transition duration-150 ease-in-out hover:bg-black/5 hover:text-[#57534E] focus:bg-black/5 focus:text-[#57534E] focus:outline-none"
                            >
                                <svg
                                    class="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        :class="{
                                            hidden: showingNavigationDropdown,
                                            'inline-flex':
                                                !showingNavigationDropdown,
                                        }"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        :class="{
                                            hidden: !showingNavigationDropdown,
                                            'inline-flex':
                                                showingNavigationDropdown,
                                        }"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Responsive Navigation Menu -->
                <div
                    :class="{
                        block: showingNavigationDropdown,
                        hidden: !showingNavigationDropdown,
                    }"
                    class="sm:hidden bg-[#FFFFFF] border-t border-[#E7E5E4]"
                >
                    <div class="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('dashboard')"
                            :active="route().current('dashboard')"
                            class="text-[#57534E]"
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.tables.index')"
                            :active="route().current('admin.tables.*')"
                            class="text-[#57534E]"
                        >
                            Layout Meja
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'kasir'"
                            :href="route('pos')"
                            :active="route().current('pos')"
                            class="text-[#57534E]"
                        >
                            POS Kasir
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.menus.index')"
                            :active="route().current('admin.menus.*')"
                            class="text-[#57534E]"
                        >
                            Katalog Menu
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.categories.index')"
                            :active="route().current('admin.categories.*')"
                            class="text-[#57534E]"
                        >
                            Kategori Menu
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.raw-materials.index')"
                            :active="route().current('admin.raw-materials.*')"
                            class="text-[#57534E]"
                        >
                            Stok Bahan Baku
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.suppliers.index')"
                            :active="route().current('admin.suppliers.*')"
                            class="text-[#57534E]"
                        >
                            Supplier
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.purchase-orders.index')"
                            :active="route().current('admin.purchase-orders.*')"
                            class="text-[#57534E]"
                        >
                            Stok Masuk
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            v-if="$page.props.auth.user.role === 'admin'"
                            :href="route('admin.reports.index')"
                            :active="route().current('admin.reports.*')"
                            class="text-[#57534E]"
                        >
                            Laporan
                        </ResponsiveNavLink>
                    </div>

                    <!-- Responsive Settings Options -->
                    <div class="border-t border-[#E7E5E4] pb-1 pt-4">
                        <div class="px-4">
                            <div class="text-base font-medium text-[#292524]">
                                {{ $page.props.auth.user.name }}
                            </div>
                            <div class="text-sm font-medium text-[#78716C]">
                                {{ $page.props.auth.user.email }}
                            </div>
                        </div>

                        <div class="mt-3 space-y-1">
                            <ResponsiveNavLink :href="route('profile.edit')" class="text-[#57534E]">
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                :href="route('logout')"
                                method="post"
                                as="button"
                                class="text-[#57534E]"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Page Heading -->
            <header
                class="bg-[#FFFFFF] shadow border-b border-[#E7E5E4]"
                v-if="$slots.header"
            >
                <div class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                    <slot name="header" />
                </div>
            </header>

            <!-- Page Content -->
            <main>
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.font-sans {
    font-family: 'Inter', sans-serif;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}
</style>
