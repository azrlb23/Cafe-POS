const axios = require('axios');

async function run() {
    try {
        const api = axios.create({
            baseURL: 'http://localhost:5000',
            withCredentials: true
        });

        const loginRes = await api.post('/api/auth/login', {
            email: 'admin@denjavas.com',
            password: 'admin'
        });
        const cookies = loginRes.headers['set-cookie'];
        
        console.log("Login success!");

        const adminRes = await api.get('/api/admin/cashiers', {
            headers: { Cookie: cookies.join('; ') }
        });
        
        console.log("Cashiers:", adminRes.data.cashiers.length);
        console.log("Stats:", adminRes.data.stats);
        
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

run();
