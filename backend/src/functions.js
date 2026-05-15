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
    var token = "..."; // Твой токен от Aviasales
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
            name: "Метрополь", 
            priceMod: 1.2, stars: 5, id: 101,
            link: "https://metropol-moscow.ru/" 
        },
        "Санкт-Петербург": { 
            name: "Гранд Отель Европа", 
            priceMod: 1.1, stars: 5, id: 102,
            link: "https://www.grandhoteleuropa.com/" 
        },
        "Питер": { 
            name: "Отель Астория", 
            priceMod: 1.1, stars: 5, id: 103,
            link: "https://www.astoria-hotel.ru/" 
        },
        "Сочи": { 
            name: "Отель Камелия", 
            priceMod: 1.3, stars: 5, id: 104,
            link: "https://kamelia-sochi.ru/" 
        },
        "Адлер": { 
            name: "Radisson Collection Paradise", 
            priceMod: 1.2, stars: 5, id: 105,
            link: "https://www.radissonhotels.com/ru-ru/hotels/radisson-collection-sochi-paradise-resort-spa" 
        },
        "Казань": { 
            name: "Kazan Palace by TASIGO", 
            priceMod: 1.0, stars: 5, id: 106,
            link: "https://tasigo.com/ru/hotels/kazan-palace/" 
        },
        "Екатеринбург": { 
            name: "Hyatt Regency Ekaterinburg", 
            priceMod: 0.9, stars: 5, id: 109,
            link: "https://rg-ekaterinburghotel.ru/rooms/" 
        },
        "Владивосток": { 
            name: "Lotte Hotel Vladivostok", 
            priceMod: 1.1, stars: 5, id: 110,
            link: "https://www.lottehotel.com/vladivostok-hotel/" 
        },
        "Ростов-на-Дону": { 
            name: "Grand Rostov by Hyatt Regency", 
            priceMod: 0.8, stars: 5, id: 111,
            link: "https://grandrostovhotel.com/" 
        },
        "Калининград": { 
            name: "Crystal House Suite Hotel", 
            priceMod: 1.0, stars: 5, id: 108,
            link: "https://crystalhousehotel.ru/" 
        },
        "Новосибирск": { 
            name: "Grand Autograph Hotel", 
            priceMod: 0.8, stars: 5, id: 107,
            link: "https://grandautograph.ru/" 
        }
    };

    var hotelData = hotelDatabase[cityName] || { 
        name: "Azimut Hotel " + cityName, 
        priceMod: 0.7, stars: 3, link: "https://azimuthotels.com/", id: 999 
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