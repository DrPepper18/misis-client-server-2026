// Вспомогательная функция для парсинга бюджета
function parseBudget(parseTree) {
    var raw = (parseTree.totalBudget && parseTree.totalBudget[0]) ? parseTree.totalBudget[0].text : "0";
    return parseInt(raw.replace(/\D/g, '')) || 50000;
}

// Поиск IATA кода
function getIataCode(cityName) {
    var cityToIATA = {
        "Москва": "MOW", "Санкт-Петербург": "LED", "Питер": "LED",
        "Сочи": "AER", "Адлер": "AER", "Казань": "KZN"
    };
    return cityToIATA[cityName] || (cityName ? cityName.substring(0, 3).toUpperCase() : "LED");
}

function getMonthNumber(monthName) {
    if (!monthName) return "05"; // Дефолт - май
    var m = monthName.toLowerCase();
    var months = {
        "янв": "01", "фев": "02", "мар": "03", "апр": "04", "май": "05", "мая": "05",
        "июн": "06", "июл": "07", "авг": "08", "сен": "09", "окт": "10", "ноя": "11", "дек": "12"
    };
    
    for (var key in months) {
        if (m.indexOf(key) !== -1) return months[key];
    }
    return "05";
}

function planTripData(parseTree) {
    var token = "da7bee055610d9dc36ddd9b5fb42fa9a";
    var rawCity = parseTree.city[0].text;
    
    // Извлекаем бюджет
    var totalBudget = parseBudget(parseTree);
    var flightLimit = Math.floor(totalBudget * 0.3);
    
    // РАБОТА С ДАТОЙ
    var day = (parseTree.dayFrom && parseTree.dayFrom[0]) ? parseTree.dayFrom[0].text : "01";
    if (day.length === 1) day = "0" + day;
    
    var monthText = (parseTree.month && parseTree.month[0]) ? parseTree.month[0].text : "мая";
    var monthNum = getMonthNumber(monthText);
    
    // Собираем дату для API (YYYY-MM-DD)
    var departureDate = "2026-" + monthNum + "-" + day;
    
    var destIATA = getIataCode(rawCity);

    var payload = {
        destination: rawCity,
        departureDate: departureDate, // Передаем на фронт для красоты
        totalBudget: totalBudget,
        flightLimit: flightLimit,
        flights: [],
        hotels: []
    };

    // Запрос к Aviasales с конкретной датой
    var flightUrl = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates" +
                    "?origin=MOW" +
                    "&destination=" + destIATA +
                    "&departure_at=" + departureDate + 
                    "&token=" + token + 
                    "&currency=rub&limit=15";
    
    log("DEBUG URL: " + flightUrl);
    
    var flightRes = $http.get(flightUrl);
    if (!flightRes.isOk || !flightRes.data.data || flightRes.data.data.length < 1) {
        log("DEBUG: Мало билетов на дату, запрашиваю весь месяц...");
        
        // Убираем день, оставляем только YYYY-MM
        var monthUrl = flightUrl.replace(/departure_at=\d{4}-\d{2}-\d{2}/, "departure_at=" + departureDate.slice(0, 7));
        flightRes = $http.get(monthUrl);
    }
    if (flightRes.isOk && flightRes.data.data) {
        payload.flights = flightRes.data.data.filter(function(f) {
            return f.price <= flightLimit;
        }).slice(0, 5);
    }

    // Качественный справочник популярных отелей
    var hotelDatabase = {
        "Москва": { 
            name: "Metropol Hotel Moscow", 
            priceMod: 1.2, 
            stars: 5, 
            link: "https://metropol-moscow.ru/", 
            id: 101 
        },
        "Санкт-Петербург": { 
            name: "Гранд Отель Европа", 
            priceMod: 1.1, 
            stars: 5, 
            link: "https://www.belmond.com/hotels/europe/russia/st-petersburg/belmond-grand-hotel-europe/", 
            id: 102 
        },
        "Питер": { 
            name: "Астория Рокко Форте", 
            priceMod: 1.1, 
            stars: 5, 
            link: "https://www.roccofortehotels.com/hotels-and-resorts/hotel-astoria/", 
            id: 103 
        },
        "Сочи": { 
            name: "Отель Камелия Сочи", 
            priceMod: 1.3, 
            stars: 5, 
            link: "https://kamelia-sochi.ru/", 
            id: 104
        },
        "Адлер": { 
            name: "Radisson Collection Paradise", 
            priceMod: 1.2, 
            stars: 5, 
            link: "https://www.radissonhotels.com/ru-ru/hotels/radisson-collection-sochi-paradise-resort-spa", 
            id: 105 
        },
        "Казань": { 
            name: "Отель Ривьера", 
            priceMod: 0.9, 
            stars: 4, 
            link: "https://kazanriviera.ru/hotel/", 
            id: 106 
        },
        "Новосибирск": { 
            name: "Marriott Novosibirsk", 
            priceMod: 0.8, 
            stars: 5, 
            link: "https://www.marriott.com/hotels/travel/ovbnm-novosibirsk-marriott-hotel/", 
            id: 107 
        }
    };

    // 4. ОТЕЛИ (Качественный мок на основе города)
    var hotelData = hotelDatabase[rawCity] || { 
        name: "Azimut Hotel " + rawCity, 
        priceMod: 0.7, 
        stars: 3, 
        link: "https://azimuthotels.com/", 
        id: 999 
    };

    // Вычисляем цену, исходя из остатка бюджета, но с учетом "престижности" отеля (priceMod)
    var hotelBudget = totalBudget - (payload.flights[0] ? payload.flights[0].price : flightLimit);
    var pricePerNight = Math.floor((hotelBudget / 3) * hotelData.priceMod);

    payload.hotels = [{
        name: hotelData.name,
        price: pricePerNight,
        stars: hotelData.stars,
        link: hotelData.link,
        id: hotelData.id
    }];

    return payload;
}