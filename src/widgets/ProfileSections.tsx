import React from 'react';

export const ProfileSections: React.FC = () => (
  <section
    style={{
      width: 390,
      maxWidth: 390,
      minHeight: '2444.36px',
      background: '#EEEEEE',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 80,
      boxSizing: 'border-box',
      margin: '0 auto',
      padding: 0,
    }}
  >
    {/* Блок с описанием пользователя и телеграмом */}
    <div style={{ marginTop: 0, marginBottom: 24, width: '100%', maxWidth: 370, background: '#fff', borderRadius: 25, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 17, color: '#000', fontWeight: 400, textAlign: 'justify', lineHeight: '22px' }}>
        Я профессиональный скуф, обажаю сидеть дома и часто играю в Мафию с друзьями по вечера в Сицилии и зовем всех желающ и разные другие дела...
      </div>
      {/* Разделительная линия */}
      {/* Тонкая линия между описанием и контактами */}
      <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '24px auto 0 auto' }} />
      {/* Стрелка */}
      {/* Иконка-стрелка для визуального разделения блока */}
      <img src="/avatars/arrow.png" alt="arrow" width={10} style={{ display: 'block', margin: '-41px 0 0 auto', transform: 'scaleX(-1) rotate(0deg)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
        <span style={{ fontSize: 17, color: '#000', fontWeight: 400 }}>Мой телеграм</span>
        <span style={{ fontSize: 17, color: '#000', fontWeight: 600 }}>@ribakit3</span>
      </div>
    </div>
    {/* Меню */}
    {/* Меню с основными разделами профиля (кнопки для перехода) */}
    <div style={{ marginTop: 24, width: '100%', maxWidth: 370, background: '#fff', borderRadius: 25, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 0, marginLeft: 'auto', marginRight: 'auto' }}>
      {['Возможности ИГРУМА','Правила ИГРУМА','Инструкция РУМЕРА','Инструкция МАСТЕРА','Инструкция МЕСТА','Пользовательское соглашение'].map((text, idx, arr) => (
        <React.Fragment key={idx}>
          {idx !== 0 && (
            <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '0 auto' }} />
          )}
          <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#A7A7A7', display: 'inline-block', marginRight: 16 }} />
            {text}
          </button>
        </React.Fragment>
      ))}
    </div>
    {/* Выйти из профиля */}
    {/* Кнопка выхода из профиля пользователя */}
    <div style={{ marginTop: 24, width: '100%', maxWidth: 370 }}>
      <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
        <img src="/avatars/_Слой_1-2.png" alt="Выйти" width={23} height={28} style={{ display: 'inline-block' }} />
        <span style={{
          fontFamily: 'SF Pro, sans-serif',
          fontWeight: 400,
          fontSize: 20,
          lineHeight: '25px',
          letterSpacing: '-0.45px',
          color: '#000',
          background: '#fff',
        }}>
          Выйти из профиля
        </span>
      </button>
    </div>
  </section>
); 