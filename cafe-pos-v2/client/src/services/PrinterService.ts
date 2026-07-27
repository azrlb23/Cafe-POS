/**
 * ESC/POS Thermal Printer & Cash Drawer Web API Service
 * Supports WebUSB and WebBluetooth for 0-click direct thermal printing
 * & automatic 12V RJ11 cash drawer kick.
 */

export interface PrinterDevice {
    type: 'usb' | 'bluetooth';
    name: string;
    device: any; // USBDevice or BluetoothDevice
    endpointNumber?: number;
    characteristic?: any;
}

class DirectPrinterService {
    private connectedDevice: PrinterDevice | null = null;
    private paperWidth: 58 | 80 = 58; // 58mm default

    constructor() {
        this.loadSavedDevice();
    }

    /**
     * Check if WebUSB is supported in current browser
     */
    public isUsbSupported(): boolean {
        return typeof navigator !== 'undefined' && 'usb' in navigator;
    }

    /**
     * Check if WebBluetooth is supported in current browser
     */
    public isBluetoothSupported(): boolean {
        return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    }

    /**
     * Get current connected printer device info
     */
    public getConnectedDevice(): PrinterDevice | null {
        return this.connectedDevice;
    }

    /**
     * Connect via WebUSB (Plug and Play USB Cable)
     */
    public async connectUsb(): Promise<PrinterDevice> {
        if (!this.isUsbSupported()) {
            throw new Error('Browser ini tidak mendukung WebUSB API. Gunakan Google Chrome atau Edge terbaru.');
        }

        try {
            const device = await (navigator as any).usb.requestDevice({ filters: [] });
            await device.open();

            // Select configuration #1 if not selected
            if (device.configuration === null) {
                await device.selectConfiguration(1);
            }

            // Find interface with OUT endpoint for bulk data transfer
            let interfaceNumber = 0;
            let endpointNumber = 1;

            const interfaces = device.configuration?.interfaces || [];
            for (const iface of interfaces) {
                for (const alt of iface.alternates) {
                    const outEndpoint = alt.endpoints.find((ep: any) => ep.direction === 'out');
                    if (outEndpoint) {
                        interfaceNumber = iface.interfaceNumber;
                        endpointNumber = outEndpoint.endpointNumber;
                        break;
                    }
                }
            }

            await device.claimInterface(interfaceNumber);

            const printerInfo: PrinterDevice = {
                type: 'usb',
                name: device.productName || 'Thermal Printer USB (SANPIDIE)',
                device,
                endpointNumber,
            };

            this.connectedDevice = printerInfo;
            this.saveDeviceConfig('usb', printerInfo.name);

            return printerInfo;
        } catch (err: any) {
            console.error('USB printer connection error:', err);
            throw new Error(err.message || 'Gagal menghubungkan printer USB.');
        }
    }

