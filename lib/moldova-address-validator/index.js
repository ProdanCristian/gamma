const moldovaLocalities = {
  citiesMap: new Map([
    ["Chișinău", "Кишинёв"],
    ["Bălți", "Бельцы"],
    ["Comrat", "Комрат"],
    ["Hîncești", "Хынчешть"],
    ["Orhei", "Орхей"],
    ["Ungheni", "Унгень"],
    ["Cahul", "Кагул"],
    ["Soroca", "Сорока"],
    ["Hîncești", "Хынчешть"],
    ["Căușeni", "Каушаны"],
    ["Strășeni", "Страшены"],
    ["Ceadîr-Lunga", "Чадыр-Лунга"],
    ["Sîngerei", "Сынжерей"],
    ["Căinari", "Кайнары"],
    ["Vulcănești", "Вулканешты"],
    ["Nisporeni", "Ниспорены"],
    ["Călărași", "Калараш"],
    ["Cornești", "Корнешть"],
    ["Cricova", "Крикова"],
    ["Codru", "Кодру"],
    ["Vadul lui Vodă", "Вадул-луй-Водэ"],
    ["Durlești", "Дурлешть"],
    ["Ialoveni", "Яловены"],
    ["Florești", "Флорешты"],
    ["Fălești", "Фалешты"],
    ["Dondușeni", "Дондюшаны"],
    ["Drochia", "Дрокия"],
    ["Edineț", "Единец"],
    ["Rezina", "Резина"],
    ["Rîșcani", "Рышканы"],
    ["Telenești", "Теленешть"],
    ["Șoldănești", "Шолданешты"],
    ["Taraclia", "Тараклия"],
    ["Biruința", "Бируинца"],
    ["Vatra", "Ватра"],
    ["Sîngera", "Сынжера"],
    ["Bucovăț", "Буковец"],
    ["Ghidighici", "Гидигич"],
    ["Anenii Noi", "Новые Анены"],
    ["Basarabeasca", "Басарабяска"],
    ["Briceni", "Бричаны"],
    ["Cantemir", "Кантемир"],
    ["Cimișlia", "Чимишлия"],
    ["Criuleni", "Криуляны"],
    ["Glodeni", "Глодяны"],
    ["Leova", "Леова"],
    ["Ocnița", "Окница"],
    ["Ștefan Vodă", "Штефан-Водэ"],
    ["Tiraspol", "Тирасполь"],
    ["Bender", "Бендеры"],
    ["Rîbnița", "Рыбница"],
    ["Dubăsari", "Дубоссары"],
    ["Slobozia", "Слободзея"],
    ["Dnestrovsc", "Днестровск"],
    ["Cupcini", "Купчинь"],
    ["Mărculeşti", "Маркулешты"],
    ["Lipcani", "Липканы"],
    ["Otaci", "Отачь"],
    ["Căușeni", "Каушаны"],
    ["Iargara", "Яргара"],
    ["Costești", "Костешть"],
    ["Mărculești", "Маркулешть"],
    ["Șoldănești", "Шолданешты"],
  ]),

  chisinauSectorsMap: new Map([
    ["Centru", "Центр"],
    ["Buiucani", "Буюканы"],
    ["Botanica", "Ботаника"],
    ["Ciocana", "Чеканы"],
    ["Rîșcani", "Рышкановка"],
  ]),

  suburbanLocalitiesMap: new Map([
    ["Băcioi", "Бачой"],
    ["Brăila", "Браила"],
    ["Bubuieci", "Бубуечь"],
    ["Budești", "Будешть"],
    ["Cheltuitori", "Келтуиторь"],
    ["Ciorescu", "Чореску"],
    ["Colonița", "Колоница"],
    ["Condrița", "Кондрица"],
    ["Cruzești", "Крузешть"],
    ["Dumbrava", "Думбрава"],
    ["Frecăței", "Фрекэцей"],
    ["Grătiești", "Гратиешть"],
    ["Hulboaca", "Хулбоака"],
    ["Maximovca", "Максимовка"],
    ["Republica", "Република"],
    ["Revaca", "Ревака"],
    ["Stăuceni", "Стаучень"],
    ["Străisteni", "Страйстень"],
    ["Tohatin", "Тохатин"],
    ["Trușeni", "Трушень"],
  ]),

  districtsMap: new Map([
    ["Anenii Noi", "Новые Анены"],
    ["Basarabeasca", "Басарабяска"],
    ["Briceni", "Бричаны"],
    ["Cahul", "Кагул"],
    ["Cantemir", "Кантемир"],
    ["Călărași", "Калараш"],
    ["Căușeni", "Каушаны"],
    ["Cimișlia", "Чимишлия"],
    ["Criuleni", "Криуляны"],
    ["Dondușeni", "Дондюшаны"],
    ["Drochia", "Дрокия"],
    ["Dubăsari", "Дубоссары"],
    ["Edineț", "Единец"],
    ["Fălești", "Фалешты"],
    ["Florești", "Флорешты"],
    ["Glodeni", "Глодяны"],
    ["Hîncești", "Хынчешть"],
    ["Ialoveni", "Яловены"],
    ["Leova", "Леова"],
    ["Nisporeni", "Ниспорены"],
    ["Ocnița", "Окница"],
    ["Orhei", "Орхей"],
    ["Rezina", "Резина"],
    ["Rîșcani", "Рышканы"],
    ["Sîngerei", "Сынжерей"],
    ["Soroca", "Сорока"],
    ["Strășeni", "Страшены"],
    ["Șoldănești", "Шолданешты"],
    ["Ștefan Vodă", "Штефан-Водэ"],
    ["Taraclia", "Тараклия"],
    ["Telenești", "Теленешты"],
    ["Ungheni", "Унгены"],
    ["UTA Găgăuzia", "АТО Гагаузия"],
    ["Municipiul Chișinău", "Муниципий Кишинэу"],
    ["Municipiul Bălți", "Муниципий Бэлць"],
  ]),
};

