import React from 'react';
import Image from 'next/image';
import ProfileAvatar from './ProfileAvatar';
import { Profile } from '@/entities/profile/types';

type ProfileCardProps = {
  profile: Profile;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => (
  <section
    style={{
      width: 390,
      minHeight: 320,
      background: '#EEEEEE',
      borderRadius: 0,
      padding: 24,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
    }}
  >
    {/* Верхняя панель */}
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: -2,
      }}
    >
      <Image
        src="/avatars/arrow.png"
        alt="Назад"
        width={18}
        height={32}
        style={{ 
          objectFit: 'contain',
          transform: 'rotate(0deg)'
        }}
      />
    </div>
    {/* Аватарка */}
    <ProfileAvatar catSrc={profile.avatar || '/avatars/cat.png'} />
    
    {/* Информацииля */}
    <div style={{ width: '100%', marginTop: 16, background: '#EEEEEE' }}>
      {/* Имя пользователя */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'SF Pro, sans-serif',
          fontWeight: 400,
          fontSize: 22,
          lineHeight: '28px',
          letterSpacing: '-0.26px',
          color: '#000',
          margin: 0,
        }}>
          румер: <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 28,
            lineHeight: '34px',
            letterSpacing: '0.38px',
            color: '#000',
          }}>{profile.name || 'Ваня Петькин'}</span>
        </h1>
      </div>
      
      {/* Никнейм и дата */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '0',
        width: 369,
        height: 40,
        background: 'transparent',
        borderRadius: 0,
        marginLeft: '-20px',
      }}>
        <span style={{
          fontFamily: 'SF Pro, sans-serif',
          fontWeight: 400,
          fontSize: 17,
          lineHeight: '22px',
          letterSpacing: '-0.43px',
          color: '#666',
          textAlign: 'center',
          width: 182,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          @{profile.nickname || 'nickname'}
        </span>
        <span style={{
          fontFamily: 'SF Pro, sans-serif',
          fontWeight: 400,
          fontSize: 17,
          lineHeight: '22px',
          letterSpacing: '-0.43px',
          color: '#666',
          textAlign: 'center',
          width: 187,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          Вчера 18.00
        </span>
      </div>
      
      {/* Статистика */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 369,
        height: 48,
        background: 'transparent',
        border: 'none',
        marginBottom: 16,
        marginLeft: '-10px',
      }}>
        <div style={{ 
          textAlign: 'center', 
          flex: 1,
          height: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '22px',
            letterSpacing: '-0.43px',
            color: '#000',
          }}>
            1 месяц
          </div>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '22px',
            letterSpacing: '-0.45px',
            color: '#000',
          }}>
            в игруме
          </div>
        </div>
        <div style={{ 
          width: 1, 
          height: 48,
          backgroundColor: '#434343',
        }} />
        <div style={{ 
          textAlign: 'center', 
          flex: 1,
          height: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '22px',
            letterSpacing: '-0.45px',
            color: '#000',
          }}>
            15
          </div>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '22px',
            letterSpacing: '-0.45px',
            color: '#000',
          }}>
            встреч
          </div>
        </div>
        <div style={{ 
          width: 1, 
          height: 48,
          backgroundColor: '#434343',
        }} />
        <div style={{ 
          textAlign: 'center', 
          flex: 1,
          height: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '22px',
            letterSpacing: '-0.43px',
            color: '#000',
          }}>
            350
          </div>
          <div style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '22px',
            letterSpacing: '-0.45px',
            color: '#000',
          }}>
            румеров
          </div>
        </div>
      </div>
      
      {/* Локация и редактирование */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 0,
        marginBottom: 16,
        marginLeft: '-15px',
        width: 370,
        maxWidth: 370,
      }}>
        <button style={{
          width: 210,
          height: 60,
          background: '#fff',
          color: '#000',
          fontSize: 20,
          borderRadius: 25,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: 'none',
          fontWeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // по центру
          padding: '0 24px',
          fontFamily: 'SF Pro, sans-serif',
          marginLeft: 0,
          marginRight: 24,
        }}>
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '28px',
            letterSpacing: '-0.26px',
            color: '#000',
            textAlign: 'center',
            width: '100%',
          }}>
            {profile.city || 'Краснодар'}
          </span>
        </button>
        <button style={{
          width: 140,
          height: 64,
          padding: '0 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 25,
          border: '2px solid #A7A7A7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          cursor: 'pointer',
          marginLeft: 0,
          alignSelf: 'unset',
        }}>
          <Image
            src="/avatars/Vector-1.png"
            alt="Редактировать"
            width={32}
            height={32}
            style={{ marginRight: 0 }}
          />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '21px',
            letterSpacing: '-0.31px',
            color: '#A7A7A7',
            textAlign: 'center',
            marginLeft: 8,
          }}>
            РЕДАКТ
          </span>
        </button>
      </div>
      
      {/* Статусы */}
      <div style={{
        width: 370,
        background: '#fff',
        borderRadius: 25,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: 'none',
        marginBottom: 16,
        marginLeft: '-15px',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Зовы */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 339,
          height: 60,
          margin: '0 auto',
          padding: '0 8px 0 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '25px 25px 0 0',
          borderBottom: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#00CF00',
            }} />
            <span style={{
              fontFamily: 'SF Pro, sans-serif',
              fontWeight: 590,
              fontSize: 20,
              lineHeight: '25px',
              letterSpacing: '-0.45px',
              color: '#000',
            }}>
              ЗОВЫ
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#D0D0D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}>
              <span style={{
                fontFamily: 'SF Pro, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                lineHeight: '28px',
                letterSpacing: '-0.26px',
                color: '#000',
              }}>
                2
              </span>
            </div>
            <Image
              src="/avatars/arrow.png"
              alt="Стрелка"
              width={31}
              height={18}
              style={{ 
                objectFit: 'contain',
                transform: 'rotate(90deg) scaleX(-1)',
                marginLeft: 0,
                marginRight: 4,
              }}
            />
          </div>
        </div>
        {/* Барьер между Зовы и Иду */}
        <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '0 auto' }} />
        {/* Иду */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 339,
          height: 60,
          margin: '0 auto',
          padding: '0 8px 0 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '0 0 25px 25px',
          borderTop: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#FFA100',
            }} />
            <span style={{
              fontFamily: 'SF Pro, sans-serif',
              fontWeight: 590,
              fontSize: 20,
              lineHeight: '25px',
              letterSpacing: '-0.45px',
              color: '#000',
            }}>
              ИДУ
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#D0D0D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}>
              <span style={{
                fontFamily: 'SF Pro, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                lineHeight: '28px',
                letterSpacing: '-0.26px',
                color: '#000',
              }}>
                3
              </span>
            </div>
            <Image
              src="/avatars/arrow.png"
              alt="Стрелка"
              width={31}
              height={18}
              style={{ 
                objectFit: 'contain',
                transform: 'rotate(90deg) scaleX(-1)',
                marginLeft: 0,
                marginRight: 4,
              }}
            />
          </div>
        </div>
      </div>
      {/* Барьер после блока Зовы/Иду */}
      {/* УДАЛЕНО: Наружный барьер после блока Зовы/Иду */}

      {/* МАСТЕР */}
      <div style={{
        width: 370,
        height: 120,
        marginBottom: 16,
        marginLeft: '-15px',
        border: '4px solid #9500FF',
        borderRadius: 25,
        overflow: 'hidden',
      }}>
        {/* СОЗДАТЬ ИГРУМ */}
        <div style={{
          width: 370,
          height: 60,
          backgroundColor: '#9500FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 21,
          borderTopRightRadius: 21,
        }}>
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            lineHeight: '28px',
            letterSpacing: '-0.26px',
            color: '#FFFFFF',
            textAlign: 'center',
          }}>
            СОЗДАТЬ ИГРУМ
          </span>
        </div>
        {/* МОИ ИГРУМЫ */}
        <div style={{
          width: 370,
          height: 60,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomLeftRadius: 21,
          borderBottomRightRadius: 21,
        }}>
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            lineHeight: '28px',
            letterSpacing: '-0.26px',
            color: '#9500FF',
            textAlign: 'center',
          }}>
            МОИ ИГРУМЫ
          </span>
        </div>
      </div>
      
      {/* ИСТОРИЯ ВСТРЕЧ */}
      <div style={{
        width: 370,
        background: '#fff',
        borderRadius: 25,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: 16,
        marginLeft: '-15px',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/Group 344.png" alt="История встреч" width={28} height={26} style={{ display: 'inline-block', marginRight: 10 }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            ИСТОРИЯ ВСТРЕЧ
          </span>
        </button>
      </div>

      {/* КРАСНОДАР */}
      {/* УДАЛЕНО: Блок Краснодар после Истории встреч */}

      {/* ЗОВЫ и ИДУ (после краснодара) */}
      {/* УДАЛЕНО: Блок Зовы и Иду после Краснодара */}

      {/* ПУБЛИЧНЫЙ АККАУНТ, ВЗРОСЛЫЙ */}
      <div style={{
        width: 370,
        background: '#fff',
        borderRadius: 25,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: 16,
        marginLeft: '-15px',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/share.png" alt="Публичный аккаунт" width={35} height={21} style={{ display: 'inline-block' }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            Публичный аккаунт
          </span>
        </button>
        <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '0 auto' }} />
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/_Слой_1-1.png" alt="Взрослый" width={22} height={23} style={{ display: 'inline-block' }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            Взрослый
          </span>
        </button>
      </div>
      
      {/* МОИ ПОДПИСКИ, ЧЕРНЫЙ СПИСОК, ЗАКЛАДКИ */}
      <div style={{
        width: 370,
        background: '#fff',
        borderRadius: 25,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: 5,
        marginLeft: '-15px',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/galochka.png" alt="Мои подписки" width={26} height={19} style={{ display: 'inline-block' }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            Мои подписки
          </span>
        </button>
        <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '0 auto' }} />
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/_Слой_1-3.png" alt="Черный список" width={22} height={22} style={{ display: 'inline-block' }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            Черный список
          </span>
        </button>
        <div style={{ width: 339, height: 0, borderTop: '1px solid #00000033', margin: '0 auto' }} />
        <button style={{ width: '100%', height: 60, background: '#fff', color: '#000', fontSize: 20, borderRadius: 25, boxShadow: 'none', border: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 24px', gap: 16 }}>
          <Image src="/avatars/_Слой_1-4.png" alt="Закладки" width={17} height={20} style={{ display: 'inline-block' }} />
          <span style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 20,
            lineHeight: '25px',
            letterSpacing: '-0.45px',
            color: '#000',
            background: '#fff',
          }}>
            Закладки
          </span>
        </button>
      </div>
      
      {/* СКРЫТНОСТЬ ВОЗРАСТ - УДАЛЕН */}
    </div>
    
    {/* Блок с подписями справа */}
    <div
      style={{
        position: 'absolute',
        right: 8,
        top: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20
      }}
    >
      {/* Share иконка */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
          src="/avatars/share_ios.png"
          alt="Поделиться"
          width={70}
          height={40}
          style={{ objectFit: 'contain', marginBottom: 4 }}
        />
      </div>
      {/*Это я" */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
          src="/avatars/eye.png"
          alt="Глаз"
          width={32}
          height={20}
          style={{ objectFit: 'contain', marginBottom: 4 }}
        />
        <span
          style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '21px',
            letterSpacing: '-0.31px',
            color: '#A7A7A7',
            textAlign: 'center',
          }}
        >
          Это я
        </span>
      </div>
      {/*Котум" */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
          src="/avatars/catum.png"
          alt="Котум"
          width={42}
          height={25}
          style={{ objectFit: 'contain', marginBottom: 4 }}
        />
        <span
          style={{
            fontFamily: 'SF Pro, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '21px',
            letterSpacing: '-0.31px',
            color: '#A7A7A7',
            textAlign: 'center',
          }}
        >
          Котум
        </span>
      </div>
    </div>
  </section>
); 