    /**
     * Connect via WebBluetooth (Wireless Bluetooth)
     */
    public async connectBluetooth(): Promise<PrinterDevice> {
        if (!this.isBluetoothSupported()) {
            throw new Error('Browser ini tidak mendukung WebBluetooth API. Gunakan Google Chrome pada PC/Android.');
        }

        try {
            const device = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART
                    '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / Custom Serial
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                ],
            });

            const server = await device.gatt.connect();

            // Find printable characteristic
            const services = await server.getPrimaryServices();
            let targetCharacteristic: any = null;

            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        targetCharacteristic = char;
                        break;
                    }
                }
                if (targetCharacteristic) break;
            }

            if (!targetCharacteristic) {
                throw new Error('Layanan penulisan cetak tidak ditemukan pada perangkat Bluetooth ini.');
            }

            const printerInfo: PrinterDevice = {
                type: 'bluetooth',
                name: device.name || 'Thermal Printer Bluetooth',
                device,
                characteristic: targetCharacteristic,
            };

            this.connectedDevice = printerInfo;
            this.saveDeviceConfig('bluetooth', printerInfo.name);

            return printerInfo;
        } catch (err: any) {
            console.error('Bluetooth printer connection error:', err);
            throw new Error(err.message || 'Gagal menghubungkan printer Bluetooth.');
        }
    }

    /**
     * Disconnect current printer
     */
    public async disconnect(): Promise<void> {
        if (this.connectedDevice) {
            try {
                if (this.connectedDevice.type === 'usb' && this.connectedDevice.device?.opened) {
                    await this.connectedDevice.device.close();
                } else if (this.connectedDevice.type === 'bluetooth' && this.connectedDevice.device?.gatt?.connected) {
                    await this.connectedDevice.device.gatt.disconnect();
                }
            } catch (e) {
                console.warn('Disconnect error ignored:', e);
            }
        }
        this.connectedDevice = null;
        localStorage.removeItem('cafe_pos_saved_printer');
    }

    /**
     * Open 12V RJ11 Cash Drawer (Laci Kasir Otomatis)
     */
    public async openCashDrawer(): Promise<boolean> {
        if (!this.connectedDevice) return false;

        // ESC p m t1 t2 (Pulse to cash drawer pin 2 or pin 5)
        const drawerCommand = new Uint8Array([
            0x1B, 0x70, 0x00, 0x19, 0xFA, // Pin 2 kick
            0x1B, 0x70, 0x01, 0x19, 0xFA  // Pin 5 kick fallback
        ]);

        return await this.sendRawData(drawerCommand);
    }

    /**
     * Print receipt directly to connected thermal printer
     */
    public async printOrder(order: any, type: 'customer' | 'cashier' | 'kitchen' = 'customer'): Promise<boolean> {
        if (!this.connectedDevice) {
            console.warn('No thermal printer connected. Cannot print direct ESC/POS.');
            return false;
        }

        const encoder = new ESCPOSBuilder(this.paperWidth);

        // Initialize & Clear
        encoder.init();

        // Header Title
        encoder.alignCenter();
        encoder.textDoubleSize('DENJAVAS CAFE\n');
        encoder.textBold('Jl. Utama Cafe No. 12\n');
        encoder.text('--------------------------------\n');

        // Struk Salinan Badge
        if (type !== 'customer') {
            encoder.textBold(`-- SALINAN ${type.toUpperCase()} --\n`);
        }

        // Order Meta
        encoder.alignLeft();
        encoder.text(`No. Order : #${order.orderNumber}\n`);
        encoder.text(`Tanggal   : ${new Date(order.createdAt || Date.now()).toLocaleString('id-ID')}\n`);
        encoder.text(`Tipe      : ${order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}`);
        if (order.cafeTable?.number) {
            encoder.text(` (Meja ${order.cafeTable.number})\n`);
        } else {
            encoder.text('\n');
        }
        encoder.text('--------------------------------\n');

        // Items List
        const items = order.orderItems || [];
        for (const item of items) {
            const menuName = item.menuName || item.menu?.name || 'Menu';
            const qty = item.quantity || 1;
            const price = Number(item.subtotal || item.unitPrice * qty);

            encoder.textBold(`${menuName}\n`);
            
            if (type !== 'kitchen') {
                const qtyText = `  ${qty}x @ Rp ${Number(item.unitPrice || 0).toLocaleString('id-ID')}`;
                const priceText = `Rp ${price.toLocaleString('id-ID')}`;
                encoder.textRow(qtyText, priceText);
            } else {
                encoder.text(`  x${qty}\n`);
            }

            // Print options/variants if present
            if (item.orderItemOptions && item.orderItemOptions.length > 0) {
                for (const opt of item.orderItemOptions) {
                    encoder.text(`    + ${opt.optionName}\n`);
                }
            }

            if (item.notes) {
                encoder.text(`    Catatan: ${item.notes}\n`);
            }
        }

        encoder.text('--------------------------------\n');

        // Totals (For Customer & Cashier only)
        if (type !== 'kitchen') {
            encoder.alignRight();
            encoder.text(`Subtotal : Rp ${Number(order.subtotal || order.total).toLocaleString('id-ID')}\n`);
            encoder.textDoubleHeight(`TOTAL : Rp ${Number(order.total).toLocaleString('id-ID')}\n`);
            encoder.text(`Bayar (${(order.paymentMethod || 'cash').toUpperCase()}) : Rp ${Number(order.paymentAmount || order.total).toLocaleString('id-ID')}\n`);
            if (Number(order.change) > 0) {
                encoder.text(`Kembalian : Rp ${Number(order.change).toLocaleString('id-ID')}\n`);
            }
            encoder.text('--------------------------------\n');
        }

        // Footer
        encoder.alignCenter();
        if (type === 'customer') {
            encoder.text('Terima Kasih Atas Kunjungan Anda!\n');
            encoder.text('WiFi: DenjavasCafe | Pass: kopiuenak\n');
        }
        encoder.text('\n\n\n'); // Feed paper

        // Cut paper
        encoder.cut();
        // Cash drawer kick temporarily disabled (no cash drawer connected yet)
        // if (order.paymentMethod === 'cash' || type === 'cashier') {
        //     encoder.kickDrawer();
        // }

        const buffer = encoder.build();
        return await this.sendRawData(buffer);
    }

    /**
     * Perform Test Print
     */
    public async testPrint(): Promise<boolean> {
        if (!this.connectedDevice) {
            throw new Error('Tidak ada printer terhubung.');
        }

        const encoder = new ESCPOSBuilder(this.paperWidth);
        encoder.init();
        encoder.alignCenter();
        encoder.textDoubleSize('TES PRINTER SANPIDIE\n');
        encoder.textBold('Cafe POS System Online!\n');
        encoder.text('--------------------------------\n');
        encoder.text('Status : Terhubung via ' + this.connectedDevice.type.toUpperCase() + '\n');
        encoder.text('Thermal Printer OK!\n');
        encoder.text('--------------------------------\n');
        encoder.text('\n\n');
        encoder.cut();
        // encoder.kickDrawer();

        return await this.sendRawData(encoder.build());
    }

    /**
     * Send raw Uint8Array buffer to connected device
     */
    private async sendRawData(buffer: Uint8Array): Promise<boolean> {
        if (!this.connectedDevice) return false;

        try {
            if (this.connectedDevice.type === 'usb') {
                const endpoint = this.connectedDevice.endpointNumber || 1;
                await this.connectedDevice.device.transferOut(endpoint, buffer);
                return true;
            } else if (this.connectedDevice.type === 'bluetooth') {
                const char = this.connectedDevice.characteristic;
                // Chunk data into 512 bytes max for Bluetooth MTU
                const chunkSize = 512;
                for (let i = 0; i < buffer.length; i += chunkSize) {
                    const chunk = buffer.slice(i, i + chunkSize);
                    if (char.writeValueWithoutResponse) {
                        await char.writeValueWithoutResponse(chunk);
                    } else {
                        await char.writeValue(chunk);
                    }
                }
                return true;
            }
        } catch (err) {
            console.error('Error sending raw data to printer:', err);
            return false;
        }

        return false;
    }

    private saveDeviceConfig(type: 'usb' | 'bluetooth', name: string) {
        localStorage.setItem('cafe_pos_saved_printer', JSON.stringify({ type, name }));
    }

    private loadSavedDevice() {
        const saved = localStorage.getItem('cafe_pos_saved_printer');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Keep info for display
                this.connectedDevice = {
                    type: parsed.type,
                    name: parsed.name,
                    device: null,
                };
            } catch (e) {}
        }
    }
}

