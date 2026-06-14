export interface Region {
  id: string;
  nameAm: string;
  nameRu: string;
  nameEn: string;
  cities: City[];
}

export interface City {
  id: string;
  nameAm: string;
  nameRu: string;
  nameEn: string;
}

export const armeniaRegions: Region[] = [
  {
    id: 'yerevan',
    nameAm: 'Երևան',
    nameRu: 'Ереван',
    nameEn: 'Yerevan',
    cities: [
      { id: 'yere_ajapnyak', nameAm: 'Աջափնյակ', nameRu: 'Аджапняк', nameEn: 'Ajapnyak' },
      { id: 'yere_avan', nameAm: 'Ավան', nameRu: 'Аван', nameEn: 'Avan' },
      { id: 'yere_arabkir', nameAm: 'Արաբկիր', nameRu: 'Арабкир', nameEn: 'Arabkir' },
      { id: 'yere_davtashen', nameAm: 'Դավթաշեն', nameRu: 'Давташен', nameEn: 'Davtashen' },
      { id: 'yere_erebuni', nameAm: 'Էրեբունի', nameRu: 'Эребуни', nameEn: 'Erebuni' },
      { id: 'yere_kentron', nameAm: 'Կենտրոն', nameRu: 'Кентрон', nameEn: 'Kentron' },
      { id: 'yere_malatia', nameAm: 'Մալաթիա-Սեբաստիա', nameRu: 'Малатия-Себастия', nameEn: 'Malatia-Sebastia' },
      { id: 'yere_nor_nork', nameAm: 'Նոր Նորք', nameRu: 'Нор Норк', nameEn: 'Nor Nork' },
      { id: 'yere_nork_marash', nameAm: 'Նորք-Մարաշ', nameRu: 'Норк-Мараш', nameEn: 'Nork-Marash' },
      { id: 'yere_nubarashen', nameAm: 'Նուբարաշեն', nameRu: 'Нубарашен', nameEn: 'Nubarashen' },
      { id: 'yere_shengavit', nameAm: 'Շենգավիթ', nameRu: 'Шенгавит', nameEn: 'Shengavit' },
      { id: 'yere_kanaker', nameAm: 'Քանաքեռ-Զեյթուն', nameRu: 'Канакер-Зейтун', nameEn: 'Kanaker-Zeytun' }
    ]
  },
  {
    id: 'aragatsotn',
    nameAm: 'Արագածոտն',
    nameRu: 'Арагацотн',
    nameEn: 'Aragatsotn',
    cities: [
      { id: 'arag_ashtarak', nameAm: 'Աշտարակ', nameRu: 'Аштарак', nameEn: 'Ashtarak' },
      { id: 'arag_aparan', nameAm: 'Ապարան', nameRu: 'Апаран', nameEn: 'Aparan' },
      { id: 'arag_talin', nameAm: 'Թալին', nameRu: 'Талин', nameEn: 'Talin' }
    ]
  },
  {
    id: 'ararat',
    nameAm: 'Արարատ',
    nameRu: 'Арарат',
    nameEn: 'Ararat',
    cities: [
      { id: 'arar_artashat', nameAm: 'Արտաշատ', nameRu: 'Арташат', nameEn: 'Artashat' },
      { id: 'arar_ararat', nameAm: 'Արարատ', nameRu: 'Арарат', nameEn: 'Ararat' },
      { id: 'arar_masis', nameAm: 'Մասիս', nameRu: 'Масис', nameEn: 'Masis' },
      { id: 'arar_vedi', nameAm: 'Վեդի', nameRu: 'Веди', nameEn: 'Vedi' }
    ]
  },
  {
    id: 'armavir',
    nameAm: 'Արմավիր',
    nameRu: 'Армавир',
    nameEn: 'Armavir',
    cities: [
      { id: 'arma_armavir', nameAm: 'Արմավիր', nameRu: 'Армавир', nameEn: 'Armavir' },
      { id: 'arma_vagharshapat', nameAm: 'Վաղարշապատ', nameRu: 'Вагаршапат', nameEn: 'Vagharshapat' },
      { id: 'arma_metsamor', nameAm: 'Մեծամոր', nameRu: 'Мецамор', nameEn: 'Metsamor' }
    ]
  },
  {
    id: 'gegharkunik',
    nameAm: 'Գեղարքունիք',
    nameRu: 'Гехаркуник',
    nameEn: 'Gegharkunik',
    cities: [
      { id: 'gegh_gavar', nameAm: 'Գավառ', nameRu: 'Гавар', nameEn: 'Gavar' },
      { id: 'gegh_sevan', nameAm: 'Սևան', nameRu: 'Севан', nameEn: 'Sevan' },
      { id: 'gegh_martuni', nameAm: 'Մարտունի', nameRu: 'Мартуни', nameEn: 'Martuni' },
      { id: 'gegh_vardenis', nameAm: 'Վարդենիս', nameRu: 'Варденис', nameEn: 'Vardenis' },
      { id: 'gegh_chambarak', nameAm: 'Ճամբարակ', nameRu: 'Чамбарак', nameEn: 'Chambarak' }
    ]
  },
  {
    id: 'kotayk',
    nameAm: 'Կոտայք',
    nameRu: 'Котайк',
    nameEn: 'Kotayk',
    cities: [
      { id: 'kota_hrazdan', nameAm: 'Հրազդան', nameRu: 'Раздан', nameEn: 'Hrazdan' },
      { id: 'kota_abovyan', nameAm: 'Աբովյան', nameRu: 'Абовян', nameEn: 'Abovyan' },
      { id: 'kota_charentsavan', nameAm: 'Չարենցավան', nameRu: 'Чаренцаван', nameEn: 'Charentsavan' },
      { id: 'kota_nor_hachn', nameAm: 'Նոր Հաճն', nameRu: 'Нор Ачн', nameEn: 'Nor Hachn' },
      { id: 'kota_tsaghkadzor', nameAm: 'Ծաղկաձոր', nameRu: 'Цахкадзор', nameEn: 'Tsaghkadzor' },
      { id: 'kota_yeghvard', nameAm: 'Եղվարդ', nameRu: 'Егвард', nameEn: 'Yeghvard' }
    ]
  },
  {
    id: 'lori',
    nameAm: 'Լոռի',
    nameRu: 'Лори',
    nameEn: 'Lori',
    cities: [
      { id: 'lori_vanadzor', nameAm: 'Վանաձոր', nameRu: 'Ванадзор', nameEn: 'Vanadzor' },
      { id: 'lori_spitak', nameAm: 'Սպիտակ', nameRu: 'Спитак', nameEn: 'Spitak' },
      { id: 'lori_stepanavan', nameAm: 'Ստեփանավան', nameRu: 'Степанаван', nameEn: 'Stepanavan' },
      { id: 'lori_alaverdi', nameAm: 'Ալավերդի', nameRu: 'Алаверди', nameEn: 'Alaverdi' },
      { id: 'lori_tashir', nameAm: 'Տաշիր', nameRu: 'Ташир', nameEn: 'Tashir' },
      { id: 'lori_akhtala', nameAm: 'Ախթալա', nameRu: 'Ахтала', nameEn: 'Akhtala' },
      { id: 'lori_tumanyan', nameAm: 'Թումանյան', nameRu: 'Туманян', nameEn: 'Tumanyan' }
    ]
  },
  {
    id: 'shirak',
    nameAm: 'Շիրակ',
    nameRu: 'Ширак',
    nameEn: 'Shirak',
    cities: [
      { id: 'shir_gyumri', nameAm: 'Գյումրի', nameRu: 'Гюмри', nameEn: 'Gyumri' },
      { id: 'shir_artik', nameAm: 'Արթիկ', nameRu: 'Артик', nameEn: 'Artik' },
      { id: 'shir_maralik', nameAm: 'Մարալիկ', nameRu: 'Маралик', nameEn: 'Maralik' }
    ]
  },
  {
    id: 'syunik',
    nameAm: 'Սյունիք',
    nameRu: 'Сюник',
    nameEn: 'Syunik',
    cities: [
      { id: 'syun_kapan', nameAm: 'Կապան', nameRu: 'Капан', nameEn: 'Kapan' },
      { id: 'syun_goris', nameAm: 'Գորիս', nameRu: 'Горис', nameEn: 'Goris' },
      { id: 'syun_sisian', nameAm: 'Սիսիան', nameRu: 'Сисиан', nameEn: 'Sisian' },
      { id: 'syun_kajaran', nameAm: 'Քաջարան', nameRu: 'Каджаран', nameEn: 'Kajaran' },
      { id: 'syun_agarak', nameAm: 'Ագարակ', nameRu: 'Агарак', nameEn: 'Agarak' },
      { id: 'syun_meghri', nameAm: 'Մեղրի', nameRu: 'Мегри', nameEn: 'Meghri' },
      { id: 'syun_dastakert', nameAm: 'Դաստակերտ', nameRu: 'Дастакерт', nameEn: 'Dastakert' }
    ]
  },
  {
    id: 'vayots_dzor',
    nameAm: 'Վայոց Ձոր',
    nameRu: 'Вайоц Дзор',
    nameEn: 'Vayots Dzor',
    cities: [
      { id: 'vayo_yeghegnadzor', nameAm: 'Եղեգնաձոր', nameRu: 'Ехегнадзор', nameEn: 'Yeghegnadzor' },
      { id: 'vayo_vayk', nameAm: 'Վայք', nameRu: 'Вайк', nameEn: 'Vayk' },
      { id: 'vayo_jermuk', nameAm: 'Ջերմուկ', nameRu: 'Джермук', nameEn: 'Jermuk' }
    ]
  },
  {
    id: 'tavush',
    nameAm: 'Տավուշ',
    nameRu: 'Тавуш',
    nameEn: 'Tavush',
    cities: [
      { id: 'tavu_ijevan', nameAm: 'Իջևան', nameRu: 'Иджеван', nameEn: 'Ijevan' },
      { id: 'tavu_dilijan', nameAm: 'Դիլիջան', nameRu: 'Дилиджан', nameEn: 'Dilijan' },
      { id: 'tavu_noyemberyan', nameAm: 'Նոյեմբերյան', nameRu: 'Ноемберян', nameEn: 'Noyemberyan' },
      { id: 'tavu_berd', nameAm: 'Բերդ', nameRu: 'Берд', nameEn: 'Berd' },
      { id: 'tavu_ayrum', nameAm: 'Այրում', nameRu: 'Айрум', nameEn: 'Ayrum' }
    ]
  }
];
