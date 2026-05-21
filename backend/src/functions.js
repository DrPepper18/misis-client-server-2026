function getIataCode(cityName) {
    var cityToIATA = {
        "Москва": "MOW",
        "Санкт-Петербург": "LED",
        "Питер": "LED",
        "Сочи": "AER",
        "Адлер": "AER",
        "Казань": "KZN",
        "Екатеринбург": "SVX",
        "Владивосток": "VVO",
        "Ростов-на-Дону": "RVI",
        "Калининград": "KGD",
        "Новосибирск": "OVB"
    };
    return cityToIATA[cityName] || (cityName ? cityName.substring(0, 3).toUpperCase() : "LED");
}

function fetchTripResults(cityName, departureDate, totalBudget) {
    var token = "HERE IS YOUR TOKEN"; // Токен для доступа к API Aviasales
    var destIATA = getIataCode(cityName);
    var flightLimit = Math.floor(totalBudget * 0.3);

    var payload = {
        destination: cityName,
        departureDate: departureDate,
        totalBudget: totalBudget,
        flightLimit: flightLimit,
        flights: [],
        hotels: []
    };

    // Запрос к Aviasales
    var flightUrl = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates" +
                    "?origin=MOW" +
                    "&destination=" + destIATA +
                    "&departure_at=" + departureDate + 
                    "&token=" + token + 
                    "&currency=rub&limit=15";

    var flightRes = $http.get(flightUrl);
    
    // Проверка на пустые результаты и повторный запрос по месяцу
    if (!flightRes.isOk || !flightRes.data.data || flightRes.data.data.length < 1) {
        var monthUrl = flightUrl.replace(/departure_at=\d{4}-\d{2}-\d{2}/, "departure_at=" + departureDate.slice(0, 7));
        flightRes = $http.get(monthUrl);
    }

    if (flightRes.isOk && flightRes.data.data) {
        payload.flights = flightRes.data.data.filter(function(f) {
            return f.price <= flightLimit;
        }).slice(0, 5);
    }

    // Твой справочник отелей (оставим его внутри или вынесем в константу выше)
    var hotelDatabase = {
        "Москва": { 
            name: "Raddison Blu", 
            priceMod: 1.2, stars: 5, id: 101,
            link: "https://ostrovok.ru/hotel/russia/moscow/" 
        },
        "Санкт-Петербург": { 
            name: "Отель Radisson Соня Санкт-Петербург", 
            priceMod: 1.1, stars: 4, id: 102,
            link: "https://ostrovok.ru/hotel/russia/st._petersburg/" 
        },
        "Питер": { 
            name: "Отель Radisson Соня Санкт-Петербург", 
            priceMod: 1.1, stars: 5, id: 103,
            link: "https://ostrovok.ru/hotel/russia/st._petersburg/" 
        },
        "Сочи": { 
            name: "Гостевой дом Бутик-Отель Мондриан", 
            priceMod: 1.3, stars: 5, id: 104,
            link: "https://ostrovok.ru/hotel/russia/sochi/" 
        },
        "Адлер": { 
            name: "Отель Охотник", 
            priceMod: 1.2, stars: 5, id: 105,
            link: "https://ostrovok.ru/hotel/russia/adler/" 
        },
        "Казань": { 
            name: "Отель Муниб", 
            priceMod: 1.0, stars: 4, id: 106,
            link: "https://ostrovok.ru/hotel/russia/kazan/" 
        },
        "Екатеринбург": { 
            name: "Отель Marins Екатеринбург", 
            priceMod: 0.9, stars: 3, id: 109,
            link: "https://ostrovok.ru/hotel/russia/yekaterinburg/" 
        },
        "Владивосток": { 
            name: "Lotte Hotel Vladivostok", 
            priceMod: 1.1, stars: 5, id: 110,
            link: "https://ostrovok.ru/hotel/russia/vladivostok/" 
        },
        "Ростов-на-Дону": { 
            name: "Гостиница Radisson Blu, Ростов-на-Дону", 
            priceMod: 0.8, stars: 4, id: 111,
            link: "https://ostrovok.ru/hotel/russia/rostov-on-don/" 
        },
        "Калининград": { 
            name: "Отель Холидей Инн Калининград", 
            priceMod: 1.0, stars: 4, id: 108,
            link: "https://ostrovok.ru/hotel/russia/kaliningrad/" 
        },
        "Новосибирск": { 
            name: "Отель Marins Новосибирск", 
            priceMod: 0.8, stars: 4, id: 107,
            link: "https://ostrovok.ru/hotel/russia/novosibirsk/" 
        }
    };

    var hotelData = hotelDatabase[cityName] || { 
        name: "Отель в " + cityName, 
        priceMod: 0.7, stars: 3, link: "https://ostrovok.ru/hotel/russia/" + cityName, id: 999 
    };

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

// Вспомогательная функция для отправки экшена в Canvas
function sendActionToApp(actionName, payload, context) {
    context.response.replies = context.response.replies || [];
    context.response.replies.push({
        type: "raw",
        body: {
            items: [{
                command: {
                    type: "smart_app_data",
                    smart_app_data: {
                        type: actionName,
                        payload: payload
                    }
                }
            }]
        }
    });
}