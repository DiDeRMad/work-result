import { http } from 'msw';
// Если нужны типы, можно попробовать:
// import type { RestRequest, ResponseComposition, RestContext } from 'msw/lib/glossary';

export const handlers = [
  // Обработчик для корневого пути
  http.get('/', () => {
    return Response.json({
      message: "Root endpoint"
    });
  }),
  
  http.get(
    'https://igroom.ru/api/v2/profile/5e800be0-088e-41cb-b549-10ebf4a13591',
    () => {
      return Response.json({
        name: "Ваня Петькин",
        nickname: "nickname",
        avatar: "/avatars/cat.png",
        city: "Краснодар",
        stats: {
          monthsInGame: 1,
          meetings: 15,
          roomers: 350
        },
        about: "Я профессиональный скуф, обожаю сидеть дома и часто играю в Мафию с друзьями по вечерам в Сицилии и зову всех желающих и разные другие дела...",
        telegram: "@ribakit3"
      });
    }
  ),
]; 