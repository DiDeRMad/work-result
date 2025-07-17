"use client";
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';
import { useProfile } from '@/entities/profile/query';
import { ProfileCard } from '@/widgets/ProfileCard';
import { ProfileSections } from '@/widgets/ProfileSections';
import { Profile } from '@/entities/profile/types';

const PROFILE_UUID = '5e800be0-088e-41cb-b549-10ebf4a13591';

export function ProfilePageContent() {
  const { data, isLoading, error } = useProfile(PROFILE_UUID);
  
  // Моковые данные профиля для отображения, если нет ответа от API
  const mockProfile: Profile = {
    id: '1',
    nickname: 'nickname',
    name: 'Ваня Петькин',
    avatar: '/avatars/cat.png',
    city: 'Краснодар',
    stats: {
      monthsInGame: 1,
      meetings: 15,
      roomers: 350,
    },
    about: 'Я профессиональный скуп, обожаю сидеть дома и часто играю в Мафию с друзьями по вечерам в Сицилии и зову всех желающих и разные другие дела...',
    telegram: 'ribakit3',
  };

  return (
    <>
      {/* Фоновый слой для заливки всей страницы серым цветом */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: '#EEEEEE',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        zIndex: -1
      }} />
      {/* Основной контейнер профиля, центрированный и с фиксированной шириной */}
      <div style={{
        width: 390,
        minHeight: '100vh',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#EEEEEE',
      }}>
        {/* Шапка профиля */}
        <Header />
        {/* Основная часть страницы с карточкой профиля и секциями */}
        <main style={{
          flex: 1,
          background: '#EEEEEE',
          minHeight: '100vh',
        }}>
          {/* Карточка с основной информацией пользователя */}
          <ProfileCard profile={mockProfile} />
          {/* Секции профиля: меню, контакты, выход */}
          <ProfileSections />
        </main>
        {/* Футер страницы */}
        <Footer />
      </div>
    </>
  );
} 