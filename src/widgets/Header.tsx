import React from "react";

export const Header: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: 48,
      background: "#E5E5E5",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxSizing: "border-box",
      paddingLeft: 16,
      paddingRight: 16,
      borderBottom: "1px solid #BDBDBD", // Тонкая линия внизу шапки для отделения от основного контента
    }}
  >
    {/* Название раздела профиля в шапке */}
    <span
      style={{
        fontFamily: "SF Pro, Arial, sans-serif",
        fontWeight: 400,
        fontSize: 28,
        lineHeight: "34px",
        letterSpacing: "0.38px",
        color: "#7F7F7F",
      }}
    >
      Профиль
    </span>
    {/* Иконка бургер-меню для навигации */}
    <div
      style={{
        width: 29,
        height: 23,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Три полоски бургер-меню */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 29,
            height: 5,
            background: "#A7A7A7",
            borderRadius: 2.5,
          }}
        />
      ))}
    </div>
  </div>
);