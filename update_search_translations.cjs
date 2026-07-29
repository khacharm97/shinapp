const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    search_skills_placeholder: "Որոնել հմտություններ, օրինակ՝ շինարար...",
    search_talent_badge: "Տաղանդի նշան",
    search_talent_badge_tooltip: "Այս նշանները օգնում են գտնել լավագույն մասնագետներին:",
    search_top_rated: "Բարձր վարկանիշ",
    search_available_now: "Հասանելի է հիմա",
    search_location: "Գտնվելու վայրը",
    search_regions_placeholder: "Մարզեր",
    search_all_regions: "Բոլոր մարզերը",
    search_city_placeholder: "Քաղաք",
    search_all_cities: "Բոլոր քաղաքները",
    search_failed: "Չհաջողվեց բեռնել որոնման արդյունքները:",
    search_no_results: "Ձեր չափանիշներին համապատասխանող մասնագետներ չգտնվեցին:",
    search_unnamed_master: "Անանուն մասնագետ",
    search_no_skills: "Նշված հմտություններ չկան",
    search_minimal_price: "Նվազագույն գինը",
    currency_amd: "Դրամ",
    search_per_day: "օր",
    search_per_sqm: "ք.մ.",
    search_per_hr: "ժամ",
    search_about_me: "Իմ մասին",
    search_about_default: "Ուսումնասիրեք և պլանավորեք։ Մտածեք ձեր փորձի, կրթության, մրցանակների, հմտությունների մասին..."
  },
  en: {
    search_skills_placeholder: "Search skills, example shinarar...",
    search_talent_badge: "Talent badge",
    search_talent_badge_tooltip: "These badges help you identify the best talent.",
    search_top_rated: "Top Rated",
    search_available_now: "Available now",
    search_location: "Location",
    search_regions_placeholder: "Regions",
    search_all_regions: "All Regions",
    search_city_placeholder: "City",
    search_all_cities: "All Cities",
    search_failed: "Failed to load search results.",
    search_no_results: "No masters found matching your criteria.",
    search_unnamed_master: "Unnamed Master",
    search_no_skills: "No specific skills listed",
    search_minimal_price: "Minimal price",
    currency_amd: "AMD",
    search_per_day: "day",
    search_per_sqm: "sqm",
    search_per_hr: "hr",
    search_about_me: "About me",
    search_about_default: "Research and brainstorm. Think about your background, education, awards, skills and other attributes..."
  },
  ru: {
    search_skills_placeholder: "Поиск навыков, например строитель...",
    search_talent_badge: "Значок таланта",
    search_talent_badge_tooltip: "Эти значки помогают определить лучших специалистов.",
    search_top_rated: "Лучший рейтинг",
    search_available_now: "Доступен сейчас",
    search_location: "Местоположение",
    search_regions_placeholder: "Регионы",
    search_all_regions: "Все регионы",
    search_city_placeholder: "Город",
    search_all_cities: "Все города",
    search_failed: "Не удалось загрузить результаты поиска.",
    search_no_results: "Мастера, соответствующие вашим критериям, не найдены.",
    search_unnamed_master: "Неизвестный мастер",
    search_no_skills: "Конкретные навыки не указаны",
    search_minimal_price: "Минимальная цена",
    currency_amd: "Драм",
    search_per_day: "день",
    search_per_sqm: "кв.м.",
    search_per_hr: "час",
    search_about_me: "Обо мне",
    search_about_default: "Исследуйте и планируйте. Подумайте о своем опыте, образовании, наградах, навыках..."
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
