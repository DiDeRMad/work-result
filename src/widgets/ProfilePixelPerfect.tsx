import React from 'react';

// Pixel-perfect профиль по макету Figma/SVG
export const ProfilePixelPerfect: React.FC = () => (
  // Основной контейнер профиля, фиксированная ширина и серый фон
  <div style={{
    width: 390,
    background: '#EEEEEE',
    minHeight: '100vh',
    fontFamily: 'SF Pro, Arial, sans-serif',
    margin: '0 auto',
    position: 'relative',
    boxSizing: 'border-box',
    paddingBottom: 80
  }}>
    {/* Блок с аватаром пользователя и бейджиком */}
    <div style={{ 
      position: 'relative', 
      width: 180, 
      height: 180, 
      borderRadius: '50%', 
      background: '#FFE600', 
      margin: '32px auto 0', 
      overflow: 'visible', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      {/* Бейджик P — статус пользователя */}
      <div style={{ 
        position: 'absolute', 
        top: -8, 
        left: -8, 
        width: 40, 
        height: 40, 
        background: '#00D12D', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#000', 
        fontWeight: 700, 
        fontSize: 26, 
        zIndex: 999,
        lineHeight: 1,
        padding: 0,
        boxShadow: '0 0 0 3px #fff',
        border: '2px solid #fff'
      }}>
        P
      </div>
    </div>
    {/* Блок с именем, ником и статусом пользователя */}
    <div style={{ marginTop: 24, textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: 22, lineHeight: '28px', color: '#000' }}>румер: Иван Иванов</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 24px' }}>
        <span style={{ fontSize: 17, color: '#434343' }}>@ivanivanov</span>
        <span style={{ fontSize: 17, color: '#434343' }}>Вчера 18.00</span>
      </div>
    </div>
    {/* Блок со статистикой пользователя */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '0 24px', width: '100%' }}>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#434343' }}>3 месяц в игруме</div>
      <div style={{ width: 1, height: 32, background: '#434343', margin: '0 8px' }}></div>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#434343' }}>12 встреч</div>
      <div style={{ width: 1, height: 32, background: '#434343', margin: '0 8px' }}></div>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#434343' }}>7 румеров</div>
    </div>
    {/* Блок с городом и кнопкой редактирования профиля */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 370, margin: '24px auto 0', padding: '0 8px' }}>
      <div style={{ background: '#fff', borderRadius: 25, height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 22, color: '#434343', fontWeight: 400, width: 236 }}>Москва</div>
      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #A7A7A7', borderRadius: 25, height: 60, width: 122, marginLeft: 8, background: '#fff' }}>
        <span style={{ fontSize: 16, color: '#A7A7A7', fontWeight: 600 }}>РЕДАКТ</span>
      </button>
    </div>
    {/* Блок с ЗОВЫ/иду (статусы пользователя) */}
    <div style={{ width: 370, margin: '16px auto 0', position: 'relative', height: 120 }}>
      {/* Верхняя плашка — статус "ЗОВЫ" */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 370, height: 60, background: '#fff', borderRadius: '25px 25px 0 0', border: '1px solid #00CF00', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 27, top: 14, width: 13, height: 13, background: '#00CF00', borderRadius: '50%' }}></span>
        <span style={{ position: 'absolute', left: 58, top: 17, fontWeight: 600, fontSize: 20, lineHeight: '25px', letterSpacing: -0.45, color: '#434343' }}>ЗОВЫ</span>
        <span style={{ position: 'absolute', left: 277, top: 16, width: 28, height: 28, background: '#D0D0D0', borderRadius: '50%' }}></span>
        <span style={{ position: 'absolute', left: 283, top: 16, width: 15, height: 28, fontWeight: 700, fontSize: 22, lineHeight: '28px', letterSpacing: -0.26, color: '#434343', textAlign: 'center' }}>2</span>
        <svg style={{ position: 'absolute', left: 327, top: 22 }} width="31" height="18" viewBox="0 0 31 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L15.5 16L30 1" stroke="#A7A7A7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Разделительная линия между статусами */}
      <div style={{ position: 'absolute', left: 27, top: 60, width: 339, height: 0, borderTop: '1px solid rgba(0,0,0,0.2)' }}></div>
      {/* Нижняя плашка — статус "иду" */}
      <div style={{ position: 'absolute', left: 0, top: 60, width: 370, height: 60, background: '#fff', borderRadius: '0 0 25px 25px', border: '1px solid #FFA100', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 27, top: 74, width: 13, height: 13, background: '#FFA100', borderRadius: '50%' }}></span>
        <span style={{ position: 'absolute', left: 58, top: 77, fontWeight: 600, fontSize: 20, lineHeight: '25px', letterSpacing: -0.45, color: '#434343' }}>иду</span>
        <span style={{ position: 'absolute', left: 277, top: 76, width: 28, height: 28, background: '#D0D0D0', borderRadius: '50%' }}></span>
        <span style={{ position: 'absolute', left: 283, top: 76, width: 15, height: 28, fontWeight: 700, fontSize: 22, lineHeight: '28px', letterSpacing: -0.26, color: '#434343', textAlign: 'center' }}>3</span>
        <svg style={{ position: 'absolute', left: 327, top: 82 }} width="31" height="18" viewBox="0 0 31 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L15.5 16L30 1" stroke="#A7A7A7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
    {/* Кнопки для создания и просмотра игр */}
    <div style={{ marginTop: 24, width: 370, marginLeft: 'auto', marginRight: 'auto' }}>
      <button style={{ width: '100%', height: 60, background: '#9500FF', color: '#fff', fontSize: 22, fontWeight: 700, borderRadius: '25px 25px 0 0', border: 'none' }}>СОЗДАТЬ ИГРУМ</button>
      <button style={{ width: '100%', height: 60, background: '#fff', color: '#9500FF', fontSize: 22, fontWeight: 700, border: '4px solid #9500FF', borderRadius: '0 0 25px 25px', marginTop: -4 }}>МОИ ИГРУМЫ</button>
    </div>
    {/* Секции профиля: история встреч, публичный аккаунт, взрослый, о себе, меню, выход */}
    <div style={{ marginTop: 24, width: 370, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* История встреч пользователя */}
      <div style={{ marginTop: 24, width: '100%', background: '#fff', borderRadius: 25, height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <span style={{ fontSize: 20, color: '#000', fontWeight: 400, flex: 1 }}>ИСТОРИЯ ВСТРЕЧ</span>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A7A7A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
      </div>
      {/* Блок публичного аккаунта и взрослого статуса */}
      <div style={{ marginTop: 16, width: '100%', background: '#fff', borderRadius: 25, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 20, color: '#000', fontWeight: 400 }}>Публичный аккаунт</div>
        <div style={{ fontSize: 20, color: '#000', fontWeight: 400, marginTop: 8 }}>Взрослый</div>
      </div>
      {/* Блок с описанием пользователя и телеграмом */}
      <div style={{ marginTop: 16, width: '100%', background: '#fff', borderRadius: 25, padding: 24, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 17, color: '#000', fontWeight: 400, textAlign: 'justify', lineHeight: '22px' }}>Я профессиональный скуф, обожаю сидеть дома и часто играю в Мафию с друзьями по вечерам в Сицилии и зову всех желающих и разные другие дела...</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 17, color: '#000', fontWeight: 400 }}>Мой телеграм</span>
          <span style={{ fontSize: 17, color: '#000', fontWeight: 600 }}>@ribakit3</span>
        </div>
      </div>
      {/* Меню с основными разделами профиля */}
      <div style={{ marginTop: 16, width: '100%', background: '#fff', borderRadius: 25, padding: 8, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Возможности ИГРУМА</button>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Правила ИГРУМА</button>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Инструкция РУМЕРА</button>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Инструкция МАСТЕРА</button>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Инструкция МЕСТА</button>
        <button style={{ width: '100%', height: 60, fontSize: 20, color: '#000', fontWeight: 400, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: 25, background: 'none', border: 'none', textAlign: 'left' }}>Пользовательское соглашение</button>
      </div>
      {/* Кнопка выхода из профиля */}
      <div style={{ marginTop: 24, width: '100%' }}>
        <button style={{ width: '100%', height: 60, background: '#fff', fontSize: 20, color: '#000', borderRadius: 25, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', border: 'none' }}>Выйти из профиля</button>
      </div>
    </div>
    {/* Нижняя панель навигации (футер) с SVG-иконками */}
    <footer style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 50, background: '#E5E5E5', borderTop: '1px solid #D0D0D0', boxShadow: '0 -2px 12px 0 rgba(0,0,0,0.10)' }}>
      {/* SVG-иконки из макета Figma: Домик, Чат, Круг, Колокол, Профиль */}
      <svg width="36" height="37" viewBox="32 7 36 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M65.941 19.483L53.9972 9.41995C51.7403 7.5266 48.5601 7.5266 46.3033 9.41995L34.3595 19.483C32.8646 20.7353 32 22.6585 32 24.686V38.3122C32 41.9647 34.7698 44.9314 38.1991 44.9314H62.0867C65.516 44.9314 68.2858 41.9647 68.2858 38.3122V24.686C68.2858 22.6585 67.4211 20.7502 65.9263 19.483H65.941ZM50.1429 39.803C35.8836 33.78 36.8655 23.1803 42.1559 20.5713C47.5929 17.9027 50.1429 22.3901 50.1429 22.3901C50.1429 22.3901 52.7075 17.9027 58.1299 20.5713C63.4203 23.1803 64.4022 33.78 50.1429 39.803Z" fill="#00CF00"/>
      </svg>
      <svg width="40" height="34" viewBox="105 9 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M125.124 9.01491C114.543 9.01491 105.94 15.9025 105.94 24.3555C105.94 27.4862 107.142 30.5573 109.355 33.1067L104.299 40.4713C103.888 41.0528 103.903 41.8429 104.328 42.4094C104.636 42.8417 105.134 43.0654 105.632 43.0654C105.808 43.0654 105.984 43.0355 106.16 42.9759L118.441 38.7271C120.581 39.3532 122.823 39.6812 125.124 39.6812C135.704 39.6812 144.307 32.7936 144.307 24.3406C144.307 15.8876 135.704 9 125.124 9V9.01491ZM133.257 30.0952H117.181C116.287 30.0952 115.554 29.3498 115.554 28.4404C115.554 27.531 116.287 26.7856 117.181 26.7856H133.257C134.151 26.7856 134.884 27.531 134.884 28.4404C134.884 29.3498 134.151 30.0952 133.257 30.0952ZM133.257 21.9255H117.181C116.287 21.9255 115.554 21.18 115.554 20.2706C115.554 19.3612 116.287 18.6158 117.181 18.6158H133.257C134.151 18.6158 134.884 19.3612 134.884 20.2706C134.884 21.18 134.151 21.9255 133.257 21.9255Z" fill="#A7A7A7"/>
      </svg>
      <svg width="35" height="36" viewBox="179 9 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M196.469 8.99994C186.841 8.99994 179 16.9759 179 26.7706C179 36.5653 186.841 44.5412 196.469 44.5412C206.097 44.5412 213.938 36.5653 213.938 26.7706C213.938 16.9759 206.097 8.99994 196.469 8.99994ZM210.567 25.1158H206.244C206.039 20.8371 205.027 17.0504 203.474 14.2178C207.314 16.4541 210.039 20.4495 210.567 25.1158ZM194.828 12.8463V25.1158H189.947C190.284 18.9139 192.468 14.3371 194.828 12.8463ZM194.828 28.4254V40.6949C192.468 39.2041 190.284 34.6272 189.947 28.4254H194.828ZM198.096 40.6949V28.4254H202.976C202.639 34.6272 200.455 39.2041 198.096 40.6949ZM198.096 25.1158V12.8463C200.455 14.3371 202.639 18.9139 202.976 25.1158H198.096ZM189.449 14.2178C187.896 17.0504 186.885 20.8371 186.679 25.1158H182.356C182.884 20.4495 185.61 16.4541 189.449 14.2178ZM182.356 28.4254H186.679C186.885 32.7041 187.896 36.4908 189.449 39.3233C185.61 37.0871 182.884 33.0917 182.356 28.4254ZM203.474 39.3233C205.027 36.4908 206.039 32.7041 206.244 28.4254H210.567C210.039 33.0917 207.314 37.0871 203.474 39.3233Z" fill="#A7A7A7"/>
      </svg>
      <svg width="28" height="39" viewBox="256 7 28 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M280.883 34.2821V23.2798C280.883 18.9564 278.436 15.2144 274.889 13.3807V12.203C274.889 9.3406 272.706 7 270.038 7C267.371 7 265.188 9.32569 265.188 12.203V13.3807C261.641 15.1995 259.194 18.9564 259.194 23.2798V34.2821C257.508 34.7294 256.263 36.1904 256.263 37.9346C256.263 40.0367 258.051 41.7362 260.264 41.7362H265.261C265.671 44.1514 267.65 46 270.024 46C272.398 46 274.376 44.1514 274.787 41.7362H279.784C281.982 41.7362 283.785 40.0367 283.785 37.9346C283.785 36.1904 282.539 34.7294 280.854 34.2821H280.883ZM268.441 12.203C268.441 11.1594 269.159 10.3245 270.038 10.3245C270.918 10.3245 271.636 11.1743 271.636 12.203V12.3372C271.108 12.2626 270.581 12.203 270.038 12.203C269.496 12.203 268.969 12.2626 268.441 12.3372V12.203ZM270.038 15.5126C274.215 15.5126 277.615 19.0011 277.615 23.2798V34.133H262.447V23.2798C262.447 19.0011 265.847 15.5126 270.024 15.5126H270.038ZM270.038 42.6904C269.452 42.6904 268.954 42.3027 268.69 41.7362H271.401C271.123 42.2878 270.639 42.6904 270.053 42.6904H270.038ZM279.813 38.4266H260.278C259.853 38.4266 259.545 38.1732 259.545 37.9346C259.545 37.6961 259.853 37.4427 260.278 37.4427H279.813C280.238 37.4427 280.546 37.6961 280.546 37.9346C280.546 38.1732 280.238 38.4266 279.813 38.4266Z" fill="#A7A7A7"/>
        <path d="M257.245 19.7167C257.377 19.7466 257.494 19.7615 257.626 19.7615C258.359 19.7615 259.033 19.2397 259.209 18.4794C259.707 16.3475 261.334 15.1548 261.392 15.1101C262.14 14.6032 262.33 13.5745 261.832 12.8142C261.334 12.0539 260.323 11.8452 259.575 12.3521C259.458 12.4266 256.849 14.2454 256.043 17.7041C255.838 18.5986 256.38 19.4931 257.26 19.7018L257.245 19.7167Z" fill="#A7A7A7"/>
        <path d="M280.869 18.4793C281.045 19.2396 281.719 19.7614 282.451 19.7614C282.569 19.7614 282.701 19.7614 282.832 19.7167C283.712 19.508 284.254 18.6135 284.049 17.719C283.243 14.2603 280.634 12.4415 280.517 12.3669C279.77 11.86 278.773 12.0688 278.275 12.8142C277.777 13.5745 277.967 14.6032 278.7 15.11C278.714 15.11 280.385 16.3176 280.883 18.4793H280.869Z" fill="#A7A7A7"/>
      </svg>
      <svg width="28" height="39" viewBox="331 9 28 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M351.465 26.9496C353.854 25.1308 355.407 22.2386 355.407 18.9737C355.407 13.4725 351.011 9.00006 345.603 9.00006C340.195 9.00006 335.799 13.4725 335.799 18.9737C335.799 22.2386 337.352 25.1308 339.741 26.9496C335.037 28.4404 331.622 32.8682 331.622 38.0562V42.7673C331.622 43.6767 332.355 44.4221 333.249 44.4221H357.972C358.866 44.4221 359.599 43.6767 359.599 42.7673V38.0562C359.599 32.8533 356.184 28.4404 351.48 26.9496H351.465Z" fill="#A7A7A7"/>
      </svg>
    </footer>
  </div>
); 