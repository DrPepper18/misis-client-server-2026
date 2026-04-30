# Клиент-серверное приложение для планирования поездок

Это клиент-серверное приложение для планирования поездок, которое позволяет пользователям искать авиабилеты и отели с использованием API TravelPayouts. Приложение также интегрировано с голосовым ассистентом Салют для удобного голосового взаимодействия.

## Структура проекта

- **frontend/**: React-приложение с пользовательским интерфейсом для планирования поездок.
- **backend/**: Серверная часть (пока не реализована, файлы подготовлены для интеграции с SaluteJS).

## Технологии

- **Frontend**: React, SaluteJS Client
- **API**: TravelPayouts API для поиска авиабилетов
- **Backend**: Node.js (планируется)

## Установка и запуск

### Frontend

1. Перейдите в папку `frontend`:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` на основе `.env.sample` и укажите необходимые токены:
   - `REACT_APP_TRAVELPAYOUTS_TOKEN`: Токен для API TravelPayouts
   - `REACT_APP_SMARTAPP`: Название смартапа для SaluteJS
   - `REACT_APP_TOKEN`: Токен для SaluteJS

4. Запустите приложение:
   ```bash
   npm start
   ```

Приложение будет доступно по адресу `http://localhost:3000`.

### Backend

Backend пока не реализован. Файлы в папке `backend/` подготовлены для будущей интеграции с SaluteJS сценариями.

## Использование

- Введите параметры поиска (город отправления, назначения, дата).
- Приложение найдет доступные авиабилеты через TravelPayouts API.
- Используйте голосового ассистента Салют для голосового управления приложением.

## Конфигурация

Для работы с SaluteJS необходимо настроить проект в SmartApp Studio и получить токены, как описано в оригинальной документации для salute-demo-app.

## Лицензия

[Укажите лицензию, если применимо]

# Документация

## Официальная документация

### Описание Assistant Client

Описание Assistant Client приведено в репозитории https://github.com/salute-developers/salutejs-client

*Обратите внимание: старая страница проекта https://github.com/sberdevices/assistant-client не обновляется.*

*То же с именем модуля NPM: @sberdevices/assistant-client -> '@salutejs/client.*

## Документация developers.sber.ru

- Разработка графического интерфейса: Canvas App -- Создание приложений на JavaScript -- https://developers.sber.ru/docs/ru/va/canvas/title-page
- Разработка голосовой части: Code --  среда разработки на языках JavaScript и SmartApp DSL -- https://developers.sber.ru/docs/ru/va/code/overview

## Поддержка

Чат в телеграмме: https://t.me/smartmarket_community

Заявку можно оставить в чате на сайте developers.sber.ru

## Сторонние статьи

Несколько статей на Хабре (разных лет; как минимум, изменилось название модуля):

- https://habr.com/ru/articles/599493/ (2022 г.)
- https://habr.com/ru/articles/541522/ (2021 г.)

# Устранение проблем

### Не работает озвучка и/или микрофон в браузере

Нужно перейти в [настройки сайта](https://support.google.com/chrome/answer/114662) и разрешить доступ к звуку и микрофону.

Значение параметра Sound по умолчанию; "Automaticv (default)", не позволяет браузеру проигрывать звуки до того, как пользователь совершит какое-то действие. Если вам нужно услышать начальное приветствие сразу после загрузки страницы, это значение неужно изменить на "Allow".

### Проблема

Большое количество сообщений `Failed to parse source map`:

```log
Module Warning (from ./node_modules/source-map-loader/dist/cjs.js):
Failed to parse source map from '(...)\salut-app\node_modules\@salutejs\plasma-typo\src\tokens.ts' file:
Error: ENOENT: no such file or directory, open '(...)\salut-app\node_modules\@salutejs\plasma-typo\src\tokens.ts'
```

### Решение

Это - предупреждающие сообщения и не являются признаком ошибки.
При необходимости их отключить (не рекомендуется), можно добавить в файл `.env` следующую строку:

```dotenv
GENERATE_SOURCEMAP=false
```

Внимание! При внесении изменений в файл `.env` приложение необходимо перезапустить.

## The term 'yarn' is not recognized

### Проблема

Если вы работаете в Windows, и после установки `yarn`, при попытке его запустить, вы получаете сообщение `The term 'yarn' is not recognized`:

```log
yarn : The term 'yarn' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

### Решение

В Windows настоящее время по умолчанию используется командная строка PowerShell. В некоторых случаях PowerShell не может найти команду `yarn` после установки. Наиболее простой способ решить эту проблему - запустить более старый командный процессор Cmd. В нём, как правило, всё работает.
В случае, если это не решает проблему, можно использовать оригинальный менеджер пакетов `npm`.

## "Conflicting peer dependency: typescript" при выполнении команды `npm install`

### Проблема

При выполнении команды для установки пакетов

```
npm install
```

Выводится следующая ошибка:
```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: react-scripts@5.0.1
npm error Found: typescript@5.4.5
npm error node_modules/typescript
npm error   typescript@"=5.4.5" from the root project
npm error
npm error peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1
npm error node_modules/react-scripts
npm error   react-scripts@"5.0.1" from the root project
npm error
npm error Conflicting peer dependency: typescript@4.9.5
npm error node_modules/typescript
npm error   peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1
npm error   node_modules/react-scripts
npm error     react-scripts@"5.0.1" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error C:\Users\alykoshin\AppData\Local\npm-cache\_logs\2025-03-29T19_07_40_891Z-eresolve-report.txt
npm error A complete log of this run can be found in: C:\Users\alykoshin\AppData\Local\npm-cache\_logs\2025-03-29T19_07_40_891Z-debug-0.log
PS D:\teach\11. webdev - все материалы\05. МИСиС. 1.02. Разр.кл.-серв.прил. - 2025\Проекты для консультаций\todo-canvas-app> npm i --force
```
### Решение

Запустить `npm i` с ключом `--force`
```
npm i --force
```

Или использовать команду `yarn`, если она была установлена.

```
yarn
```

### Проблема

Сайт открылся, но ничего не работает, начального приветствия не слышно.

При открытии консоли через F12 или ПКМ -> Inspect видны ошибки вебсокетов:
![/doc/certificate_error3.png](/doc/certificate_error3.png)

### Решение

Откройте в новом окне указанный url (в данном случае `wss://nlp2.devices.sberbank.ru/vps/`), но замените `wss://` на `https://` (в данном случае получится `https://nlp2.devices.sberbank.ru/vps/`). На открывшемся сайте примите недействительные сертификаты.
![/doc/certificate_error1.png](/doc/certificate_error.png) ![/doc/certificate_error2.png](/doc/certificate_error2.png)

Перезагрузите страницу приложения.
