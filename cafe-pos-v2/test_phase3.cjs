const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      options.headers = { ...options.headers, 'Content-Type': 'application/json', 'Content-Length': payload.length };
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('=== FASE 3 TESTING ===\n');

  // 1. Login
  const login = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST' }, { email: 'kasir@denjavas.com', password: 'password' });
  console.log('[1] Login:', login.status === 200 ? 'PASS ✓' : 'FAIL ✗', login.status);
  const cookie = login.headers['set-cookie']?.find(c => c.startsWith('sid='))?.split(';')[0];
  if (!cookie) { console.log('No cookie received, stopping.'); return; }

  const auth = { hostname: 'localhost', port: 5000, headers: { Cookie: cookie } };

  // 2. POS Data
  const posData = await request({ ...auth, path: '/api/pos/data', method: 'GET' });
  console.log('[2] POS Data:', posData.status === 200 ? 'PASS ✓' : 'FAIL ✗', posData.status);
  const pd = JSON.parse(posData.body);
  console.log('    Menus:', pd.menus?.length, '| Categories:', pd.categories?.length, '| Shift:', pd.activeShift?.id || 'none');

  // 3. History
  const history = await request({ ...auth, path: '/api/pos/history', method: 'GET' });
  console.log('[3] History:', history.status === 200 ? 'PASS ✓' : 'FAIL ✗', history.status);

  // 4. Active Orders
  const activeOrders = await request({ ...auth, path: '/api/pos/active-orders', method: 'GET' });
  console.log('[4] Active Orders:', activeOrders.status === 200 ? 'PASS ✓' : 'FAIL ✗', activeOrders.status);

  // 5. Create order (if shift is active and menus exist)
  if (pd.activeShift && pd.menus?.length > 0) {
    const menu = pd.menus[0];
    const order = await request({ ...auth, path: '/api/pos/orders', method: 'POST' }, {
      shift_id: pd.activeShift.id,
      order_type: 'takeaway',
      cafe_table_id: null,
      items: [{ menu_id: menu.id, quantity: 1, unit_price: menu.basePrice, options: [] }],
      payment_method: 'cash',
      payment_amount: 100000,
      notes: 'TS migration test'
    });
    console.log('[5] Create Order:', order.status === 200 ? 'PASS ✓' : 'FAIL ✗', order.status);
    if (order.status !== 200) console.log('    Error:', order.body.substring(0, 200));
  } else {
    console.log('[5] Create Order: SKIP (no active shift or menus)');
  }

  // 6. Auth /me
  const me = await request({ ...auth, path: '/api/auth/me', method: 'GET' });
  console.log('[6] Auth /me:', me.status === 200 ? 'PASS ✓' : 'FAIL ✗', me.status);

  console.log('\n=== TESTING COMPLETE ===');
}

test().catch(console.error);
