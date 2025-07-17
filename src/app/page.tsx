import React from 'react';
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';
import { ProfileCard } from '@/widgets/ProfileCard';
import { ProfileSections } from '@/widgets/ProfileSections';
import { Profile } from '@/entities/profile/types';

const mockProfile: Profile = {
  id: '1',
  nickname: 'nickname',
  name: 'Ваня Петькин',
  avatar: '/avatars/cat.png', // Указываем путь к аватарке
  city: 'Краснодар',
  stats: {
    monthsInGame: 1,
    meetings: 15,
    roomers: 350,
  },
  about: 'Я профессиональный скуп, обожаю сидеть дома и часто играю в Мафию с друзьями по вечерам в Сицилии и зову всех желающих и разные другие дела...',
  telegram: 'ribakit3',
};

// Главная страница приложения с мок-данными профиля
export default function Home() {
  return (
    // Основной контейнер страницы, фиксированная ширина и pixel-perfect рамка
    <div style={{
      width: 390,
      minHeight: '100vh',
      margin: '0 auto',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 0 1px #222', // для pixel-perfect рамки
    }}>
      {/* Шапка приложения */}
      <Header />
      {/* Основная часть страницы с карточкой профиля и секциями */}
      <main style={{ flex: 1 }}>
        {/* Карточка с основной информацией пользователя */}
        <ProfileCard profile={mockProfile} />
        {/* Секции профиля: меню, контакты, выход */}
        <ProfileSections />
      </main>
      {/* Футер приложения */}
      <Footer />
    </div>
  );
}