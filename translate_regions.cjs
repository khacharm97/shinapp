const fs = require('fs');
const path = require('path');

const regionsFilePath = path.join(__dirname, 'src', 'lib', 'armenia-regions.ts');
let content = fs.readFileSync(regionsFilePath, 'utf8');

const translations = {
  'Yerevan': 'ایروان',
  'Ajapnyak': 'آجاپنیاک',
  'Avan': 'آوان',
  'Arabkir': 'آرابکیر',
  'Davtashen': 'داوتاشن',
  'Erebuni': 'اربونی',
  'Kentron': 'کنترون',
  'Malatia-Sebastia': 'مالاتیا-سباستیا',
  'Nor Nork': 'نور نورک',
  'Nork-Marash': 'نورک-ماراش',
  'Nubarashen': 'نوباراشن',
  'Shengavit': 'شنگاویت',
  'Kanaker-Zeytun': 'کاناکر-زیتون',
  'Aragatsotn': 'آراگاتسوتن',
  'Ashtarak': 'آشتاراک',
  'Aparan': 'آپاران',
  'Talin': 'تالین',
  'Ararat': 'آرارات',
  'Artashat': 'آرتاشات',
  'Masis': 'ماسیس',
  'Vedi': 'ودی',
  'Armavir': 'آرماویر',
  'Vagharshapat': 'واغارشاپات',
  'Metsamor': 'متسامور',
  'Gegharkunik': 'گغارکونیک',
  'Gavar': 'گاوار',
  'Sevan': 'سوان',
  'Martuni': 'مارتونی',
  'Vardenis': 'واردنیس',
  'Chambarak': 'چامباراک',
  'Kotayk': 'کوتایک',
  'Hrazdan': 'هرازدان',
  'Abovyan': 'آبوویان',
  'Charentsavan': 'چارنتساوان',
  'Nor Hachn': 'نور هاچن',
  'Tsaghkadzor': 'تساغکادزور',
  'Yeghvard': 'یغوارد',
  'Lori': 'لوری',
  'Vanadzor': 'وانادزور',
  'Spitak': 'اسپیتاک',
  'Stepanavan': 'استپانوان',
  'Alaverdi': 'آلاوردی',
  'Tashir': 'تاشیر',
  'Akhtala': 'آختالا',
  'Tumanyan': 'تومانیان',
  'Shirak': 'شیراک',
  'Gyumri': 'گیومری',
  'Artik': 'آرتیک',
  'Maralik': 'مارالیک',
  'Syunik': 'سیونیک',
  'Kapan': 'کاپان',
  'Goris': 'گوریس',
  'Sisian': 'سیسیان',
  'Kajaran': 'کاجاران',
  'Agarak': 'آگاراک',
  'Meghri': 'مغری',
  'Dastakert': 'داستاکرت',
  'Vayots Dzor': 'وایوتس جور',
  'Yeghegnadzor': 'یغگنادزور',
  'Vayk': 'وایک',
  'Jermuk': 'جرموک',
  'Tavush': 'تاووش',
  'Ijevan': 'ایجوان',
  'Dilijan': 'دیلیجان',
  'Noyemberyan': 'نویمبریان',
  'Berd': 'برد',
  'Ayrum': 'آیروم'
};

// Add nameFa to interfaces
content = content.replace(/nameEn: string;/g, 'nameEn: string;\n  nameFa: string;');

// Add nameFa to objects
content = content.replace(/nameEn: '([^']+)'(,?)/g, (match, nameEn, comma) => {
  const nameFa = translations[nameEn] || nameEn;
  return `nameEn: '${nameEn}', nameFa: '${nameFa}'${comma}`;
});

fs.writeFileSync(regionsFilePath, content, 'utf8');
console.log('Updated armenia-regions.ts with nameFa');
