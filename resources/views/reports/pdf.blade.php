<!DOCTYPE html>
<html>
<head>
    <title>Laporan Operasional - {{ $type }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #B45309; }
        .header p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; text-align: left; text-transform: uppercase; font-size: 10px; }
        td { border: 1px solid #dee2e6; padding: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 50px; text-align: right; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Denjavas.</h1>
        <p>Laporan {{ ucfirst($type) }}</p>
        <p>Periode: {{ $startDate }} s/d {{ $endDate }}</p>
    </div>

    @if($type === 'sales')
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th class="text-center">Transaksi</th>
                    <th class="text-right">Omzet Bruto</th>
                    <th class="text-right">Petty Cash</th>
                    <th class="text-right">Laba Bersih</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $day)
                    <tr>
                        <td>{{ $day->date }}</td>
                        <td class="text-center">{{ $day->total_orders }}</td>
                        <td class="text-right">Rp {{ number_format($day->revenue) }}</td>
                        <td class="text-right">Rp {{ number_format($day->petty_cash) }}</td>
                        <td class="text-right">Rp {{ number_format($day->net_profit) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @elseif($type === 'menu_performance')
        <table>
            <thead>
                <tr>
                    <th>Menu</th>
                    <th>Kategori</th>
                    <th class="text-center">Terjual</th>
                    <th class="text-right">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $menu)
                    <tr>
                        <td>{{ $menu->name }}</td>
                        <td>{{ $menu->category_name }}</td>
                        <td class="text-center">{{ $menu->total_qty }}</td>
                        <td class="text-right">Rp {{ number_format($menu->total_revenue) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @elseif($type === 'expenses')
        <table>
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Kasir</th>
                    <th>Keterangan</th>
                    <th class="text-right">Nominal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $pc)
                    <tr>
                        <td>{{ $pc->created_at }}</td>
                        <td>{{ $pc->user->name ?? '-' }}</td>
                        <td>{{ $pc->notes }}</td>
                        <td class="text-right">Rp {{ number_format($pc->amount) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @elseif($type === 'shifts')
        <table>
            <thead>
                <tr>
                    <th>Kasir</th>
                    <th>Buka</th>
                    <th>Tutup</th>
                    <th class="text-right">Tunai</th>
                    <th class="text-right">Fisik</th>
                    <th class="text-center">Selisih</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $shift)
                    <tr>
                        <td>{{ $shift->user->name }}</td>
                        <td>{{ $shift->opened_at }}</td>
                        <td>{{ $shift->closed_at }}</td>
                        <td class="text-right">Rp {{ number_format($shift->total_cash_sales) }}</td>
                        <td class="text-right">Rp {{ number_format($shift->closing_cash) }}</td>
                        <td class="text-center">{{ number_format($shift->closing_cash - ($shift->opening_balance + $shift->total_cash_sales - $shift->petty_cash_sum)) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @elseif($type === 'voids')
        <table>
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>No. Order</th>
                    <th>Kasir</th>
                    <th>Alasan</th>
                    <th class="text-right">Nominal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $log)
                    <tr>
                        <td>{{ $log->created_at }}</td>
                        <td>{{ $log->order_number }}</td>
                        <td>{{ $log->user->name ?? '-' }}</td>
                        <td>{{ $log->void_reason }}</td>
                        <td class="text-right">Rp {{ number_format($log->total) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @elseif($type === 'transactions')
        <table>
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>No. Order</th>
                    <th>Meja</th>
                    <th>Kasir</th>
                    <th>Metode</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $order)
                    <tr>
                        <td>{{ $order->created_at }}</td>
                        <td>{{ $order->order_number }}</td>
                        <td>{{ $order->cafeTable->name ?? 'Takeaway' }}</td>
                        <td>{{ $order->user->name ?? '-' }}</td>
                        <td class="text-center">{{ strtoupper($order->payment_method) }}</td>
                        <td class="text-right">Rp {{ number_format($order->total) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        Dicetak pada: {{ now()->format('d M Y H:i') }}
    </div>
</body>
</html>
