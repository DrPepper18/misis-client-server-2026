require: functions.js

patterns:
    $AnyText = $nonEmptyGarbage

theme: /
    state: Start
        q!: $regex</start>
        q!: * [хочу] (тур | туры | путешествие)
        q!: * (запусти | открой) [приложение] [для] (тур | туры | туров)
        q!: * (запусти | открой) misis client server
        a: Привет! Я помогу подобрать билеты и отели. Куда и когда летим или едем?

    state: Help
        q!: $regex</help>
        q!: (помоги|помощь|документация)
        a: Доступные города: Москва, Санкт-Петербург, Сочи, Адлер, Казань, Екатеринбург, Владивосток, Ростов-на-Дону, Калининград, Новосибирск. Выбирайте, что вам по душе!

    state: PlanTrip
        # Максимально гибкий паттерн с разделителями
        q!: * (тур|билет*) * [в|во] @City::city * @duckling.date::startDate * @duckling.amount-of-money::totalBudget *
        
        script:
            var city = $parseTree.city[0].value;
            city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            var totalBudget = $parseTree.totalBudget[0].value;
            var startDate = $parseTree.startDate[0].value.value.slice(0, 10);

            var tripPayload = fetchTripResults(city, startDate, totalBudget);
            
            if (tripPayload.flights.length > 0) {
                $temp.success = true;
                $temp.cityName = city;
                sendActionToApp("show_flights", tripPayload, $context);
            } else {
                $temp.success = false;
            }

        if: $temp.success
            a: Вот, что я нашёл под ваш запрос! Как вам?
        else:
            a: К сожалению, под ваш запрос ничего не нашлось.

    state: Fallback
        event!: noMatch
        a: Я не совсем понял запрос. Скажите, например: "Хочу тур в Питер 10 июня за 50000 рублей".
