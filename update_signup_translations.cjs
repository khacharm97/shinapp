const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    auth_error: "Գրանցման ընթացքում տեղի ունեցավ սխալ:",
    role_master: "Ես մասնագետ եմ",
    role_customer: "Ես հաճախորդ եմ",
    auth_signup_subtitle: "Ստեղծեք ձեր հաշիվը",
    auth_name_label: "Անուն Ազգանուն",
    auth_email_label_only: "Էլ. փոստ",
    auth_phone_label: "Հեռախոսահամար",
    auth_confirm_password_label: "Հաստատել գաղտնաբառը",
    auth_agree_terms: "Ես համաձայն եմ պայմանների հետ",
    auth_instant_signup: "Ակնթարթային գրանցում",
    auth_have_account: "Արդեն ունե՞ք հաշիվ:",
    auth_error_passwords_mismatch: "Գաղտնաբառերը չեն համընկնում:",
    welcome: "Բարի գալուստ ShinApp"
  },
  en: {
    auth_error: "An error occurred during registration.",
    role_master: "I am a specialist",
    role_customer: "I am a customer",
    auth_signup_subtitle: "Create your account",
    auth_name_label: "Full Name",
    auth_email_label_only: "Email",
    auth_phone_label: "Phone Number",
    auth_confirm_password_label: "Confirm Password",
    auth_agree_terms: "I agree to the terms and conditions",
    auth_instant_signup: "Instant Sign up",
    auth_have_account: "Already have an account?",
    auth_error_passwords_mismatch: "Passwords do not match.",
    welcome: "Welcome to ShinApp"
  },
  ru: {
    auth_error: "Во время регистрации произошла ошибка.",
    role_master: "Я специалист",
    role_customer: "Я клиент",
    auth_signup_subtitle: "Создайте свой аккаунт",
    auth_name_label: "Полное имя",
    auth_email_label_only: "Эл. почта",
    auth_phone_label: "Номер телефона",
    auth_confirm_password_label: "Подтвердите пароль",
    auth_agree_terms: "Я согласен с условиями",
    auth_instant_signup: "Мгновенная регистрация",
    auth_have_account: "Уже есть аккаунт?",
    auth_error_passwords_mismatch: "Пароли не совпадают.",
    welcome: "Добро пожаловать в ShinApp"
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
