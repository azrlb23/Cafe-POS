-- DropForeignKey
ALTER TABLE "order_item_options" DROP CONSTRAINT "order_item_options_menu_option_item_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_menu_id_fkey";

-- AlterTable
ALTER TABLE "order_item_options" ALTER COLUMN "menu_option_item_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "menu_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_menu_option_item_id_fkey" FOREIGN KEY ("menu_option_item_id") REFERENCES "menu_option_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
