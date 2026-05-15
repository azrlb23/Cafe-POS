<script setup>
import { ref, computed } from 'vue';
import { useForm, router } from '@inertiajs/vue3';
import CustomSelect from '@/Components/CustomSelect.vue';

const props = defineProps({
    menu: {
        type: Object,
        default: null
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

const isEdit = !!props.menu;

// Initialize form
const form = useForm({
    category_id: props.menu?.category_id || '',
    name: props.menu?.name || '',
    description: props.menu?.description || '',
    base_price: props.menu?.base_price || 0,
    is_active: props.menu?.is_active ?? true,
    image: null,
    
    // Deeply nested arrays
    recipes: props.menu?.recipes?.map(r => ({
        id: r.id,
        raw_material_id: r.raw_material_id,
        quantity: r.quantity
    })) || [],
    
    option_groups: props.menu?.menu_option_groups?.map(g => ({
        id: g.id,
        name: g.name,
        min_select: g.min_select,
        max_select: g.max_select,
        items: g.menu_option_items?.map(i => ({
            id: i.id,
            name: i.name,
            price_modifier: i.price_modifier,
            recipes: i.recipes?.map(ir => ({
                id: ir.id,
                raw_material_id: ir.raw_material_id,
                quantity: ir.quantity
            })) || []
        })) || []
    })) || []
});

const imagePreview = ref(props.menu?.image_path ? '/storage/' + props.menu.image_path : null);

const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        form.image = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};

const submitForm = () => {
    if (isEdit) {
        form.transform((data) => ({
            ...data,
            _method: 'put',
        })).post(route('admin.menus.update', props.menu.id), {
            preserveScroll: true
        });
    } else {
        form.post(route('admin.menus.store'), {
            preserveScroll: true
        });
    }
};

// Helper for nested validation errors
const getError = (path) => {
    return form.errors[path];
};

// Array Manipulations with Confirmations
const addBaseRecipe = () => {
    form.recipes.push({ raw_material_id: '', quantity: 0 });
};
const removeBaseRecipe = (index) => {
    form.recipes.splice(index, 1);
};

const addOptionGroup = () => {
    form.option_groups.push({ name: '', min_select: 0, max_select: 1, items: [] });
};
const removeOptionGroup = (index) => {
    if (confirm('Hapus grup pilihan ini beserta isinya?')) {
        form.option_groups.splice(index, 1);
    }
};

const addOptionItem = (groupIndex) => {
    form.option_groups[groupIndex].items.push({ name: '', price_modifier: 0, recipes: [] });
};
const removeOptionItem = (groupIndex, itemIndex) => {
    if (confirm('Hapus pilihan ini?')) {
        form.option_groups[groupIndex].items.splice(itemIndex, 1);
    }
};

const addOptionItemRecipe = (groupIndex, itemIndex) => {
    form.option_groups[groupIndex].items[itemIndex].recipes.push({ raw_material_id: '', quantity: 0 });
};
const removeOptionItemRecipe = (groupIndex, itemIndex, recipeIndex) => {
    form.option_groups[groupIndex].items[itemIndex].recipes.splice(recipeIndex, 1);
};

</script>

<template>
    <form @submit.prevent="submitForm" class="pb-32 font-sans text-slate-900 max-w-[1400px] mx-auto">
        
        <div class="space-y-20">
            <!-- SECTION 1: Informasi Dasar -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Informasi Dasar</h3>
                    <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Detail utama menu seperti nama, kategori, harga, dan foto yang akan tampil di aplikasi POS.</p>
                </div>
                
                <div class="xl:col-span-2 space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <!-- Kolom Foto -->
                        <div class="space-y-4">
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Foto Menu</label>
                            <div class="relative group aspect-square rounded-[2.5rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-amber-500 hover:bg-amber-50/10 shadow-sm">
                                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                <div v-else class="text-center p-8">
                                    <div class="bg-slate-50 p-6 rounded-3xl shadow-sm mb-4 mx-auto w-fit text-slate-300 group-hover:text-amber-400 transition-colors">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk Upload</p>
                                </div>
                                <input type="file" @change="handleImageChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                            </div>
                            
                            <div class="flex items-center gap-4 pt-2 ml-1">
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input v-model="form.is_active" type="checkbox" class="sr-only peer">
                                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    <span class="ms-3 text-sm font-bold text-slate-600">Tampilkan di POS</span>
                                </label>
                            </div>
                        </div>

                        <!-- Kolom Detail -->
                        <div class="space-y-10">
                            <div class="space-y-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Menu</label>
                                <input v-model="form.name" type="text" placeholder="Kopi Susu Gula Aren" class="w-full bg-white border border-slate-200 rounded-2xl text-slate-900 px-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-lg shadow-sm" required>
                                <p v-if="getError('name')" class="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-2">{{ getError('name') }}</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategori Menu</label>
                                <CustomSelect 
                                    v-model="form.category_id" 
                                    :options="categories"
                                    label-key="name"
                                    value-key="id"
                                    placeholder="Pilih Kategori..."
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Harga Dasar</label>
                                <div class="relative group">
                                    <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-amber-500 transition-colors">Rp</span>
                                    <input v-model.number="form.base_price" type="number" min="0" step="100" class="w-full bg-white border border-slate-200 rounded-2xl text-slate-900 pl-14 pr-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-black text-xl shadow-sm" required>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deskripsi & Catatan</label>
                                <textarea v-model="form.description" rows="4" placeholder="Detail resep atau catatan penyajian..." class="w-full bg-white border border-slate-200 rounded-2xl text-slate-900 px-6 py-4 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-sm leading-relaxed shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 2: Resep Dasar -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <div class="flex justify-between items-start xl:block">
                        <div>
                            <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Resep Dasar</h3>
                            <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Daftar bahan baku utama yang akan berkurang stoknya setiap kali menu ini terjual.</p>
                        </div>
                        <button type="button" @click="addBaseRecipe" class="mt-6 bg-slate-900 text-white hover:bg-amber-500 px-6 py-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> Tambah Bahan
                        </button>
                    </div>
                </div>
                
                <div class="xl:col-span-2">
                    <div v-if="form.recipes.length === 0" class="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p class="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Belum ada resep terdaftar</p>
                    </div>
                    
                    <div v-else class="space-y-4">
                        <div v-for="(recipe, index) in form.recipes" :key="'br-'+index" class="group flex items-center gap-6 bg-white p-2 pl-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                            <div class="flex-1">
                                <CustomSelect 
                                    v-model="recipe.raw_material_id" 
                                    :options="raw_materials"
                                    label-key="name"
                                    value-key="id"
                                    placeholder="Pilih Bahan..."
                                />
                            </div>
                            <div class="w-48 relative">
                                <input v-model.number="recipe.quantity" type="number" step="0.01" min="0" class="w-full bg-slate-50 border-none rounded-2xl text-slate-900 text-base py-4 px-6 focus:ring-2 focus:ring-amber-500 font-black" required>
                                <span class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    {{ raw_materials.find(r => r.id === recipe.raw_material_id)?.unit || 'Unit' }}
                                </span>
                            </div>
                            <button type="button" @click="removeBaseRecipe(index)" class="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- SECTION 3: Varian -->
            <section class="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-20">
                <div class="xl:col-span-1">
                    <div class="flex justify-between items-start xl:block">
                        <div>
                            <h3 class="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Varian & Opsi</h3>
                            <p class="text-sm text-slate-500 leading-relaxed max-w-sm">Tambahkan pilihan ukuran, topping, atau level yang dapat dipilih oleh pelanggan.</p>
                        </div>
                        <button type="button" @click="addOptionGroup" class="mt-6 bg-amber-500 text-white hover:bg-amber-600 px-8 py-3 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> Buat Grup Varian
                        </button>
                    </div>
                </div>

                <div class="xl:col-span-2">
                    <div v-if="form.option_groups.length === 0" class="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p class="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Menu ini tidak memiliki varian</p>
                    </div>

                    <div class="space-y-16">
                        <div v-for="(group, gIndex) in form.option_groups" :key="'g-'+gIndex" class="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div class="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                                <!-- Group Header -->
                                <div class="bg-slate-50 px-10 py-8 border-b border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div class="flex-1 w-full space-y-2">
                                        <label class="block text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Nama Grup</label>
                                        <input v-model="group.name" type="text" placeholder="Ukuran / Topping / Sugar" class="w-full bg-white border-slate-200 rounded-2xl px-6 py-4 font-black text-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 shadow-sm" required>
                                    </div>
                                    <div class="flex gap-4 w-full md:w-auto">
                                        <div class="flex-1 md:w-32 space-y-2">
                                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Pilih</label>
                                            <input v-model.number="group.min_select" type="number" min="0" class="w-full bg-white border-slate-200 rounded-xl px-4 py-3 font-bold text-center" required>
                                        </div>
                                        <div class="flex-1 md:w-32 space-y-2">
                                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max. Pilih</label>
                                            <input v-model.number="group.max_select" type="number" min="1" class="w-full bg-white border-slate-200 rounded-xl px-4 py-3 font-bold text-center" required>
                                        </div>
                                        <button type="button" @click="removeOptionGroup(gIndex)" class="self-end mb-1 w-12 h-12 flex items-center justify-center bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Items List -->
                                <div class="p-10 space-y-8">
                                    <div class="flex justify-between items-center px-2">
                                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Daftar Pilihan</h4>
                                        <button type="button" @click="addOptionItem(gIndex)" class="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> Tambah Opsi
                                        </button>
                                    </div>

                                    <div class="space-y-4">
                                        <div v-for="(item, iIndex) in group.items" :key="'i-'+gIndex+'-'+iIndex" class="group/item bg-slate-50/50 rounded-3xl p-6 border border-slate-100 transition-all hover:bg-white hover:border-amber-200 hover:shadow-lg">
                                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                <div class="grid grid-cols-2 gap-4 items-end">
                                                    <div class="space-y-2">
                                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Opsi</label>
                                                        <input v-model="item.name" type="text" class="w-full bg-white border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-amber-500" required>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga +</label>
                                                        <div class="relative">
                                                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">Rp</span>
                                                            <input v-model.number="item.price_modifier" type="number" class="w-full bg-white border-slate-200 rounded-xl pl-9 pr-4 py-3 font-black text-slate-900 focus:ring-amber-500" required>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="bg-white border border-slate-200 rounded-2xl p-5 relative">
                                                    <div class="flex justify-between items-center mb-4">
                                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resep Tambahan</span>
                                                        <button type="button" @click="addOptionItemRecipe(gIndex, iIndex)" class="text-[9px] font-black text-amber-600">+ Bahan</button>
                                                    </div>
                                                    
                                                    <div class="space-y-2">
                                                        <div v-for="(iRecipe, irIndex) in item.recipes" :key="'ir-'+gIndex+'-'+iIndex+'-'+irIndex" class="flex items-center gap-2">
                                                            <div class="flex-1">
                                                                <CustomSelect v-model="iRecipe.raw_material_id" :options="raw_materials" label-key="name" value-key="id" placeholder="Bahan..." />
                                                            </div>
                                                            <input v-model.number="iRecipe.quantity" type="number" step="0.01" class="w-16 bg-slate-50 border-none rounded-lg py-1.5 px-2 text-[10px] font-black text-center" required>
                                                            <button type="button" @click="removeOptionItemRecipe(gIndex, iIndex, irIndex)" class="text-slate-300 hover:text-red-500">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button type="button" @click="removeOptionItem(gIndex, iIndex)" class="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white border border-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full shadow-md opacity-0 group-hover/item:opacity-100 transition-all">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-slate-900 border border-amber-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2rem] p-5 flex justify-between items-center z-[100] backdrop-blur-xl bg-opacity-95">
            <div class="hidden md:flex items-center gap-5 pl-5">
                <div class="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <span class="text-amber-500 font-serif text-xl font-bold tracking-wide">{{ isEdit ? 'Update Menu' : 'Simpan Menu Baru' }}</span>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{{ isEdit ? 'Perubahan akan langsung aktif di POS' : 'Menu akan langsung masuk ke katalog' }}</p>
                </div>
            </div>
            
            <div class="flex gap-4 w-full md:w-auto">
                <a :href="route('admin.menus.index')" class="flex-1 md:flex-none text-center px-10 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] border border-slate-800">Batal</a>
                <button type="submit" :disabled="form.processing" class="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-14 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-amber-500/20 text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95">
                    {{ form.processing ? 'Memproses...' : 'Konfirmasi & Simpan' }}
                </button>
            </div>
        </div>

    </form>
</template>

<style scoped>
/* Transisi halus untuk elemen form */
.form-section-enter-active, .form-section-leave-active {
  transition: all 0.3s ease;
}
.form-section-enter-from, .form-section-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Hide spin buttons for numeric inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>

