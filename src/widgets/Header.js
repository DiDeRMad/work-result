// Простой pixel-perfect header на чистом JS и HTML
// Для вставки в index.html или подключения как модуля

const header = document.createElement('div');
header.style.width = '390px';
header.style.height = '48px';
header.style.background = '#E5E5E5';
header.style.position = 'relative';

// Бургер-меню (Group 578)
const burger = document.createElement('div');
burger.style.width = '29px';
burger.style.height = '23px';
burger.style.position = 'absolute';
burger.style.top = '0px';
burger.style.left = '0px';

for (let i = 0; i < 3; i++) {
  const line = document.createElement('div');
  line.style.width = '29px';
  line.style.height = '5px';
  line.style.background = '#7F7F7F';
  line.style.borderRadius = '2.5px';
  line.style.marginBottom = i < 2 ? '4px' : '0';
  burger.appendChild(line);
}

header.appendChild(burger);

// Надпись "Профиль"
const title = document.createElement('div');
title.innerText = 'Профиль';
title.style.position = 'absolute';
title.style.left = '50%';
title.style.top = '50%';
title.style.transform = 'translate(-50%, -50%)';
title.style.fontFamily = 'SF Pro, Arial, sans-serif';
title.style.fontWeight = '400';
title.style.fontSize = '28px';
title.style.lineHeight = '34px';
title.style.letterSpacing = '0.38px';
title.style.color = '#7F7F7F';
header.appendChild(title);

// Экспортируем функцию для вставки header в DOM
export function renderHeader(target = document.body) {
  target.prepend(header);
} 