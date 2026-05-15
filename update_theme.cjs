const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /bg-\[#121212\]/g, to: 'bg-[#1C1917]' },
    { from: /text-\[#121212\]/g, to: 'text-[#1C1917]' },
    { from: /bg-\[#1A1A1A\]/g, to: 'bg-[#292524]' },
    { from: /bg-\[#1B2540\]/g, to: 'bg-[#292524]' },
    { from: /text-\[#D4AF37\]/g, to: 'text-[#D97706]' },
    { from: /from-\[#D4AF37\] to-\[#E58B2E\]/g, to: 'from-[#D97706] to-[#B45309]' },
    { from: /hover:from-\[#c29c2d\] hover:to-\[#cc7a22\]/g, to: 'hover:from-[#B45309] hover:to-[#92400E]' },
    { from: /border-\[#D4AF37\]/g, to: 'border-[#D97706]' },
    { from: /text-\[#e0e0e0\]/g, to: 'text-[#FAFAF9]' },
    { from: /border-white\/5/g, to: 'border-[#44403C]' },
    { from: /border-white\/10/g, to: 'border-[#44403C]' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.vue')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'resources', 'js'));
console.log('Theme update complete.');
