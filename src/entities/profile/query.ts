// Импортируем useQuery из React Query и функцию для получения профиля
import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from './api';

// Кастомный хук для получения данных профиля пользователя по UUID
// Использует React Query для кэширования и управления состоянием загрузки/ошибок
export function useProfile(uuid: string) {
  return useQuery({
    queryKey: ['profile', uuid], // Уникальный ключ для кэширования запроса
    queryFn: () => fetchProfile(uuid), // Функция запроса профиля
  });
} 