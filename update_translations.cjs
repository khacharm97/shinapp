const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    who_are_we_title: "Ովքեր ենք մենք",
    who_are_we_desc_1: "Մենք միավորում ենք շինարարության ամբողջ ոլորտը մեկ հարթակում։",
    who_are_we_desc_2: "ShinApp-ը ստեղծվել է մեկ նպատակով՝ դարձնել շինարարական ծառայությունների որոնումը, համագործակցությունը և կառավարումը արագ, պարզ և վստահելի։",
    who_are_we_desc_3: "Մեր հարթակում կարող եք գտնել փորձառու մասնագետների, բրիգադներ, ճարտարապետներ, դիզայներներ, տեխնիկայի վարձակալության ծառայություններ և շինարարական ընկերություններ՝ բոլորը մեկ վայրում։",
    who_are_we_desc_4: "Անկախ նրանից՝ ցանկանում եք բնակարանի վերանորոգում, նոր տան կառուցում կամ մասնագետների համալրում, ShinApp-ը կապում է ձեզ ճիշտ մարդկանց հետ։"
  },
  en: {
    who_are_we_title: "Who are we?",
    who_are_we_desc_1: "We unite the entire construction industry in one platform.",
    who_are_we_desc_2: "ShinApp was created with one goal: to make finding, collaborating, and managing construction services fast, simple, and reliable.",
    who_are_we_desc_3: "On our platform, you can find experienced specialists, crews, architects, designers, equipment rental services, and construction companies - all in one place.",
    who_are_we_desc_4: "Whether you want to renovate an apartment, build a new home, or find specialists, ShinApp connects you with the right people."
  },
  ru: {
    who_are_we_title: "Кто мы?",
    who_are_we_desc_1: "Мы объединяем всю строительную отрасль на одной платформе.",
    who_are_we_desc_2: "ShinApp создан с одной целью: сделать поиск, сотрудничество и управление строительными услугами быстрыми, простыми и надежными.",
    who_are_we_desc_3: "На нашей платформе вы можете найти опытных специалистов, бригады, архитекторов, дизайнеров, услуги по аренде техники и строительные компании - все в одном месте.",
    who_are_we_desc_4: "Независимо от того, хотите ли вы отремонтировать квартиру, построить новый дом или найти специалистов, ShinApp связывает вас с нужными людьми."
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
