'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface LoginModalProps {
  onLogin: (userData: any) => void;
}

const loginSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onLoginSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const userData = {
        id: '1',
        username: data.username,
        level: 25,
        experience: 15000,
        isNewPlayer: false,
        character: {
          name: 'Героический Воин',
          class: 'Warrior',
          race: 'Human',
          level: 25
        }
      };

      localStorage.setItem('game_token', 'mock_token_' + Date.now());
      toast.success('Добро пожаловать обратно, ' + data.username + '!');
      onLogin(userData);
      
    } catch (error) {
      toast.error('Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      const userData = {
        id: '2',
        username: data.username,
        email: data.email,
        level: 1,
        experience: 0,
        isNewPlayer: true
      };

      localStorage.setItem('game_token', 'mock_token_' + Date.now());
      toast.success('Аккаунт создан! Добро пожаловать в игру!');
      onLogin(userData);
      
    } catch (error) {
      toast.error('Ошибка регистрации. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (playerType: string) => {
    const userData = {
      id: playerType,
      username: playerType === 'guest' ? 'Гость' : playerType === 'demo' ? 'Демо-игрок' : 'Тестер',
      level: playerType === 'guest' ? 1 : playerType === 'demo' ? 10 : 50,
      experience: playerType === 'guest' ? 0 : playerType === 'demo' ? 5000 : 50000,
      isNewPlayer: playerType === 'guest',
      character: {
        name: playerType === 'guest' ? 'Новичок' : playerType === 'demo' ? 'Демо Персонаж' : 'Тест Персонаж',
        class: 'Warrior',
        race: 'Human',
        level: playerType === 'guest' ? 1 : playerType === 'demo' ? 10 : 50
      }
    };

    toast.success('Быстрый вход выполнен!');
    onLogin(userData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden"
      >
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
            >
              Epic MMO RPG
            </motion.h1>
            <p className="text-slate-400 mt-2">Войдите в игру или создайте аккаунт</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-700/50 rounded-lg p-1 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Вход
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Регистрация
            </motion.button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Имя пользователя
                  </label>
                  <input
                    {...loginRegister('username')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Введите ваш никнейм"
                  />
                  {loginErrors.username && (
                    <p className="text-red-400 text-sm mt-1">{loginErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Пароль
                  </label>
                  <input
                    {...loginRegister('password')}
                    type="password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Введите ваш пароль"
                  />
                  {loginErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{loginErrors.password.message}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Вход...
                    </div>
                  ) : (
                    'Войти в игру'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegisterSubmit(onRegisterSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Имя пользователя
                  </label>
                  <input
                    {...registerRegister('username')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Выберите никнейм"
                  />
                  {registerErrors.username && (
                    <p className="text-red-400 text-sm mt-1">{registerErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    {...registerRegister('email')}
                    type="email"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                  {registerErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{registerErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Пароль
                  </label>
                  <input
                    {...registerRegister('password')}
                    type="password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Создайте пароль"
                  />
                  {registerErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{registerErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    {...registerRegister('confirmPassword')}
                    type="password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Повторите пароль"
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{registerErrors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Создание аккаунта...
                    </div>
                  ) : (
                    'Создать аккаунт'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quick login options */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-center mb-4">Быстрый вход:</p>
            <div className="flex flex-col space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => quickLogin('guest')}
                className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
              >
                🎮 Войти как гость (Уровень 1)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => quickLogin('demo')}
                className="py-2 px-4 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                🎯 Демо-аккаунт (Уровень 10)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => quickLogin('test')}
                className="py-2 px-4 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
              >
                ⚡ Тест-аккаунт (Уровень 50)
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs">
              Epic MMO RPG v1.0.0 | Создавайте, исследуйте, сражайтесь!
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
};

export default LoginModal;