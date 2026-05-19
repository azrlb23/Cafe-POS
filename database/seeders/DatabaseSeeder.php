<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuOptionGroup;
use App\Models\MenuOptionItem;
use App\Models\RawMaterial;
use App\Models\Recipe;
use App\Models\CafeTable;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ==========================================
        // 1. SETUP ROLES & USERS
        // ==========================================
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleCashier = Role::firstOrCreate(['name' => 'kasir']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@denjavas.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'pin' => '123456',
                'role' => 'admin',
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole($roleAdmin);
        }

        $cashier = User::firstOrCreate(
            ['email' => 'kasir@denjavas.com'],
            [
                'name' => 'Kasir 1',
                'password' => Hash::make('password'),
                'pin' => '654321',
                'role' => 'kasir',
            ]
        );
        if (!$cashier->hasRole('kasir')) {
            $cashier->assignRole($roleCashier);
        }

        // Kasir kedua (untuk rotasi 2 shift bergantian)
        $cashier2 = User::firstOrCreate(
            ['email' => 'kasir2@denjavas.com'],
            [
                'name' => 'Kasir 2',
                'password' => Hash::make('password'),
                'pin' => '111222',
                'role' => 'kasir',
            ]
        );
        if (!$cashier2->hasRole('kasir')) {
            $cashier2->assignRole($roleCashier);
        }

        $cashier3 = User::firstOrCreate(
            ['email' => 'kasir3@denjavas.com'],
            [
                'name' => 'Kasir 3',
                'password' => Hash::make('password'),
                'pin' => '333444',
                'role' => 'kasir',
            ]
        );
        if (!$cashier3->hasRole('kasir')) {
            $cashier3->assignRole($roleCashier);
        }

        $cashier4 = User::firstOrCreate(
            ['email' => 'kasir4@denjavas.com'],
            [
                'name' => 'Kasir 4',
                'password' => Hash::make('password'),
                'pin' => '555666',
                'role' => 'kasir',
            ]
        );
        if (!$cashier4->hasRole('kasir')) {
            $cashier4->assignRole($roleCashier);
        }


        // ==========================================
        // 2. SETUP CATEGORIES
        // ==========================================
        $coffeeCat = Category::firstOrCreate(['slug' => 'coffee'], ['name' => 'Coffee']);
        $nonCoffeeCat = Category::firstOrCreate(['slug' => 'non-coffee'], ['name' => 'Non-Coffee']);
        $snackCat = Category::firstOrCreate(['slug' => 'snack'], ['name' => 'Snack']);


        // ==========================================
        // 3. SETUP RAW MATERIALS
        // ==========================================
        $beans = RawMaterial::firstOrCreate(['name' => 'Espresso Roast Beans'], ['unit' => 'gram', 'current_stock' => 5000]);
        $milk = RawMaterial::firstOrCreate(['name' => 'Fresh Milk'], ['unit' => 'ml', 'current_stock' => 10000]);
        $palmSugar = RawMaterial::firstOrCreate(['name' => 'Palm Sugar Syrup'], ['unit' => 'ml', 'current_stock' => 2000]);
        $matcha = RawMaterial::firstOrCreate(['name' => 'Matcha Powder'], ['unit' => 'gram', 'current_stock' => 1000]);
        $paperCup = RawMaterial::firstOrCreate(['name' => 'Paper Cup 8oz'], ['unit' => 'pcs', 'current_stock' => 500]);
        $plasticCup = RawMaterial::firstOrCreate(['name' => 'Plastic Cup 16oz'], ['unit' => 'pcs', 'current_stock' => 500]);
        $iceCubes = RawMaterial::firstOrCreate(['name' => 'Ice Cubes'], ['unit' => 'gram', 'current_stock' => 20000]);
        $fries = RawMaterial::firstOrCreate(['name' => 'Frozen French Fries'], ['unit' => 'gram', 'current_stock' => 5000]);
        $oil = RawMaterial::firstOrCreate(['name' => 'Cooking Oil'], ['unit' => 'ml', 'current_stock' => 5000]);
        $paperBag = RawMaterial::firstOrCreate(['name' => 'Paper Bag Snack'], ['unit' => 'pcs', 'current_stock' => 500]);
        $boba = RawMaterial::firstOrCreate(['name' => 'Tapioca Pearl (Boba)'], ['unit' => 'gram', 'current_stock' => 2000]);


        // ==========================================
        // 4. SETUP MENU 1: KOPI SUSU AREN
        // ==========================================
        $kopiSusu = Menu::firstOrCreate(
            ['name' => 'Kopi Susu Aren'],
            [
                'category_id' => $coffeeCat->id,
                'description' => 'Es Kopi Susu Gula Aren khas Denjavas',
                'base_price' => 20000,
                'is_active' => true,
            ]
        );

        // Base Recipe Kopi Susu (tanpa cup & es, diatur di option)
        Recipe::firstOrCreate(['menu_id' => $kopiSusu->id, 'raw_material_id' => $beans->id], ['quantity' => 18]);
        Recipe::firstOrCreate(['menu_id' => $kopiSusu->id, 'raw_material_id' => $milk->id], ['quantity' => 150]);
        Recipe::firstOrCreate(['menu_id' => $kopiSusu->id, 'raw_material_id' => $palmSugar->id], ['quantity' => 20]);

        // Option: Suhu
        $suhuKopiGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $kopiSusu->id, 'name' => 'Suhu'], ['min_select' => 1, 'max_select' => 1]);
        
        $hotKopi = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $suhuKopiGroup->id, 'name' => 'Hot'], ['price_modifier' => 0]);
        Recipe::firstOrCreate(['menu_option_item_id' => $hotKopi->id, 'raw_material_id' => $paperCup->id], ['quantity' => 1]);
        
        $iceKopi = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $suhuKopiGroup->id, 'name' => 'Ice'], ['price_modifier' => 0]);
        Recipe::firstOrCreate(['menu_option_item_id' => $iceKopi->id, 'raw_material_id' => $plasticCup->id], ['quantity' => 1]);
        Recipe::firstOrCreate(['menu_option_item_id' => $iceKopi->id, 'raw_material_id' => $iceCubes->id], ['quantity' => 150]);

        // Option: Ukuran
        $ukuranKopiGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $kopiSusu->id, 'name' => 'Ukuran'], ['min_select' => 1, 'max_select' => 1]);
        
        $regKopi = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $ukuranKopiGroup->id, 'name' => 'Regular'], ['price_modifier' => 0]); // no extra recipe
        
        $largeKopi = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $ukuranKopiGroup->id, 'name' => 'Large'], ['price_modifier' => 5000]);
        Recipe::firstOrCreate(['menu_option_item_id' => $largeKopi->id, 'raw_material_id' => $milk->id], ['quantity' => 30]);
        Recipe::firstOrCreate(['menu_option_item_id' => $largeKopi->id, 'raw_material_id' => $palmSugar->id], ['quantity' => 10]);

        // Option: Level Gula (sesuai permintaan klien)
        $gulaKopiGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $kopiSusu->id, 'name' => 'Level Gula'], ['min_select' => 1, 'max_select' => 1]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaKopiGroup->id, 'name' => 'Normal'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaKopiGroup->id, 'name' => 'Less Sugar'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaKopiGroup->id, 'name' => 'No Sugar'], ['price_modifier' => 0]);


        // ==========================================
        // 5. SETUP MENU 2: MATCHA LATTE
        // ==========================================
        $matchaLatte = Menu::firstOrCreate(
            ['name' => 'Matcha Latte'],
            [
                'category_id' => $nonCoffeeCat->id,
                'description' => 'Premium Japanese Matcha with Fresh Milk',
                'base_price' => 25000,
                'is_active' => true,
            ]
        );

        // Base Recipe Matcha
        Recipe::firstOrCreate(['menu_id' => $matchaLatte->id, 'raw_material_id' => $matcha->id], ['quantity' => 20]);
        Recipe::firstOrCreate(['menu_id' => $matchaLatte->id, 'raw_material_id' => $milk->id], ['quantity' => 200]);

        // Option: Suhu
        $suhuMatchaGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $matchaLatte->id, 'name' => 'Suhu'], ['min_select' => 1, 'max_select' => 1]);
        
        $hotMatcha = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $suhuMatchaGroup->id, 'name' => 'Hot'], ['price_modifier' => 0]);
        Recipe::firstOrCreate(['menu_option_item_id' => $hotMatcha->id, 'raw_material_id' => $paperCup->id], ['quantity' => 1]);
        
        $iceMatcha = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $suhuMatchaGroup->id, 'name' => 'Ice'], ['price_modifier' => 0]);
        Recipe::firstOrCreate(['menu_option_item_id' => $iceMatcha->id, 'raw_material_id' => $plasticCup->id], ['quantity' => 1]);
        Recipe::firstOrCreate(['menu_option_item_id' => $iceMatcha->id, 'raw_material_id' => $iceCubes->id], ['quantity' => 150]);

        // Option: Topping
        $toppingGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $matchaLatte->id, 'name' => 'Topping'], ['min_select' => 0, 'max_select' => 2]);
        
        $bobaTopping = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $toppingGroup->id, 'name' => 'Boba'], ['price_modifier' => 3000]);
        Recipe::firstOrCreate(['menu_option_item_id' => $bobaTopping->id, 'raw_material_id' => $boba->id], ['quantity' => 30]);

        $espressoTopping = MenuOptionItem::firstOrCreate(['menu_option_group_id' => $toppingGroup->id, 'name' => 'Extra Shot Espresso'], ['price_modifier' => 5000]);
        Recipe::firstOrCreate(['menu_option_item_id' => $espressoTopping->id, 'raw_material_id' => $beans->id], ['quantity' => 18]);

        // Option: Level Gula (sesuai permintaan klien)
        $gulaMatchaGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $matchaLatte->id, 'name' => 'Level Gula'], ['min_select' => 1, 'max_select' => 1]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaMatchaGroup->id, 'name' => 'Normal'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaMatchaGroup->id, 'name' => 'Less Sugar'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $gulaMatchaGroup->id, 'name' => 'No Sugar'], ['price_modifier' => 0]);


        // ==========================================
        // 6. SETUP MENU 3: FRENCH FRIES
        // ==========================================
        $frenchFries = Menu::firstOrCreate(
            ['name' => 'French Fries'],
            [
                'category_id' => $snackCat->id,
                'description' => 'Kentang goreng renyah dengan pilihan saus',
                'base_price' => 20000,
                'is_active' => true,
            ]
        );

        // Base Recipe Fries
        Recipe::firstOrCreate(['menu_id' => $frenchFries->id, 'raw_material_id' => $fries->id], ['quantity' => 150]);
        Recipe::firstOrCreate(['menu_id' => $frenchFries->id, 'raw_material_id' => $oil->id], ['quantity' => 20]);
        Recipe::firstOrCreate(['menu_id' => $frenchFries->id, 'raw_material_id' => $paperBag->id], ['quantity' => 1]);

        // Option: Saus
        $sausGroup = MenuOptionGroup::firstOrCreate(['menu_id' => $frenchFries->id, 'name' => 'Pilihan Saus (Gratis)'], ['min_select' => 0, 'max_select' => 3]);
        
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $sausGroup->id, 'name' => 'Saus Sambal'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $sausGroup->id, 'name' => 'Saus Tomat'], ['price_modifier' => 0]);
        MenuOptionItem::firstOrCreate(['menu_option_group_id' => $sausGroup->id, 'name' => 'Mayonaise'], ['price_modifier' => 0]);


        // ==========================================
        // 7. SETUP CAFE TABLES (Meja 1–30)
        // ==========================================
        for ($i = 1; $i <= 30; $i++) {
            CafeTable::firstOrCreate(
                ['number' => $i],
                ['status' => 'available']
            );
        }


        // ==========================================
        // 8. SETUP DEFAULT STORE SETTINGS
        // ==========================================
        $defaults = [
            'store_name'      => 'Denjavas Retro Café',
            'store_phone'     => '-',
            'store_instagram' => '@denjavas.retrocafe',
            'store_address'   => 'Balikpapan, Kalimantan Timur',
            'receipt_header'  => 'Denjavas Retro Café',
            'receipt_footer'  => 'Terima kasih atas kunjungan Anda! Follow IG kami @denjavas.retrocafe',
            'logo_path'       => null,
        ];

        foreach ($defaults as $key => $value) {
            StoreSetting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}

