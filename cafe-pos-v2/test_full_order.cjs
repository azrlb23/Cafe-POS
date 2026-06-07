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
        
        const orderPayload = JSON.stringify({
            shift_id: 3, // assuming shift 3 exists, else it will just return an error
            order_type: "takeaway",
            cafe_table_id: null,
            items: [{
                menu_id: 1, // Kopi Aren Spesial id is probably 1 since we wiped the DB
                quantity: 1,
                unit_price: 25000,
                options: []
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
