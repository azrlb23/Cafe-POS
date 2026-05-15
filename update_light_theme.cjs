const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /bg-\[#1C1917\]/g, to: 'bg-[#FAFAF9]' },
    { from: /bg-\[#292524\]/g, to: 'bg-[#FFFFFF]' },
    { from: /bg-white\/5/g, to: 'bg-black/5' },
    { from: /bg-white\/10/g, to: 'bg-black/10' },
    { from: /bg-white\/20/g, to: 'bg-black/20' },
    { from: /hover:bg-white\/5/g, to: 'hover:bg-black/5' },
    { from: /hover:bg-white\/10/g, to: 'hover:bg-black/10' },
    { from: /border-\[#44403C\]/g, to: 'border-[#E7E5E4]' },
    { from: /border-white\/20/g, to: 'border-black/20' },
    { from: /text-\[#FAFAF9\]/g, to: 'text-[#292524]' },
    { from: /text-white/g, to: 'text-[#292524]' },
    { from: /text-\[#A8A29E\]/g, to: 'text-[#78716C]' },
    { from: /text-gray-300/g, to: 'text-[#57534E]' },
    { from: /text-gray-400/g, to: 'text-[#78716C]' },
    { from: /text-gray-500/g, to: 'text-[#A8A29E]' },
    { from: /text-\[#1C1917\]/g, to: 'text-[#FFFFFF]' }, // Inside buttons
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
console.log('Light Theme update complete.');
