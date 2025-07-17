import React from 'react';
import { ProfilePageContent } from './ProfilePageContent';
import { fetchProfile } from '@/entities/profile/api';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

const PROFILE_UUID = '5e800be0-088e-41cb-b549-10ebf4a13591';

// Генерация SEO-метаданных для страницы профиля (SSR)
export async function generateMetadata() {
  // SSR-загрузка профиля для SEO/OG
  try {
    const profile = await fetchProfile(PROFILE_UUID);
    return {
      title: profile.name + ' | Профиль',
      description: profile.about || 'Профиль пользователя',
    };
  } catch {
    return { title: 'Профиль', description: 'Профиль пользователя' };
  }
}

// Основная страница профиля с SSR и гидратацией React Query
export default async function ProfilePage() {
  // Создаём клиент для React Query
  const queryClient = new QueryClient();
  // Предзагружаем данные профиля на сервере (SSR)
  await queryClient.prefetchQuery({
    queryKey: ['profile', PROFILE_UUID],
    queryFn: () => fetchProfile(PROFILE_UUID),
  });
  // Сохраняем состояние для передачи на клиент (гидратация)
  const dehydratedState = dehydrate(queryClient);

  return (
    // HydrationBoundary позволяет передать состояние React Query на клиент
    <HydrationBoundary state={dehydratedState}>
      <ProfilePageContent />
    </HydrationBoundary>
  );
} 