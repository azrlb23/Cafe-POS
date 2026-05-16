/**
 * PrinterService untuk integrasi RawBT
 * Mendukung format ESC/POS sederhana untuk Printer Thermal 58mm
 */

const COMPANY_NAME = "DENJAVAS CAFE";
const COMPANY_ADDRESS = "Jl. Contoh No. 123, Balikpapan";
const COMPANY_PHONE = "0812-3456-7890";

const LINE = "--------------------------------\n"; 
const DOUBLE_LINE = "================================\n";

export const PrinterService = {
    
    // Fungsi untuk mengirim ke aplikasi RawBT
    sendToRawBT(text) {
        // Encode text to Base64 for RawBT protocol
        const base64Data = btoa(unescape(encodeURIComponent(text)));
        const url = "rawbt:base64," + base64Data;
        
        // Use an iframe or direct location change to trigger the protocol
        // In mobile browsers, window.location.href works best
        window.location.href = url;
    },

    formatCurrency(amount) {
        return Number(amount).toLocaleString('id-ID');
    },

    // 1. STRUK CUSTOMER (Lengkap dengan harga dan kembalian)
    printCustomer(order) {
        let t = "\x1b\x61\x01"; // Center align
        t += "\x1b\x45\x01"; // Bold ON
        t += COMPANY_NAME + "\n";
        t += "\x1b\x45\x00"; // Bold OFF
        t += COMPANY_ADDRESS + "\n";
        t += COMPANY_PHONE + "\n";
        t += LINE;
        
        t += "\x1b\x61\x00"; // Left align
        t += `No: ${order.order_number}\n`;
        t += `Tgl: ${new Date(order.created_at).toLocaleString('id-ID')}\n`;
        t += `Meja: ${order.cafe_table?.name || 'Takeaway'}\n`;
        t += `Kasir: ${order.user?.name || 'Admin'}\n`;
        t += LINE;

        order.order_items.forEach(item => {
            // Menu Name
            t += `${item.menu_name}\n`;
            
            // Qty x Price and Subtotal
            const qtyPrice = `${item.quantity} x ${this.formatCurrency(item.unit_price)}`;
            const subtotal = this.formatCurrency(item.subtotal);
            
            // Padding logic for 32 chars (58mm printer)
            const padding = 32 - qtyPrice.length - subtotal.length;
            t += qtyPrice + " ".repeat(Math.max(1, padding)) + subtotal + "\n";
            
            // Options
            if (item.order_item_options && item.order_item_options.length > 0) {
                item.order_item_options.forEach(opt => {
                    const optText = ` + ${opt.option_name}`;
                    const optPrice = `+${this.formatCurrency(opt.price_modifier)}`;
                    const optPadding = 32 - optText.length - optPrice.length;
                    t += optText + " ".repeat(Math.max(1, optPadding)) + optPrice + "\n";
                });
            }
        });

        t += LINE;
        t += "\x1b\x45\x01"; // Bold ON
        const totalLabel = "TOTAL";
        const totalVal = "Rp " + this.formatCurrency(order.total);
        t += totalLabel + " ".repeat(32 - totalLabel.length - totalVal.length) + totalVal + "\n";
        t += "\x1b\x45\x00"; // Bold OFF
        
        const payLabel = "BAYAR";
        const payVal = "Rp " + this.formatCurrency(order.payment_amount);
        t += payLabel + " ".repeat(32 - payLabel.length - payVal.length) + payVal + "\n";
        
        const changeLabel = "KEMBALI";
        const changeVal = "Rp " + this.formatCurrency(order.change);
        t += changeLabel + " ".repeat(32 - changeLabel.length - changeVal.length) + changeVal + "\n";
        
        t += LINE;
        t += "\x1b\x61\x01"; // Center
        t += "Terima Kasih!\n";
        t += "Selamat Menikmati\n\n\n\n\x1d\x56\x00"; // Cut paper (if supported)
        
        this.sendToRawBT(t);
    },

    // 2. STRUK KASIR (Untuk arsip internal)
    printCashier(order) {
        let t = "\x1b\x61\x01"; // Center align
        t += "\x1b\x45\x01"; // Bold ON
        t += COMPANY_NAME + "\n";
        t += "*** ARSIP KASIR ***\n";
        t += "\x1b\x45\x00"; // Bold OFF
        t += LINE;
        
        t += "\x1b\x61\x00"; // Left align
        t += `No: ${order.order_number}\n`;
        t += `Tgl: ${new Date(order.created_at).toLocaleString('id-ID')}\n`;
        t += `Kasir: ${order.user?.name || 'Admin'}\n`;
        t += `Meja: ${order.cafe_table?.name || 'Takeaway'}\n`;
        t += LINE;

        order.order_items.forEach(item => {
            t += `${item.menu_name}\n`;
            const qtyPrice = `${item.quantity} x ${this.formatCurrency(item.unit_price)}`;
            const subtotal = this.formatCurrency(item.subtotal);
            const padding = 32 - qtyPrice.length - subtotal.length;
            t += qtyPrice + " ".repeat(Math.max(1, padding)) + subtotal + "\n";
        });

        t += LINE;
        const totalLabel = "TOTAL";
        const totalVal = "Rp " + this.formatCurrency(order.total);
        t += totalLabel + " ".repeat(32 - totalLabel.length - totalVal.length) + totalVal + "\n";
        t += `Metode: ${order.payment_method.toUpperCase()}\n`;
        t += LINE;
        t += "\x1b\x61\x01";
        t += "SIMPAN SEBAGAI ARSIP\n\n\n\n\x1d\x56\x00";
        
        this.sendToRawBT(t);
    },

    // 3. STRUK DAPUR (Tanpa harga, hanya menu & catatan)
    printKitchen(order) {
        let t = "\x1b\x61\x01"; // Center
        t += "\x1b\x45\x01"; // Bold ON
        t += "*** STRUK DAPUR ***\n";
        t += `Meja: ${order.cafe_table?.name || 'Takeaway'}\n`;
        t += "\x1b\x45\x00"; // Bold OFF
        t += LINE;
        t += "\x1b\x61\x00"; // Left
        t += `No: ${order.order_number}\n`;
        t += `Tgl: ${new Date(order.created_at).toLocaleTimeString('id-ID')}\n`;
        t += `Tipe: ${order.order_type === 'dine_in' ? 'DINE-IN' : 'TAKEAWAY'}\n`;
        t += DOUBLE_LINE;

        order.order_items.forEach(item => {
            t += `\x1b\x21\x10`; // Double height ON
            t += `\x1b\x45\x01`; // Bold ON
            t += `${item.quantity} x ${item.menu_name}\n`;
            t += `\x1b\x45\x00`; // Bold OFF
            t += `\x1b\x21\x00`; // Double height OFF
            
            if (item.order_item_options && item.order_item_options.length > 0) {
                item.order_item_options.forEach(opt => {
                    t += `  [ ] ${opt.option_name}\n`;
                });
            }
            
            if (item.notes) {
                t += `  (!) ${item.notes}\n`;
            }
            t += LINE;
        });

        t += "\n\n\n\n\x1d\x56\x00";
        
        this.sendToRawBT(t);
    }
};
