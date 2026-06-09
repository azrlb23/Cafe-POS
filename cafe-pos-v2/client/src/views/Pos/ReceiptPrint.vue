<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const orderId = route.params.id;
const printType = route.query.type || 'customer';

const order = ref<any>(null);
const settings = ref<Record<string, string>>({});
const loading = ref(true);
const error = ref('');

const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString('id-ID') + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
    try {
        const response = await api.get(`/pos/orders/${orderId}/print?type=${printType}`);
        order.value = response.data.order;
        settings.value = response.data.settings || {};
        
        // Wait a tick for Vue to render the DOM, then print
        setTimeout(() => {
            window.print();
        }, 500);
    } catch (err: any) {
        console.error('Failed to load receipt data', err);
        error.value = 'Gagal memuat data struk.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="loading" class="p-8 text-center text-sm font-mono text-gray-500">
        Memuat struk...
    </div>
    <div v-else-if="error" class="p-8 text-center text-sm font-mono text-red-500">
        {{ error }}
    </div>
    <div v-else-if="order" class="receipt-container">
        <!-- Header -->
        <div class="header">
            <h1 class="store-name">{{ settings.store_name || 'Denjavas Retro Café' }}</h1>
            <p class="store-address">{{ settings.store_address || 'Denjavas Jl. Penajam - Kuaro KM 16, Giri Mukti, Penajam, Kabupaten Penajam Paser Utara, Kalimantan Timur 76143' }}</p>
            <p v-if="settings.store_phone || settings.store_phone === undefined">Telp: {{ settings.store_phone || '+62 823-5343-8404' }}</p>
            <div class="divider"></div>
        </div>

        <!-- Receipt Info -->
        <div class="info">
            <div class="info-row">
                <span>No.</span>
                <span>{{ order.orderNumber }}</span>
            </div>
            <div class="info-row">
                <span>Tanggal</span>
                <span>{{ formatTime(order.createdAt) }}</span>
            </div>
            <div class="info-row">
                <span>Kasir</span>
                <span>{{ order.user?.name || 'Kasir' }}</span>
            </div>
            <div class="info-row">
                <span>Tipe</span>
                <span>{{ order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway' }} <span v-if="order.cafeTable">- Meja {{ order.cafeTable.number }}</span></span>
            </div>
            <div class="divider"></div>
        </div>

        <!-- Print Type Badge (Kitchen/Cashier only) -->
        <div v-if="printType !== 'customer'" class="print-type-badge">
            -- SALINAN {{ String(printType).toUpperCase() }} --
        </div>

        <!-- Items -->
        <div class="items">
            <div v-for="item in order.orderItems" :key="item.id" class="item-row">
                <div class="item-name">
                    {{ item.menuName }}
                    <span v-if="item.notes" class="item-note">* {{ item.notes }}</span>
                </div>
                <!-- Customer & Cashier see prices -->
                <div v-if="printType !== 'kitchen'" class="item-details">
                    <span>{{ item.quantity }} x {{ Number(item.unitPrice).toLocaleString('id-ID') }}</span>
                    <span>{{ Number(item.subtotal).toLocaleString('id-ID') }}</span>
                </div>
                <!-- Kitchen only sees quantity -->
                <div v-else class="item-details-kitchen">
                    <span class="kitchen-qty">x{{ item.quantity }}</span>
                </div>

                <!-- Options -->
                <div v-if="item.orderItemOptions && item.orderItemOptions.length > 0" class="options-list">
                    <div v-for="opt in item.orderItemOptions" :key="opt.id" class="option-row">
                        <span>- {{ opt.optionName }}</span>
                        <span v-if="printType !== 'kitchen' && Number(opt.priceModifier) > 0">
                            +{{ Number(opt.priceModifier).toLocaleString('id-ID') }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="divider"></div>
        </div>

        <!-- Totals (Hidden for Kitchen) -->
        <div v-if="printType !== 'kitchen'" class="totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>{{ Number(order.subtotal).toLocaleString('id-ID') }}</span>
            </div>
            <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>Rp {{ Number(order.total).toLocaleString('id-ID') }}</span>
            </div>
            <div class="total-row">
                <span>Tunai/Bayar</span>
                <span>{{ Number(order.paymentAmount).toLocaleString('id-ID') }}</span>
            </div>
            <div class="total-row">
                <span>Kembali</span>
                <span>{{ Number(order.change).toLocaleString('id-ID') }}</span>
            </div>
            <div class="divider"></div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p v-if="printType === 'customer'">Terima Kasih</p>
            <p v-if="printType === 'customer'">Silakan Berkunjung Kembali</p>
            <p v-else>=== BATAS STRUK ===</p>
        </div>
    </div>
</template>

<style scoped>
/* 
   Thermal Printer CSS Reset & Optimization 
   Targeting standard 58mm / 80mm thermal printers
*/
@page {
    margin: 0; /* Remove default browser margins for printing */
    size: auto;
}

body, html {
    margin: 0;
    padding: 0;
    background-color: white;
}

/* Base Container - Responsive to 58mm (approx 48mm printable area ~ 180px) or 80mm */
.receipt-container {
    width: 100%;
    max-width: 300px; /* Limits width on desktop view, expands on printer */
    margin: 0 auto;
    padding: 10px;
    font-family: 'Courier New', Courier, monospace; /* Monospace is best for receipts */
    font-size: 12px;
    color: #000;
    background: #fff;
    line-height: 1.2;
}

.header {
    text-align: center;
    margin-bottom: 10px;
}

.store-name {
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 5px 0;
    text-align: center;
}

.store-address, .header p {
    margin: 2px 0;
    text-align: center;
    font-size: 10px;
}

.divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
}

.print-type-badge {
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    margin: 10px 0;
}

.item-row {
    margin-bottom: 6px;
}

.item-name {
    font-weight: bold;
    display: flex;
    flex-direction: column;
}

.item-note {
    font-size: 10px;
    font-style: italic;
    font-weight: normal;
    padding-left: 8px;
}

.item-details {
    display: flex;
    justify-content: space-between;
    padding-left: 8px;
    margin-top: 2px;
}

.item-details-kitchen {
    padding-left: 8px;
    margin-top: 2px;
}

.kitchen-qty {
    font-size: 16px;
    font-weight: bold;
}

.options-list {
    padding-left: 12px;
    font-size: 11px;
    margin-top: 2px;
}

.option-row {
    display: flex;
    justify-content: space-between;
}

.totals {
    margin-top: 10px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
}

.grand-total {
    font-weight: bold;
    font-size: 14px;
    margin: 5px 0;
}

.footer {
    text-align: center;
    margin-top: 15px;
    font-size: 10px;
}

/* Ensure colors are forced to black & white when printing */
@media print {
    * {
        color: #000 !important;
        background: transparent !important;
        text-shadow: none !important;
        box-shadow: none !important;
    }
}
</style>
