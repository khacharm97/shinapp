const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  am: {
    about_title: "Մեր մասին",
    about_subtitle: "ShinApp․ Շինարարության ոլորտի նոր թվային հարթակը",
    about_desc_1: "Շինարարությունն ու վերանորոգումը կյանքի ամենակարևոր և պատասխանատու գործընթացներից են։ Անկախ նրանից՝ բնակարան եք վերանորոգում, տուն կառուցում կամ առևտրային տարածք նախագծում, հաջող արդյունքի հիմքում միշտ ճիշտ մասնագետի ընտրությունն է։",
    about_desc_2: "Սակայն այսօր այդ գործընթացը հաճախ բարդ է․ մարդիկ ժամեր և նույնիսկ օրեր են ծախսում վստահելի մասնագետներ գտնելու, առաջարկներ համեմատելու, գները հասկանալու և տարբեր ծառայություններ որոնելու վրա։ Մյուս կողմից՝ փորձառու մասնագետները, բրիգադներն ու փոքր ընկերությունները միշտ չէ, որ ունեն հնարավորություն ներկայանալու նոր հաճախորդներին և զարգացնելու իրենց գործունեությունը։",
    about_desc_3: "Հենց այս խնդիրը լուծելու համար ստեղծվեց ShinApp հարթակը։",
    about_desc_4: "Մենք ցանկանում ենք ստեղծել մեկ միասնական թվային միջավայր, որտեղ շինարարության ոլորտի բոլոր մասնակիցները կարող են հեշտությամբ գտնել միմյանց, համագործակցել և իրականացնել հաջող նախագծեր։",

    about_goal_title: "Մեր նպատակը",
    about_goal_1: "ShinApp-ի նպատակն է թվայնացնել շինարարության ոլորտը և դարձնել համագործակցությունը հնարավորինս պարզ, արագ և թափանցիկ։",
    about_goal_2: "Մենք ցանկանում ենք, որ ցանկացած մարդ կարողանա ընդամենը մի քանի րոպեում գտնել իրեն անհրաժեշտ մասնագետին, տեսնել նրա փորձը, իրականացրած աշխատանքները, գնահատականները և անմիջապես կապ հաստատել։",
    about_goal_3: "Միաժամանակ մենք ցանկանում ենք ստեղծել միջավայր, որտեղ մասնագետները կարող են ներկայացնել իրենց հմտությունները, ձևավորել մասնագիտական հեղինակություն և ստանալ նոր պատվերներ՝ առանց միջնորդների։",

    about_offers_title: "Ի՞նչ է առաջարկում ShinApp-ը",
    about_offers_desc_1: "ShinApp-ը պարզապես մասնագետների ցանկ չէ։ Սա բազմաֆունկցիոնալ հարթակ է, որը միավորում է շինարարության ոլորտի ամբողջ էկոհամակարգը մեկ վայրում։ Հարթակում կարող եք՝",
    about_offers_list_1: "գտնել փորձառու մասնագետների",
    about_offers_list_2: "ընտրել ամբողջական բրիգադներ",
    about_offers_list_3: "գտնել ճարտարապետների և ինտերիերի դիզայներների",
    about_offers_list_4: "վարձակալել շինարարական տեխնիկա",
    about_offers_list_5: "հրապարակել կամ գտնել աշխատանքի հայտարարություններ",
    about_offers_list_6: "ուսումնասիրել մասնագետների պորտֆոլիոն",
    about_offers_list_7: "համեմատել գնահատականներն ու կարծիքները",
    about_offers_list_8: "ընտրել ըստ գտնվելու վայրի, փորձի և հասանելիության",
    about_offers_desc_2: "Այս ամենը մեկ հարթակում՝ արագ և հարմար։",

    about_values_title: "Մեր արժեքները",
    about_values_1_title: "Վստահություն",
    about_values_1_desc: "Մենք հավատում ենք, որ հաջող համագործակցության հիմքում վստահությունն է։ Այդ պատճառով յուրաքանչյուր մասնագետ կարող է ներկայացնել իր պորտֆոլիոն, աշխատանքային փորձը, ծառայությունները և հաճախորդների գնահատականները։",
    about_values_2_title: "Թափանցիկություն",
    about_values_2_desc: "Մեր նպատակն է, որպեսզի պատվիրատուն մինչև կապ հաստատելը ունենա հնարավորինս շատ տեղեկատվություն՝ ճիշտ որոշում կայացնելու համար։",
    about_values_3_title: "Որակ",
    about_values_3_desc: "Մենք խրախուսում ենք մասնագիտական բարձր որակը և ստեղծում ենք միջավայր, որտեղ լավագույն մասնագետները կարող են արժանանալ իրենց աշխատանքի գնահատականին։",
    about_values_4_title: "Հասանելիություն",
    about_values_4_desc: "Մենք ցանկանում ենք, որ յուրաքանչյուր մարդ, անկախ իր գտնվելու վայրից կամ նախագծի չափից, հեշտությամբ գտնի անհրաժեշտ ծառայությունը։",

    about_audience_title: "Ո՞ւմ համար է ShinApp-ը",
    about_audience_desc: "ShinApp-ը նախատեսված է բոլոր նրանց համար, ովքեր որևէ կերպ կապված են շինարարության և վերանորոգման ոլորտի հետ։",
    about_audience_1_title: "Պատվիրատուների համար",
    about_audience_1_desc: "Եթե ցանկանում եք վերանորոգել բնակարան, կառուցել տուն կամ իրականացնել ցանկացած շինարարական նախագիծ, ShinApp-ում կարող եք գտնել վստահելի մասնագետների և թիմեր՝ առանց երկար որոնումների։",
    about_audience_2_title: "Մասնագետների համար",
    about_audience_2_desc: "Եթե աշխատում եք որպես էլեկտրիկ, սանտեխնիկ, ներկարար, սալիկապատող, ճարտարապետ, դիզայներ կամ այլ մասնագետ, ShinApp-ը հնարավորություն է տալիս ստեղծել մասնագիտական էջ, ներկայացնել ձեր աշխատանքները և ստանալ նոր պատվերներ։",
    about_audience_3_title: "Բրիգադների համար",
    about_audience_3_desc: "Թիմերը կարող են ունենալ մեկ ընդհանուր պրոֆիլ, ներկայացնել իրենց բոլոր անդամներին և ընդունել ավելի մեծ նախագծեր։",
    about_audience_4_title: "Շինարարական ընկերությունների համար",
    about_audience_4_desc: "Ընկերությունները կարող են ներկայացնել իրենց ծառայությունները, հրապարակել աշխատանքի հայտարարություններ և համալրել իրենց թիմերը նոր մասնագետներով։",
    about_audience_5_title: "Տեխնիկայի սեփականատերերի համար",
    about_audience_5_desc: "Շինարարական տեխնիկայի և սարքավորումների սեփականատերերը կարող են ներկայացնել իրենց տեխնիկան, սահմանել վարձակալության պայմանները և հեշտությամբ գտնել պատվիրատուներ։",

    about_vision_title: "Մեր տեսլականը",
    about_vision_1: "Մենք հավատում ենք, որ շինարարության ոլորտը նույնպես պետք է ունենա ժամանակակից թվային լուծումներ։",
    about_vision_2: "Մեր տեսլականն է ստեղծել Հայաստանի ամենահուսալի և ամենամեծ շինարարական հարթակը, որը կմիավորի ոլորտի բոլոր մասնակիցներին մեկ համայնքում։",
    about_vision_3: "Ապագայում ShinApp-ը նախատեսում է ներդնել նոր հնարավորություններ, ինչպիսիք են առցանց ամրագրումները, խելացի որոնումը, ավտոմատ հաշվարկները, թվային պայմանագրերը, վճարումների համակարգը և ոլորտի համար նախատեսված բազմաթիվ նոր ծառայություններ։",

    about_mission_title: "Մեր առաքելությունը",
    about_mission_1: "Մենք հավատում ենք, որ ճիշտ համագործակցությունը սկսվում է ճիշտ կապից։",
    about_mission_2: "ShinApp-ի առաքելությունն է ստեղծել հարթակ, որտեղ յուրաքանչյուր պատվիրատու կգտնի վստահելի մասնագետ, իսկ յուրաքանչյուր մասնագետ՝ նոր հնարավորություններ։",
    about_mission_3: "Մենք կառուցում ենք ոչ միայն տեխնոլոգիական հարթակ, այլ համայնք, որտեղ գնահատվում են մասնագիտական փորձը, ազնիվ աշխատանքը և երկարաժամկետ համագործակցությունը։"
  },
  en: {
    about_title: "About Us",
    about_subtitle: "ShinApp: The new digital platform for the construction industry",
    about_desc_1: "Construction and renovation are among the most important and responsible processes in life. Whether you're renovating an apartment, building a home, or designing a commercial space, successful outcomes always depend on choosing the right specialist.",
    about_desc_2: "However, today this process is often complicated: people spend hours or even days finding reliable specialists, comparing offers, understanding pricing, and searching for various services. On the other hand, experienced professionals, crews, and small companies don't always have the opportunity to showcase themselves to new clients and grow their business.",
    about_desc_3: "The ShinApp platform was created to solve exactly this problem.",
    about_desc_4: "We want to build a single digital environment where all participants in the construction industry can easily find each other, collaborate, and execute successful projects.",

    about_goal_title: "Our Goal",
    about_goal_1: "ShinApp's goal is to digitize the construction sector and make collaboration as simple, fast, and transparent as possible.",
    about_goal_2: "We want anyone to be able to find the specialist they need in just a few minutes, view their experience, past work, and ratings, and get in touch immediately.",
    about_goal_3: "At the same time, we aim to create an environment where specialists can present their skills, build a professional reputation, and get new orders—without intermediaries.",

    about_offers_title: "What does ShinApp offer?",
    about_offers_desc_1: "ShinApp is not just a directory of specialists. It's a multifunctional platform that brings the entire construction ecosystem together in one place. On the platform, you can:",
    about_offers_list_1: "Find experienced specialists,",
    about_offers_list_2: "Select complete construction crews,",
    about_offers_list_3: "Discover architects and interior designers,",
    about_offers_list_4: "Rent construction equipment,",
    about_offers_list_5: "Post or find job advertisements,",
    about_offers_list_6: "Explore the portfolios of professionals,",
    about_offers_list_7: "Compare ratings and reviews,",
    about_offers_list_8: "Filter by location, experience, and availability.",
    about_offers_desc_2: "All this on one platform—fast and convenient.",

    about_values_title: "Our Values",
    about_values_1_title: "Trust",
    about_values_1_desc: "We believe that trust is the foundation of successful collaboration. That's why every specialist can showcase their portfolio, work experience, services, and customer ratings.",
    about_values_2_title: "Transparency",
    about_values_2_desc: "Our aim is for clients to have as much information as possible to make the right decision before initiating contact.",
    about_values_3_title: "Quality",
    about_values_3_desc: "We encourage high professional quality and create an environment where the best specialists can receive the recognition they deserve for their work.",
    about_values_4_title: "Accessibility",
    about_values_4_desc: "We want everyone, regardless of their location or the size of their project, to easily find the services they need.",

    about_audience_title: "Who is ShinApp for?",
    about_audience_desc: "ShinApp is designed for anyone connected in any way to the construction and renovation industry.",
    about_audience_1_title: "For Clients",
    about_audience_1_desc: "If you want to renovate an apartment, build a house, or carry out any construction project, ShinApp lets you find trusted specialists and teams without long searches.",
    about_audience_2_title: "For Specialists",
    about_audience_2_desc: "If you work as an electrician, plumber, painter, tiler, architect, designer, or other specialist, ShinApp gives you the opportunity to create a professional page, present your work, and get new orders.",
    about_audience_3_title: "For Crews",
    about_audience_3_desc: "Teams can have a single shared profile, present all their members, and take on larger projects.",
    about_audience_4_title: "For Construction Companies",
    about_audience_4_desc: "Companies can present their services, post job listings, and expand their teams with new professionals.",
    about_audience_5_title: "For Equipment Owners",
    about_audience_5_desc: "Owners of construction machinery and equipment can showcase their inventory, set rental conditions, and easily find clients.",

    about_vision_title: "Our Vision",
    about_vision_1: "We believe that the construction industry must also embrace modern digital solutions.",
    about_vision_2: "Our vision is to build Armenia's largest and most reliable construction platform, uniting all industry participants into one community.",
    about_vision_3: "In the future, ShinApp plans to introduce new features such as online bookings, smart search, automated estimates, digital contracts, a payment system, and many more industry-specific services.",

    about_mission_title: "Our Mission",
    about_mission_1: "We believe that right collaborations begin with the right connections.",
    about_mission_2: "ShinApp's mission is to create a platform where every client finds a reliable specialist, and every specialist finds new opportunities.",
    about_mission_3: "We are building not just a technological platform, but a community where professional experience, honest work, and long-term partnerships are valued."
  },
  ru: {
    about_title: "О нас",
    about_subtitle: "ShinApp: Новая цифровая платформа для строительной отрасли",
    about_desc_1: "Строительство и ремонт — одни из самых важных и ответственных процессов в жизни. Независимо от того, ремонтируете ли вы квартиру, строите дом или проектируете коммерческое помещение, успешный результат всегда зависит от выбора правильного специалиста.",
    about_desc_2: "Однако сегодня этот процесс часто бывает сложным: люди тратят часы или даже дни на поиск надежных специалистов, сравнение предложений, понимание цен и поиск различных услуг. С другой стороны, опытные специалисты, бригады и небольшие компании не всегда имеют возможность заявить о себе новым клиентам и развивать свой бизнес.",
    about_desc_3: "Именно для решения этой проблемы была создана платформа ShinApp.",
    about_desc_4: "Мы хотим создать единую цифровую среду, где все участники строительной отрасли смогут легко находить друг друга, сотрудничать и реализовывать успешные проекты.",

    about_goal_title: "Наша цель",
    about_goal_1: "Цель ShinApp — цифровизация строительной сферы и создание максимально простого, быстрого и прозрачного сотрудничества.",
    about_goal_2: "Мы хотим, чтобы любой человек мог всего за несколько минут найти нужного специалиста, увидеть его опыт, выполненные работы, оценки и немедленно связаться с ним.",
    about_goal_3: "В то же время мы стремимся создать среду, где специалисты могут демонстрировать свои навыки, формировать профессиональную репутацию и получать новые заказы — без посредников.",

    about_offers_title: "Что предлагает ShinApp?",
    about_offers_desc_1: "ShinApp — это не просто каталог специалистов. Это многофункциональная платформа, объединяющая всю экосистему строительства в одном месте. На платформе вы можете:",
    about_offers_list_1: "найти опытных специалистов,",
    about_offers_list_2: "выбрать полноценные строительные бригады,",
    about_offers_list_3: "найти архитекторов и дизайнеров интерьера,",
    about_offers_list_4: "арендовать строительную технику,",
    about_offers_list_5: "публиковать или находить вакансии,",
    about_offers_list_6: "изучать портфолио профессионалов,",
    about_offers_list_7: "сравнивать оценки и отзывы,",
    about_offers_list_8: "фильтровать по местоположению, опыту и доступности.",
    about_offers_desc_2: "Все это на одной платформе — быстро и удобно.",

    about_values_title: "Наши ценности",
    about_values_1_title: "Доверие",
    about_values_1_desc: "Мы верим, что доверие — основа успешного сотрудничества. Именно поэтому каждый специалист может представить свое портфолио, опыт работы, услуги и оценки клиентов.",
    about_values_2_title: "Прозрачность",
    about_values_2_desc: "Наша цель — предоставить клиенту максимум информации для принятия правильного решения до установления контакта.",
    about_values_3_title: "Качество",
    about_values_3_desc: "Мы поощряем высокое профессиональное качество и создаем среду, где лучшие специалисты могут получить заслуженное признание за свою работу.",
    about_values_4_title: "Доступность",
    about_values_4_desc: "Мы хотим, чтобы каждый, независимо от местоположения или масштаба проекта, мог легко найти нужные услуги.",

    about_audience_title: "Для кого создан ShinApp?",
    about_audience_desc: "ShinApp предназначен для всех, кто так или иначе связан со сферой строительства и ремонта.",
    about_audience_1_title: "Для заказчиков",
    about_audience_1_desc: "Если вы хотите отремонтировать квартиру, построить дом или реализовать любой строительный проект, на ShinApp вы сможете найти надежных специалистов и команды без долгих поисков.",
    about_audience_2_title: "Для специалистов",
    about_audience_2_desc: "Если вы работаете электриком, сантехником, маляром, плиточником, архитектором, дизайнером или другим специалистом, ShinApp дает вам возможность создать профессиональную страницу, представить свои работы и получать новые заказы.",
    about_audience_3_title: "Для бригад",
    about_audience_3_desc: "Команды могут иметь общий профиль, представлять всех своих участников и брать более крупные проекты.",
    about_audience_4_title: "Для строительных компаний",
    about_audience_4_desc: "Компании могут представлять свои услуги, публиковать вакансии и пополнять свои команды новыми специалистами.",
    about_audience_5_title: "Для владельцев техники",
    about_audience_5_desc: "Владельцы строительной техники и оборудования могут представить свой инвентарь, установить условия аренды и легко находить клиентов.",

    about_vision_title: "Наше видение",
    about_vision_1: "Мы верим, что строительная отрасль также должна внедрять современные цифровые решения.",
    about_vision_2: "Наше видение — создать крупнейшую и самую надежную строительную платформу в Армении, объединив всех участников отрасли в единое сообщество.",
    about_vision_3: "В будущем ShinApp планирует внедрить новые функции, такие как онлайн-бронирование, умный поиск, автоматические сметы, цифровые контракты, платежную систему и многие другие специализированные услуги.",

    about_mission_title: "Наша миссия",
    about_mission_1: "Мы верим, что правильное сотрудничество начинается с правильных связей.",
    about_mission_2: "Миссия ShinApp — создать платформу, где каждый клиент найдет надежного специалиста, а каждый специалист — новые возможности.",
    about_mission_3: "Мы строим не просто технологическую платформу, а сообщество, где ценятся профессиональный опыт, честный труд и долгосрочное партнерство."
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
