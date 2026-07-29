const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    auth_banner_title: "Գտեք ձեր հարմարավետ տունը",
    auth_banner_desc: "Ուսումնասիրեք և պլանավորեք։ Մտածեք ձեր փորձի, կրթության, մրցանակների, հմտությունների և այլ հատկանիշների մասին, որոնք դուք զարգացրել կամ ձեռք եք բերել ձեր կարիերայի կամ կրթության ընթացքում։"
  },
  en: {
    auth_banner_title: "Find your sweet home",
    auth_banner_desc: "Research and brainstorm. Think about your background, education, awards, skills and other attributes that you developed or earned throughout your career or education."
  },
  ru: {
    auth_banner_title: "Найдите свой уютный дом",
    auth_banner_desc: "Исследуйте и планируйте. Подумайте о своем опыте, образовании, наградах, навыках и других качествах, которые вы развили или приобрели за время своей карьеры или обучения."
  }
};

for (const lang of ['am', 'en', 'ru']) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, translations[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}/translation.json`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}
