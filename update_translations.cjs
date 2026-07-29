const fs = require('fs');
const path = require('path');

function updateFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Replace: if (i18n.language === "am") return item.nameAm; -> add fa
      const pattern1 = /if\s*\(i18n\.language\s*===\s*["']am["']\)\s*return\s*([^.]+)\.nameAm;/g;
      if (pattern1.test(content)) {
        content = content.replace(pattern1, (match, item) => {
          return `if (i18n.language === "fa") return ${item}.nameFa;\n      ${match}`;
        });
        modified = true;
      }

      // Replace: i18n.language === 'am' ? r.nameAm : r.nameEn -> add fa condition
      // A bit complex with regex, better to do specific replacements for search.tsx
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

updateFiles(path.join(__dirname, 'src', 'pages'));
