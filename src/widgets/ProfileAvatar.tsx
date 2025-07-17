import React from "react";

type ProfileAvatarProps = {
  catSrc: string;
};

const AVATAR_SIZE = 180; // Размер круглого контейнера аватара (px)
const CAT_SIZE = 180;    // Размер изображения кота (px)
const BADGE_SIZE = 36;   // Размер бейджика (px)
const BADGE_OFFSET = 0; // Смещение бейджика в левый верхний угол

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ catSrc }) => {
  return (
    // Контейнер для аватара пользователя
    <div
      style={{
        position: "relative",
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: "50%",
        background: "#FFE600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      {/* Бейджик с буквой P (статус пользователя), зелёный круг */}
      <div
        style={{
          position: "absolute",
          top: BADGE_OFFSET,
          left: BADGE_OFFSET,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: "50%",
          background: "rgba(0, 209, 45, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 22,
          color: "#000",
          zIndex: 99999,
          lineHeight: 1,
          padding: 0,
          pointerEvents: 'none',
          outline: 'none',
          boxShadow: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
      >
        P
      </div>
      {/* Картинка кота — аватар пользователя */}
      <img
        src={catSrc}
        alt="Кот"
        width={CAT_SIZE}
        height={CAT_SIZE}
        style={{
          zIndex: 9998,
          border: "none",
          outline: "none",
          boxShadow: "none",
        }}
        draggable={false}
      />
    </div>
  );
};

export default ProfileAvatar; 