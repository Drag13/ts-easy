# Как использовать TypeScript с минимумом усилий

Когда пишешь статью, в голове возникают самые разные сценарии о том, как она будет воспринята. Не знаю как у других авторов, но у меня такое происходит всегда, и чем ближе статья к завершению, тем сценарий обычно мрачнее.

Поэтому публикуя [прошлую статью о TS](https://dou.ua/forums/topic/35796/) я предполагал, что она может быть воспринята "не очень". Но все мои предположения крутились вокруг тривиальности примеров. Услышать что TS не нужен в 2021, я просто не ожидал. Ну вот не укладывается в моей голове это. И тут я увидел один очень интересный комментарий:

> Увы в TS очень сильно перегнули палку с диктатурой, а более мягкого инструмента посередине между jsdoc и TS по сути нет, если d.ts не считать. Мягких опциональных аннотаций типов было бы достаточно- тот же jsdoc, но в инлайн семантике.

А потом еще один:

> Фанаты TS часто забывают, что в большинстве баги типизации, что ловит ts, быстро находятся и без него. А меташума в коде добавляется много)

(На самом деле полезных комментариев было больше, я просто взял те которые сработали первыми)

И понял что похоже я таки перегнул палку. А почему? Да потому что оба комментария прекрасно демонстрируют что за деревьями не видно леса, а за типами не видно пользы. Поэтому я решил это исправить. В этой статье я покажу как можно использовать TypeScript без страданий и, одновремнно, с пользой.

## Сначала все было хорошо

Идея у меня простая. Давайте возьмем какой-то валидный код на JS и попробуем переписать его на TS. Задача - получить максимум пользы за минимум усилий. А вы оцените что получилось в комментариях. Только давайте сразу договоримся - когда будете оценивать, исходите из того, что над кодом работает хотя бы 3 человека и это не одноразовый скрипт, его нужно потом поддерживать.

Для примера я подготовил следующую функцию которую и буду улучшать:

```javascript
async function fetchApi(url, options, mapper) {
  options = options ?? {};

  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  if (!options.headeres) {
    options.headers = {};
  }

  if (!options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, options).then((x) => x.json());
  return typeof mapper === "function" ? mapper(response) : response;
}

```

Тут все достаточно тривиально - это просто обертка над стандартным fetch которая упрощает с ним работу - заголовки по умолчанию, сериализация, дессериализация, маппинг. Сама задача не принципиальна, я хочу показать сам подход.

Теперь давайте посмотрим, какую пользу нам может принести TS и как сложно это будет.

## Talk is cheap

Итак, у нас есть код, он рабочий, будем его переписывать под TS. С целью уменьшения ентропии я опускаю раздел о том, как поднять тестовый проект, но если нужно - вот ссылочка на рабочую репу.

Первым делом, переименовываем .js в .ts и пробуем его выполнить (для таких эксперементов я обычно использую `ts-node`, очень удобно выполнять скрипты без необходимости использовать Babel или что-то еще).

И тут TS показывает всю свою "токсичность" - компилятор выдает ошибку `Parameter 'url' implicitly has an 'any' type` и рабочий код не выполняется. Конечно можно сразу плюнуть, а можно посмотреть в документацию и добавить в `tsconfig.json` флаг `"noImplicitAny": false`\*.

Запускаем проект заново и теперь работает. Т.е. мы взяли валидный JS и не меняя ни единой строки кода, не добавляя никаких типов, смогли его выполнить ts-ом\*\*.

Теперь можно заняться его улучшением.

\* `"noImplicitAny": false` считается не очень хорошей практикой, так как вы больше не видите где TS потерял типы. Явное `any` лучше `"noImplicitAny": false` но эти рассуждения выходят за рамки статьи.

