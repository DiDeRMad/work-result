// Импортируем axios для HTTP-запросов и типы/схему профиля
import axios from 'axios';
import { ProfileSchema, Profile } from './types';
 
// Асинхронная функция для получения профиля пользователя по UUID
// Выполняет GET-запрос к API, затем валидирует ответ через Zod-схему
export async function fetchProfile(uuid: string): Promise<Profile> {
  const { data } = await axios.get(`https://igroom.ru/api/v2/profile/${uuid}`);
  return ProfileSchema.parse(data); // Валидация и приведение к типу Profile
} 