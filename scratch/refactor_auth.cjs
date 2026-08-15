const fs = require('fs');
const path = require('path');
const dir = './src/routes';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('beforeLoad: () => {') && content.includes('auth.')) {
    content = content.replace(/beforeLoad: \(\) => {/g, 'beforeLoad: async () => {');
    changed = true;
  }
  
  if (content.match(/auth\.isAdmin\(\)/g)) {
    content = content.replace(/auth\.isAdmin\(\)/g, '(await auth.isAdmin())');
    changed = true;
  }
  
  if (content.match(/auth\.isUser\(\)/g)) {
    content = content.replace(/auth\.isUser\(\)/g, '(await auth.isUser())');
    changed = true;
  }

  if (content.match(/auth\.isAuthenticated\(\)/g)) {
    content = content.replace(/auth\.isAuthenticated\(\)/g, '(await auth.isAuthenticated())');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
}