\*\* Для запуска более сложного кода одного флага `"noImplicitAny": false` скорее всего не хватит. Поэтому здесь я оставляю ссылку на [документацию](https://www.typescriptlang.org/tsconfig)

## Типизируем result

Начнем с удобства. Если сейчас в редакторе написать `result.` то VsCode ничего нам не подскажет и это не очень удобно, надо лезть в маппер и смотреть что он возвращает. Давайте это исправим:

Сначала мы делаем метод fetchApi параметризируем, добавляя `<T>`:

```ts
// Делаем fetchApi обобщенным, добавляя конструкцию <T>
// Указываем тип возвращаемого значения
async function fetchApi<T>(url, options, mapper): Promise<T>

// При вызове метода указываем ожидаемый тип
const result = await fetchApi<{ fullName: string }>
```

Все, этого уже достаточно для VsCode для того что бы включился IntelliSense:

Было:

![](https://raw.githubusercontent.com/Drag13/ts-easy/master/src/2fetch/without.PNG)

Стало:

![](https://raw.githubusercontent.com/Drag13/ts-easy/master/src/2fetch/with.PNG)

Кроме этого, если мы забудем сделать await, TS подскажет что нам вернется Promise, а не ожидаемый объект:

![](https://raw.githubusercontent.com/Drag13/ts-easy/master/src/2fetch/no-await.PNG)

## Вокруг сплошной самообман

IntelliSense это конечно хорошо, но сейчас наш маппер может возвращать что угодно, хоть строку. И мы получим ситуацию даже хуже чем она была до этого, потому что IntelliSense будет утверждать одно, а фактически там окажется что угодно. Придется это контролировать самому, а потом еще и ревьюверу, что совсем не хорошо.

Что бы это исправть, давайте просто свяжем тип который возвращает маппер и тип который мы ожидаем от метода fetch:

```ts
async function fetchApi<T>(url, options, mapper: (data: any) => T): Promise<T>;
```

Все, больше менять ничего не надо, этого уже достаточно\*. Теперь, если вы ошибетесь и вернете из маппера не то, что указали при вызове fetchApi, TS об этом предупредит:

`Property 'fullName' is missing in type '{ fulName: string; }' but required in type '{ fullName: string; }'`

\* На самом деле есть более красивое решение которое позволяет вообще не указывать тип при вызове `fetch`. Достаточно указать TS что бы он использовал тип, который возвращает маппер. Но это требует некоторой манипуляции с типами, а мы договаривались не усложнять. Но кому интересно - вот ссылка на код.

## И снова у матрицы сбой

Теперь посмотрим на сигнатуру функции `fetchApi`. Вы помните структуру options? Я - только частично. Хотелось бы что бы TS нам и тут помогал, но описывать весь тип вручную явно противоречит идеи простого использования TypeScript. К счастью, мы можем просто переиспользовать уже существующие типы:

```ts
async function fetchApi<T>(url, options: RequestInit, mapper: (data: any) => T): Promise<T>;
```

Однак теперь возникла проблема, даже две. Во-первых, как выяснилось, я опечатался (интересно заметил ли это кто-то) в проверке ` if (!options.headeres)`. В результате этой опечатки, все заголовки переписывались всегда, независимо от того передавали ли мы их или нет. Во-вторых, в типе `RequestInit` body это строка, а мы хотим передавать объект.

Первая проблема правится легко, достаточно исправить опечатку. А вот решений второй проблемы несколько. Самое очевидное - во время вызова `fetchApi` прикастить body к any: `body: { id: 5 } as any`. Это сработает, но так придется писать каждый раз при вызове `fetch`. Т.е. в перспективе это как раз сложный вариант. Второй вариант это заменить тип `RequestInit` на свой самописный тип. Это может быть полезно, если вы хотите ограничить параметры, которые можно использовать во время запроса (например запретить передавать заголовки или ограничить доступные глаголы). Но писать свой тип - противоречит изначальным условиями статьи. К счастью есть золотая середина - мы можем модфицировать\* чужой тип:

```ts
// Создаем новый интерфейс который наследуется от RequestInit
interface IAppRequestInit extends RequestInit, "body"> {
  // Переопределяем тип body в any**
  body: any;
}
async function fetchApi<T>(url, options: IAppRequestInit, mapper: (data: any) => T): Promise<T> {
```

К тому же мы можем убрать строку с инициализацией `options` так как теперь TS будет самостоятельно\*\*\* следить за тем, что бы туда был передан аргумент.

Вот и все, теперь все снова в порядке.

\* С помощью `.d.ts` файлов доступна глобальная модификация типа без создания промежуточного звена. Так, например, поступет Vuex что бы типизовать стор.
\*\* `body:any` не лучший выбор, так как закрывает нам дорогу к типизированному пейлоаду. Лучше использовать обобщенный интерфейс, пример [тут]().
\*\*\* Задача валидации сущностей приходящих из-вне системы все равно остается на разработчике. Это нужно понимать. Впрочем, TypeScript не имеет к этому никакого отношения.

## Ленивое API

Еще один интересный момент это урл, который мы используем что бы вызвать API. С одной стороны мы все сделали красиво - вынесли все эндпоинты в константы. С другой стороны, новому человеку это все придется рассказывать, и в PR-е проверять. Но зачем тратить свои силы, если можно возложить эту задачу на TypeScript? Тем более что решается это тривиально, достаточно заменить на объект на перечисление (enum)

```ts
// Заменяем объект на enum
enum API {
  USER = `http://localhost:4000/user`,
}
// Указываем тип для URL
async function fetchApi<T>(url: API, options: IAppRequestInit, mapper: (data: any) => T): Promise<T>;
```

Теперь эндпоинт это не произвольная строка, а элемент перечисления:


![](https://raw.githubusercontent.com/Drag13/ts-easy/master/src/5enum/Enum.PNG)

## В заключении

В заключении я просто покажу ролик о том, как выглядит вызов fetchApi после всех манипуляций (на запись этого ролика у меня ушло больше времени чем на описание типов):


![demo](https://raw.githubusercontent.com/Drag13/ts-easy/master/demo.gif)

На этом у меня все. Конечно, можно пойти и дальше, например поработать с самим маппером или дать возможность типизировать рабочу нагрузку. Но это уже не принципиально, важен сам подход поэтапного улучшения когда. Когда мы не гонимся за типами как таковыми, а применяем их точечно, четко понимая что зачем нам это нужно. Большой плюс TypeScript в том, что он не следует принципу "все или ничего", а может быть использован именно таким способом, что бы получить максимальную пользу за минимум усилий.

Спасибо за ваше внимание, надеюсь, что статья получилась полезной и мне удалось показать, что TS это не только меташум в коде, но и удобство.