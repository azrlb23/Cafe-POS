const cp = require('child_process');
const fs = require('fs');
const out = cp.execSync('node test_options_order.cjs').toString();
fs.writeFileSync('out.txt', out, 'utf8');
