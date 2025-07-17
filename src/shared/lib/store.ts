import { configureStore } from '@reduxjs/toolkit';

// Временный пустой reducer-заглушка (можно заменить на реальные редьюсеры при расширении приложения)
const dummyReducer = (state = {}) => state;

// Создание Redux store с помощью Redux Toolkit
export const store = configureStore({
  reducer: {
    dummy: dummyReducer, // Здесь можно добавить другие редьюсеры по мере необходимости
  },
});

// Тип для всего состояния Redux store
export type RootState = ReturnType<typeof store.getState>;
// Тип для dispatch (используется в хуках и компонентах)
export type AppDispatch = typeof store.dispatch; 