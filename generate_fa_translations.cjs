const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const enFilePath = path.join(localesDir, 'en', 'translation.json');
const faDirPath = path.join(localesDir, 'fa');
const faFilePath = path.join(faDirPath, 'translation.json');

if (!fs.existsSync(faDirPath)) {
  fs.mkdirSync(faDirPath, { recursive: true });
}

const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));

// Some basic Persian translations to get started
const persianDictionary = {
  "nav_home": "خانه",
  "nav_masters": "استادکاران",
  "nav_technique": "تجهیزات",
  "nav_calculator": "محاسبه‌گر",
  "nav_about_us": "درباره ما",
  "nav_contact_us": "تماس با ما",
  "nav_login": "ورود",
  "nav_signup": "ثبت‌نام",
  "welcome_back": "خوش آمدید!",
  "auth_login_subtitle": "لطفا اطلاعات خود را وارد کنید",
  "auth_email_label": "ایمیل یا شماره تلفن",
  "auth_password_label": "رمز عبور",
  "auth_remember": "مرا به خاطر بسپار",
  "auth_forgot_password": "رمز عبور خود را فراموش کرده‌اید؟",
  "loading": "در حال بارگذاری...",
  "auth_instant_login": "ورود سریع",
  "auth_continue_google": "ادامه با گوگل",
  "auth_no_account": "حساب کاربری ندارید؟",
  "auth_signup_subtitle": "حساب خود را ایجاد کنید",
  "auth_name_label": "نام کامل",
  "auth_email_label_only": "ایمیل",
  "auth_phone_label": "شماره تلفن",
  "auth_confirm_password_label": "تایید رمز عبور",
  "auth_agree_terms": "من با شرایط و ضوابط موافقم",
  "auth_instant_signup": "ثبت‌نام سریع",
  "auth_have_account": "قبلا ثبت‌نام کرده‌اید؟",
  "role_master": "من یک متخصص هستم",
  "role_customer": "من یک مشتری هستم",
  "search_placeholder": "جستجوی متخصصین، تجهیزات...",
  "search_button": "جستجو"
};

const faData = {};
for (const key in enData) {
  if (persianDictionary[key]) {
    faData[key] = persianDictionary[key];
  } else {
    // Append (FA) to untranslated keys for visibility
    faData[key] = enData[key] + " (FA)";
  }
}

fs.writeFileSync(faFilePath, JSON.stringify(faData, null, 2), 'utf8');
console.log('Created Persian translation file at', faFilePath);
