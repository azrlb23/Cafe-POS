<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PrinterService, type PrinterDevice } from '@/services/PrinterService';

const props = defineProps({
    show: Boolean,
});

const emit = defineEmits(['close']);

const connectedDevice = ref<PrinterDevice | null>(null);
const isConnecting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const updateDeviceStatus = () => {
    connectedDevice.value = PrinterService.getConnectedDevice();
};

const handleConnectUsb = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        const dev = await PrinterService.connectUsb();
        connectedDevice.value = dev;
        successMessage.value = `Berhasil terhubung ke printer USB (${dev.name})`;
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal menghubungkan printer USB';
    } finally {
        isConnecting.value = false;
    }
};

const handleConnectBluetooth = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        const dev = await PrinterService.connectBluetooth();
        connectedDevice.value = dev;
        successMessage.value = `Berhasil terhubung ke printer Bluetooth (${dev.name})`;
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal menghubungkan printer Bluetooth';
    } finally {
        isConnecting.value = false;
    }
};

const handleDisconnect = async () => {
    await PrinterService.disconnect();
    connectedDevice.value = null;
    successMessage.value = 'Printer terputus';
};

const handleTestPrint = async () => {
    isConnecting.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        await PrinterService.testPrint();
        successMessage.value = 'Tes cetak & Buka Laci Kasir 12V berhasil!';
    } catch (err: any) {
        errorMessage.value = err.message || 'Gagal menjalankan tes cetak';
    } finally {
        isConnecting.value = false;
    }
};

const handleKickDrawer = async () => {
    try {
        await PrinterService.openCashDrawer();
        successMessage.value = 'Laci Kasir 12V Terbuka!';
    } catch (err: any) {
        errorMessage.value = 'Gagal membuka laci kasir';
    }
};

onMounted(() => {
    updateDeviceStatus();
});
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm z-0 animate-in fade-in duration-300" @click="emit('close')"></div>

        <!-- Modal Box -->
        <div class="relative z-10 bg-white border border-stone-200 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
            
            <!-- Header -->
            <div class="p-6 border-b border-stone-150 flex items-center justify-between bg-stone-50/50 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    </div>
                    <div>
                        <h2 class="text-base font-serif font-black text-stone-900 uppercase tracking-widest">Pengaturan Printer Thermal</h2>
                        <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Koneksi Direct ESC/POS 0-Klik</p>
                    </div>
                </div>
                <button @click="emit('close')" class="text-stone-400 p-2 hover:bg-stone-150 hover:text-stone-750 rounded-xl transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Body Content -->
            <div class="p-6 space-y-5 flex-1">
                
                <!-- Status Card -->
                <div :class="connectedDevice ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'" class="border rounded-2xl p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full animate-pulse" :class="connectedDevice ? 'bg-emerald-500' : 'bg-stone-400'"></div>
                        <div>
                            <p class="text-[9px] font-black uppercase tracking-widest opacity-60">Status Koneksi</p>
                            <h4 class="text-xs font-black mt-0.5">
                                {{ connectedDevice ? `Terhubung: ${connectedDevice.name}` : 'Belum Terhubung' }}
                            </h4>
                        </div>
                    </div>
                    <button 
                        v-if="connectedDevice" 
                        @click="handleDisconnect" 
                        class="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                        Putuskan
                    </button>
                </div>

                <!-- Error / Success Alert -->
                <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{{ errorMessage }}</span>
                </div>
                <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>{{ successMessage }}</span>
                </div>

                <!-- Option Buttons -->
                <div class="space-y-3">
                    <label class="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Pilih Metode Koneksi Printer (SANPIDIE)</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                            @click="handleConnectUsb" 
                            :disabled="isConnecting"
                            class="p-4 rounded-2xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-stone-700 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <span>Kabel USB</span>
                            <span class="text-[8px] font-normal text-stone-400">Direct Plug & Play</span>
                        </button>
                        <button 
                            @click="handleConnectBluetooth" 
                            :disabled="isConnecting"
                            class="p-4 rounded-2xl border border-stone-200 bg-white hover:bg-blue-50 hover:border-blue-400 text-stone-700 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>
                            <span>Bluetooth</span>
                            <span class="text-[8px] font-normal text-stone-400">Wireless Tablet/PC</span>
                        </button>
                    </div>
                </div>

                <!-- Test Actions (If Connected) -->
                <div v-if="connectedDevice" class="space-y-2 pt-2 border-t border-dashed border-stone-200">
                    <label class="block text-[9px] font-black text-stone-400 uppercase tracking-widest text-center">Pengujian Perangkat</label>
                    <div class="flex justify-center">
                        <button 
                            @click="handleTestPrint" 
                            :disabled="isConnecting"
                            class="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            📄 Tes Struk Kasir (SANPIDIE)
                        </button>
                        <!-- Laci Kasir sementara dinonaktifkan (belum ada perangkat laci kasir) -->
                        <!-- 
                        <button 
                            @click="handleKickDrawer" 
                            :disabled="isConnecting"
                            class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            💵 Tes Buka Laci 12V
                        </button> 
                        -->
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
                <button 
                    @click="emit('close')" 
                    class="px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-black text-xs uppercase tracking-wider hover:bg-stone-100 transition-all cursor-pointer"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
</template>
