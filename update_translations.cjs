const fs = require('fs');
const keys = {
  'role_master': 'Es masnaget em.',
  'role_customer': 'Es hachaxord em.',
  'cancel': 'Cancel'
};
['en', 'ru', 'am'].forEach(lang => {
  const path = `./public/locales/${lang}/translation.json`;
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    Object.assign(data, keys);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}`);
  }
});
