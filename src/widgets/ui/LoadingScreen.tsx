'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');

  const loadingSteps = [
    { text: 'Инициализация игрового движка...', duration: 800 },
    { text: 'Загрузка игрового мира...', duration: 1000 },
    { text: 'Подключение к серверу...', duration: 600 },
    { text: 'Синхронизация данных...', duration: 700 },
    { text: 'Загрузка ресурсов...', duration: 900 },
    { text: 'Финализация...', duration: 500 }
  ];

  useEffect(() => {
    let currentProgress = 0;
    let stepIndex = 0;

    const updateProgress = () => {
      if (stepIndex < loadingSteps.length) {
        const step = loadingSteps[stepIndex];
        setLoadingText(step.text);
        
        const stepProgress = (stepIndex + 1) / loadingSteps.length * 100;
        const progressIncrement = (stepProgress - currentProgress) / (step.duration / 50);

        const interval = setInterval(() => {
          currentProgress += progressIncrement;
          setProgress(currentProgress);

          if (currentProgress >= stepProgress) {
            clearInterval(interval);
            stepIndex++;
            
            if (stepIndex < loadingSteps.length) {
              setTimeout(() => updateProgress(), 200);
            } else {
              setTimeout(() => {
                onComplete?.();
              }, 500);
            }
          }
        }, 50);
      }
    };

    updateProgress();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/fantasy-landscape.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-purple-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-8">
        {/* Game logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 drop-shadow-2xl">
            Epic MMO RPG
          </h1>
          <p className="text-purple-200 text-xl mt-2">
            Загружается...
          </p>
        </motion.div>

        {/* Loading spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-4 border-purple-600/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            {/* Inner ring */}
            <motion.div
              className="absolute inset-2 border-4 border-pink-500/50 rounded-full"
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            {/* Core */}
            <motion.div
              className="absolute inset-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Magic particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 0, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-6"
        >
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-purple-200">
            <span>{Math.round(progress)}%</span>
            <span>Загружается...</span>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-purple-200 text-lg"
          >
            {loadingText}
          </motion.p>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-purple-300 text-sm max-w-md mx-auto"
        >
          <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
            <h3 className="font-semibold mb-2 text-purple-200">💡 Совет:</h3>
            <p className="opacity-90">
              Используйте WASD для перемещения, мышь для атак, 
              и клавишу Tab для просмотра карты мира!
            </p>
          </div>
        </motion.div>

        {/* Loading dots animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-8 space-x-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p className="text-purple-300 text-sm mb-2">
          Epic MMO RPG v1.0.0 | Created with ❤️ 
        </p>
        <p className="text-purple-400 text-xs opacity-70">
          Присоединяйтесь к тысячам игроков в величайшем приключении!
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;