/**
 * ESC/POS Command Byte Builder Class
 */
class ESCPOSBuilder {
    private buffer: number[] = [];
    private width: number;

    constructor(width: 58 | 80 = 58) {
        this.width = width;
    }

    public init(): this {
        this.buffer.push(0x1B, 0x40); // ESC @
        return this;
    }

    public alignCenter(): this {
        this.buffer.push(0x1B, 0x61, 0x01); // ESC a 1
        return this;
    }

    public alignLeft(): this {
        this.buffer.push(0x1B, 0x61, 0x00); // ESC a 0
        return this;
    }

    public alignRight(): this {
        this.buffer.push(0x1B, 0x61, 0x02); // ESC a 2
        return this;
    }

    public textBold(str: string): this {
        this.buffer.push(0x1B, 0x45, 0x01); // Bold ON
        this.addString(str);
        this.buffer.push(0x1B, 0x45, 0x00); // Bold OFF
        return this;
    }

    public textDoubleSize(str: string): this {
        this.buffer.push(0x1D, 0x21, 0x11); // Double width & height
        this.addString(str);
        this.buffer.push(0x1D, 0x21, 0x00); // Normal size
        return this;
    }

    public textDoubleHeight(str: string): this {
        this.buffer.push(0x1D, 0x21, 0x01); // Double height
        this.addString(str);
        this.buffer.push(0x1D, 0x21, 0x00); // Normal size
        return this;
    }

    public text(str: string): this {
        this.addString(str);
        return this;
    }

    public textRow(left: string, right: string): this {
        const maxLen = this.width === 58 ? 32 : 48;
        const spaces = Math.max(1, maxLen - left.length - right.length);
        const line = left + ' '.repeat(spaces) + right + '\n';
        this.addString(line);
        return this;
    }

    public kickDrawer(): this {
        // Kick cash drawer pin 2 & 5 (12V RJ11 solenoid)
        this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA);
        this.buffer.push(0x1B, 0x70, 0x01, 0x19, 0xFA);
        return this;
    }

    public cut(): this {
        this.buffer.push(0x1D, 0x56, 0x42, 0x00); // Full/Partial Cut
        return this;
    }

    public build(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    private addString(str: string) {
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            this.buffer.push(code < 128 ? code : 63); // Simple ASCII encoding
        }
    }
}

export const PrinterService = new DirectPrinterService();
