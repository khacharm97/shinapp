const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    welcome_back: "Բարի վերադարձ",
    auth_login_subtitle: "Խնդրում ենք մուտքագրել ձեր տվյալները",
    auth_error_invalid_credentials: "Սխալ էլ․ փոստ/հեռախոս կամ գաղտնաբառ",
    auth_email_label: "Էլ. փոստ կամ հեռախոս",
    auth_password_label: "Գաղտնաբառ",
    auth_remember: "Հիշել ինձ",
    auth_forgot_password: "Մոռացե՞լ եք գաղտնաբառը",
    loading: "Բեռնվում է...",
    nav_login: "Մուտք գործել",
    auth_instant_login: "Ակնթարթային մուտք",
    auth_continue_google: "Շարունակել Google-ով",
    auth_no_account: "Չունե՞ք օգտահաշիվ:",
    nav_signup: "Գրանցվել",
    auth_error_user_blocked: "Դուք արգելափակված եք: Կապվեք աջակցման կենտրոնի հետ:"
  },
  en: {
    welcome_back: "Welcome back!",
    auth_login_subtitle: "Please enter your details",
    auth_error_invalid_credentials: "Invalid email/phone or password.",
    auth_email_label: "Email or Phone",
    auth_password_label: "Password",
    auth_remember: "Remember me",
    auth_forgot_password: "Forgot password?",
    loading: "Loading...",
    nav_login: "Log in",
    auth_instant_login: "Instant Login",
    auth_continue_google: "Continue with Google",
    auth_no_account: "Don't have an account?",
    nav_signup: "Sign up.",
    auth_error_user_blocked: "You are blocked. Contact support."
  },
  ru: {
    welcome_back: "С возвращением!",
    auth_login_subtitle: "Пожалуйста, введите ваши данные",
    auth_error_invalid_credentials: "Неверный адрес электронной почты/телефон или пароль.",
    auth_email_label: "Эл. почта или телефон",
    auth_password_label: "Пароль",
    auth_remember: "Запомнить меня",
    auth_forgot_password: "Забыли пароль?",
    loading: "Загрузка...",
    nav_login: "Войти",
    auth_instant_login: "Мгновенный вход",
    auth_continue_google: "Продолжить с Google",
    auth_no_account: "Нет аккаунта?",
    nav_signup: "Зарегистрироваться.",
    auth_error_user_blocked: "Вы заблокированы. Обратитесь в службу поддержки."
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
