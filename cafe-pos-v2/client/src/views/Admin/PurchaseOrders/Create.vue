<script setup lang="ts">
import PurchaseOrderForm from './Partials/PurchaseOrderForm.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';

const route = useRoute();
const suppliers = ref([]);
const rawMaterials = ref([]);
const autofill = ref(null);
const nextOrderNumber = ref('');
const isLoading = ref(true);

onMounted(async () => {
    try {
        const response = await api.get('/admin/raw-materials');
        rawMaterials.value = response.data.rawMaterials || [];
        suppliers.value = response.data.suppliers || [];
        
        // Generate a temporary PO number, backend will override if empty or keep it
        nextOrderNumber.value = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

        const supplierId = route.query.supplier_id;
        if (supplierId) {
            // Find items needing restock for this supplier
            const items = rawMaterials.value.filter(
                m => (m.defaultSupplierId || m.default_supplier_id) == supplierId && 
                (m.currentStock || m.current_stock) <= (m.minimumStock || m.minimum_stock)
            ).map(m => {
                const qty = (m.parLevel || m.par_level) - (m.currentStock || m.current_stock);
                return {
                    raw_material_id: m.id,
                    quantity: qty > 0 ? qty : 1,
                    unit_cost: m.costPerUnit || m.cost_per_unit
                };
            });
            
            if (items.length > 0) {
                autofill.value = {
                    supplier_id: supplierId,
                    items: items
                };
            } else {
                autofill.value = {
                    supplier_id: supplierId
                };
            }
        }
    } catch (error) {
        console.error("Failed to fetch data for create PO", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
            <div class="max-w-[1600px] mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
            <!-- Back Button and Title in Canvas -->
            <div class="flex items-center gap-6 mb-10">
                <router-link :to="{ name: 'AdminPurchaseOrders' }" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all group active:scale-90 cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </router-link>
                <div>
                    <h2 class="text-4xl font-serif font-black text-[#1C1917] tracking-tight leading-tight">
                        Catat <span class="text-amber-600 italic">Stok Masuk</span>
                    </h2>
                    <p class="text-slate-400 text-xs mt-2 font-medium">
                        Dokumentasi Penerimaan Barang dan Audit Harga Beli
                    </p>
                </div>
            </div>

            <div v-if="isLoading" class="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex justify-center items-center">
                <div class="w-8 h-8 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="delay-100">
                <PurchaseOrderForm 
                    :suppliers="suppliers" 
                    :raw-materials="rawMaterials" 
                    :autofill="autofill"
                    :next-order-number="nextOrderNumber"
                />
            </div>
        </div>
    </template>
