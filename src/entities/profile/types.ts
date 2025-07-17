import { z } from 'zod';

// Zod-схема для валидации и типизации данных профиля пользователя
export const ProfileSchema = z.object({
  id: z.string(), // Уникальный идентификатор профиля
  nickname: z.string(), // Никнейм пользователя
  name: z.string(), // Имя пользователя
  avatar: z.string().nullable(), // Ссылка на аватар (может быть null)
  city: z.string().nullable(), // Город пользователя (может быть null)
  stats: z.object({
    monthsInGame: z.number(), // Сколько месяцев в игре
    meetings: z.number(),    // Количество встреч
    roomers: z.number(),     // Количество румеров
  }),
  about: z.string().nullable(),    // Описание "О себе" (может быть null)
  telegram: z.string().nullable(), // Телеграм пользователя (может быть null)
});

// Тип Profile автоматически выводится из схемы ProfileSchema
export type Profile = z.infer<typeof ProfileSchema>; 