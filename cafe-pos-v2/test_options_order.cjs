const http = require('http');

const loginPayload = JSON.stringify({ email: 'kasir@denjavas.com', password: 'password' });

const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginPayload.length
    }
}, (loginRes) => {
    let loginData = '';
    loginRes.on('data', chunk => loginData += chunk);
    loginRes.on('end', () => {
        const cookies = loginRes.headers['set-cookie'];
        const sidCookie = cookies.find(c => c.startsWith('sid=')).split(';')[0];
        
        console.log("Logged in");
        
        // Simulating the user's order with "Kopi Aren Spesial" + "Susu Oat"
        // Let's check what the payload structure actually is
        const orderPayload = JSON.stringify({
            shift_id: 4, // 4 is the open shift we found earlier
            order_type: "dine_in",
            cafe_table_id: 1, // table 1
            items: [{
                menu_id: 8, // Kopi Aren Spesial? We will see if it's 8
                quantity: 1,
                unit_price: 25000,
                options: [{ id: 1 }] // Mocking an option ID
            }],
            payment_method: "cash",
            payment_amount: 50000,
            notes: ""
        });
        
        const orderReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/pos/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': orderPayload.length,
                'Cookie': sidCookie
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => console.log('Order Response:', res.statusCode, data));
        });
        orderReq.write(orderPayload);
        orderReq.end();
    });
});

loginReq.write(loginPayload);
loginReq.end();
