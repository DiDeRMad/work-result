Профиль РУМЕР — Next.js тестовое задание

Стек
- Next.js (App Router, SSR)
- TypeScript
- Tailwind CSS
- React Query + Axios
- Redux Toolkit
- Zod (валидация)
- MSW (моки API)
- Docker + docker-compose
- Архитектура Feature-Sliced Design (FSD)

Структура проекта (FSD)
```
/src
  /app           — точки входа (pages, layout)
  /entities      — бизнес-сущности (Profile)
  /features      — отдельные фичи
  /widgets       — крупные виджеты (ProfileCard, Footer, Header, ProfileSections)
  /shared        — UI, типы, либы, провайдеры
  /processes     — бизнес-процессы (ProfilePage)
  /mock          — моки для API (MSW)
```

Быстрый старт через Docker
```bash
docker-compose up --build
```
Приложение будет доступно на [http://localhost:3000/profile](http://localhost:3000/profile)

Моки (MSW)
- Для стабильной работы без реального API используется [MSW](https://mswjs.io/).
- Моки автоматически стартуют в dev-режиме.
- Все запросы к https://igroom.ru/api/v2/profile/5e800be0-088e-41cb-b549-10ebf4a13591 возвращают заглушку из `src/mock/handlers.ts`.

Как работает SSR и загрузка профиля
- SSR через серверные компоненты Next.js (app router)
- React Query + Zod для типизации и валидации
- Моки MSW для разработки и тестов

Адаптив
- Верстка полностью адаптивна под мобильные устройства (Tailwind)

Дополнительно
- Для запуска без Docker: `npm install && npm run dev`
- Для продакшн-сборки: `npm run build && npm start`

---

Комментарии в коде
- Весь проект снабжён подробными осмысленными комментариями на русском языке.
- Каждый компонент, страница и бизнес-логика снабжены пояснениями к структуре, назначению блоков и ключевым решениям.
- Это позволяет быстро разобраться в архитектуре и логике приложения даже без глубокого погружения.

Советы по навигации по коду
- Все основные компоненты и страницы находятся в папке `src/` и структурированы по FSD.
- Для поиска нужного блока используйте имена файлов, совпадающие с названиями компонентов (например, `ProfileCard`, `ProfileSections`, `ProfilePageContent`).
- Вся логика работы с API и типизацией вынесена в `/entities/profile/`.

---

**Автор:** Дмитрий Бушин
