<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk #{{ $order->order_number }}</title>
    <style>
        @page {
            margin: 0;
            size: 58mm 200mm; /* Standar Thermal 58mm */
        }
        body {
            font-family: 'Courier', monospace; /* Font mesin kasir */
            font-size: 10pt;
            line-height: 1.2;
            margin: 5mm;
            color: #000;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .header { margin-bottom: 5mm; }
        .divider { border-top: 1px dashed #000; margin: 2mm 0; }
        .item-row { margin-bottom: 2mm; }
        .item-name { display: block; margin-bottom: 1mm; }
        .item-details { display: flex; justify-content: space-between; font-size: 9pt; }
        .total-row { display: flex; justify-content: space-between; margin-top: 1mm; }
        .footer { margin-top: 5mm; font-size: 8pt; }
    </style>
</head>
<body>
    <div class="header text-center">
        @if($type === 'kitchen')
            <div class="bold" style="font-size: 14pt;">*** STRUK DAPUR ***</div>
        @else
            <div class="bold" style="font-size: 14pt;">DENJAVAS CAFE</div>
            @if($type === 'cashier')
                <div class="bold">*** ARSIP KASIR ***</div>
            @else
                <div>Jl. Contoh No. 123, Balikpapan</div>
                <div>0812-3456-7890</div>
            @endif
        @endif
    </div>

    <div class="divider"></div>

    <div>
        No: {{ $order->order_number }}<br>
        Tgl: {{ $order->created_at->format('d/m/Y H:i') }}<br>
        Meja: {{ $order->cafeTable->name ?? 'Takeaway' }}<br>
        @if($type !== 'kitchen')
            Kasir: {{ $order->user->name ?? 'Admin' }}
        @else
            Tipe: {{ $order->order_type === 'dine_in' ? 'DINE-IN' : 'TAKEAWAY' }}
        @endif
    </div>

    <div class="divider"></div>

    @foreach($order->orderItems as $item)
        <div class="item-row">
            @if($type === 'kitchen')
                <span class="item-name bold" style="font-size: 12pt;">{{ $item->quantity }} x {{ $item->menu_name }}</span>
                @if($item->orderItemOptions->count() > 0)
                    @foreach($item->orderItemOptions as $option)
                        <div style="font-size: 10pt; padding-left: 3mm;">
                            [ ] {{ $option->option_name }}
                        </div>
                    @endforeach
                @endif
                @if($item->notes)
                    <div style="font-size: 10pt; padding-left: 3mm; font-style: italic;">
                        (!) {{ $item->notes }}
                    </div>
                @endif
            @else
                <span class="item-name bold">{{ $item->menu_name }}</span>
                <table width="100%" style="font-size: 9pt;">
                    <tr>
                        <td>{{ $item->quantity }} x {{ number_format($item->unit_price) }}</td>
                        <td class="text-right">{{ number_format($item->subtotal) }}</td>
                    </tr>
                </table>
                
                @if($item->orderItemOptions->count() > 0)
                    @foreach($item->orderItemOptions as $option)
                        <div style="font-size: 8pt; padding-left: 3mm;">
                            + {{ $option->option_name }} (+{{ number_format($option->price_modifier) }})
                        </div>
                    @endforeach
                @endif
            @endif
        </div>
        @if($type === 'kitchen') <div class="divider"></div> @endif
    @endforeach

    @if($type !== 'kitchen')
        <div class="divider"></div>

        <table width="100%" class="bold">
            <tr>
                <td>TOTAL</td>
                <td class="text-right">Rp {{ number_format($order->total) }}</td>
            </tr>
        </table>
        
        @if($type === 'customer')
            <table width="100%" style="margin-top: 1mm;">
                <tr>
                    <td>Bayar</td>
                    <td class="text-right">{{ number_format($order->payment_amount) }}</td>
                </tr>
                <tr>
                    <td>Kembali</td>
                    <td class="text-right">{{ number_format($order->change) }}</td>
                </tr>
            </table>
        @else
            <div style="margin-top: 1mm;">
                Metode: {{ strtoupper($order->payment_method) }}
            </div>
        @endif

        <div class="divider"></div>

        <div class="footer text-center">
            @if($type === 'customer')
                TERIMA KASIH!<br>
                Selamat Menikmati Hidangan Kami
            @else
                SIMPAN SEBAGAI ARSIP
            @endif
        </div>
    @endif
</body>
</html>