class MoldovaAddressValidator {
  constructor(language = "ro") {
    this.data = moldovaLocalities;
    this.setLanguage(language);

    this.streetTypes = {
      ro: {
        street: "strada",
        avenue: "bulevardul",
        lane: "stradela",
        alley: "aleea",
        square: "piața",
      },
      ru: {
        street: "улица",
        avenue: "проспект",
        lane: "переулок",
        alley: "аллея",
        square: "площадь",
      },
    };

    this.labels = {
      ro: {
        apartment: "ap.",
        building: "bl.",
        entrance: "sc.",
        floor: "et.",
        sector: "sector",
        office: "of.",
      },
      ru: {
        apartment: "кв.",
        building: "корп.",
        entrance: "под.",
        floor: "эт.",
        sector: "сектор",
        office: "оф.",
      },
    };
  }

  setLanguage(language) {
    if (!["ro", "ru"].includes(language)) {
      console.warn(`Unsupported language: ${language}, defaulting to "ro"`);
      this.language = "ro";
    } else {
      this.language = language;
    }
  }

  fuzzyMatch(input, target) {
    input = input.toLowerCase();
    target = target.toLowerCase();

    if (target.includes(input)) return 1;

    const matrix = Array(input.length + 1)
      .fill()
      .map(() => Array(target.length + 1).fill(0));

    for (let i = 0; i <= input.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= target.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= input.length; i++) {
      for (let j = 1; j <= target.length; j++) {
        const cost = input[i - 1] === target[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return (
      1 -
      matrix[input.length][target.length] /
        Math.max(input.length, target.length)
    );
  }

  autocompleteLocality(prefix, options = { threshold: 0.3, limit: 10 }) {
    const { threshold, limit, type } = options;
    const results = [];
    console.log("Autocomplete running with language:", this.language);

    const addMatches = (map, locationType) => {
      if (type && type !== locationType) return;

      for (const [ro, ru] of map) {
        const nameRo = ro.toLowerCase();
        const nameRu = ru.toLowerCase();
        const searchPrefix = prefix.toLowerCase();

        const nameToMatch = this.language === "ru" ? nameRu : nameRo;
        const score = this.fuzzyMatch(searchPrefix, nameToMatch);

        if (score > threshold) {
          const result = {
            name: this.language === "ru" ? ru : ro,
            type: locationType,
            score,
            translations: { ro, ru },
          };
          console.log("Adding match:", result);
          results.push(result);
        }
      }
    };

    addMatches(this.data.citiesMap, "city");
    addMatches(this.data.suburbanLocalitiesMap, "suburban");

    if (prefix.length >= 2 && !type) {
      addMatches(this.data.districtsMap, "district");
    }

    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log("Final sorted results:", sortedResults);
    return sortedResults;
  }

  validatePostalCode(postalCode) {
    const postalCodeRegex = /^MD-\d{4}$/;
    return postalCodeRegex.test(postalCode);
  }

  validateStreetAddress(street) {
    const letterRegex =
      this.language === "ro" ? /[a-zA-ZăâîșțĂÂÎȘȚ]/ : /[а-яА-ЯёЁ]/;
    return street.length >= 3 && letterRegex.test(street);
  }

  formatAddress(address) {
    const {
      streetType = "street",
      street,
      houseNumber,
      building,
      entrance,
      floor,
      apartment,
      office,
      city,
      sector,
      district,
      postalCode,
    } = address;

    const labels = this.labels[this.language];
    const streetTypeText = this.streetTypes[this.language][streetType];

    let formattedAddress = "";

    formattedAddress += `${streetTypeText} ${street} ${houseNumber}`;

    if (building) {
      formattedAddress += `, ${labels.building} ${building}`;
    }

    if (entrance) {
      formattedAddress += `, ${labels.entrance} ${entrance}`;
    }

    if (floor) {
      formattedAddress += `, ${labels.floor} ${floor}`;
    }

    if (apartment) {
      formattedAddress += `, ${labels.apartment} ${apartment}`;
    }

    if (office) {
      formattedAddress += `, ${labels.office} ${office}`;
    }

    if (sector && (city === "Chișinău" || city === "Кишинёв")) {
      formattedAddress += `\n${labels.sector} ${sector}`;
    }

    formattedAddress += `\n${city}, ${district}`;
    formattedAddress += `\n${postalCode}`;

    return formattedAddress;
  }
}

module.exports = { MoldovaAddressValidator, moldovaLocalities };
