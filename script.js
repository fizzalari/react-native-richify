const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from\s+['\"](\.\.?\/[^'\"]+)['\"]/g, (match, p1) => {
        let resolved = path.resolve(path.dirname(fullPath), p1);
        let srcDir = path.resolve('./src');
        if (resolved.startsWith(srcDir)) {
          let rel = path.relative(srcDir, resolved).replace(/\\/g, '/');
          return `from '@/${rel}'`;
        }
        return match;
      });
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
replaceInDir('./__tests__');
console.log('Imports replaced successfully.');
