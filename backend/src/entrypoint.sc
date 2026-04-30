require: functions.js
require: main.js

patterns:
    $AnyText = $nonEmptyGarbage
    $Number = $regex<\d+>

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти|открой) [приложение] тур*
        a: Привет! Я помогу подобрать билеты и отели. Куда и когда летим?
    
    state: Help
        q!: $regex</help>
        q!: (помоги|помощь|документация)
        a: Доступные города: Москва, Санкт-Петербург, Сочи, Адлер, Казань, Екатеринбург, Владивосток, Ростов-на-Дону, Калининград, Новосибирск. Выбирайте, что вам по душе!

    state: PlanTrip
        q!: * (тур|поездк*|билет*) [в|во] $AnyText::city $Number::dayFrom [-|до] $Number::dayTo $AnyText::month [за|бюджет] $Number::totalBudget *
        
        script:
            # Вызываем функцию из JS файла
            var tripPayload = planTripData($parseTree);
            
            if (tripPayload.flights.length > 0) {
                $temp.success = true;
                sendActionToApp("show_flights", tripPayload, $context);
            } else {
                $temp.success = false;
            }

        if: $temp.success
            a: Вот, что я нашёл для поездки в {{ $parseTree.city[0].text }}. Выбирайте!
        else:
            a: К сожалению, под ваш бюджет ничего не нашлось. Попробуйте поменять сумму или даты.

    state: Fallback
        event!: noMatch
        a: Я не совсем понял. Скажите, например: "Хочу тур в Питер 10-15 июня за 50000 рублей".