const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    profile_portfolios: "Պորտֆոլիոներ",
    profile_add_portfolio: "Ավելացնել պորտֆոլիո",
    profile_add_new_portfolio: "Ավելացնել նոր պորտֆոլիո",
    profile_portfolio_desc: "Ցուցադրեք ձեր լավագույն աշխատանքները (Առավելագույնը 3 նկար):",
    profile_portfolio_title: "Վերնագիր",
    profile_portfolio_title_placeholder: "օր.՝ Ժամանակակից խոհանոցի վերանորոգում",
    profile_portfolio_description: "Նկարագրություն",
    profile_portfolio_desc_placeholder: "Մանրամասներ այս նախագծի մասին...",
    profile_portfolio_images: "Նկարներ",
    profile_portfolio_save: "Պահպանել պորտֆոլիոն",
    profile_portfolio_empty: "Դուք դեռ չեք ավելացրել որևէ պորտֆոլիո:"
  },
  en: {
    profile_portfolios: "Portfolios",
    profile_add_portfolio: "Add Portfolio",
    profile_add_new_portfolio: "Add New Portfolio",
    profile_portfolio_desc: "Showcase your best work (Max 3 images).",
    profile_portfolio_title: "Title",
    profile_portfolio_title_placeholder: "e.g. Modern Kitchen Renovation",
    profile_portfolio_description: "Description",
    profile_portfolio_desc_placeholder: "Details about this project...",
    profile_portfolio_images: "Images",
    profile_portfolio_save: "Save Portfolio",
    profile_portfolio_empty: "You haven't added any portfolios yet."
  },
  ru: {
    profile_portfolios: "Портфолио",
    profile_add_portfolio: "Добавить портфолио",
    profile_add_new_portfolio: "Добавить новое портфолио",
    profile_portfolio_desc: "Продемонстрируйте свои лучшие работы (Макс. 3 изображения).",
    profile_portfolio_title: "Название",
    profile_portfolio_title_placeholder: "напр. Современный ремонт кухни",
    profile_portfolio_description: "Описание",
    profile_portfolio_desc_placeholder: "Подробности об этом проекте...",
    profile_portfolio_images: "Изображения",
    profile_portfolio_save: "Сохранить портфолио",
    profile_portfolio_empty: "Вы еще не добавили ни одного портфолио."
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
