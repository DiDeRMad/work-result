'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from 'use-sound';
import GameCanvas from '@/game/ui/GameCanvas';
import LoginModal from '@/widgets/auth/LoginModal';
import CharacterCreation from '@/widgets/character/CharacterCreation';
import GameUI from '@/widgets/game/GameUI';
import LoadingScreen from '@/widgets/ui/LoadingScreen';
import { useGameStore } from '@/shared/lib/store';
import { QueryProvider } from '@/shared/lib/QueryProvider';
import { ReduxProvider } from '@/shared/lib/ReduxProvider';
import confetti from 'canvas-confetti';

export default function Home() {
  return (
    <ReduxProvider>
      <QueryProvider>
        <GameApp />
      </QueryProvider>
    </ReduxProvider>
  );
}

function GameApp() {
  const [gameState, setGameState] = useState<'loading' | 'login' | 'character-creation' | 'playing'>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Sound effects
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.7 });
  const [playMusic] = useSound('/sounds/epic-theme.mp3', { 
    volume: 0.3, 
    loop: true,
    onload: () => console.log('🎵 Background music loaded')
  });

  useEffect(() => {
    // Simulate initial loading
    const loadGame = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if user is already authenticated
      const token = localStorage.getItem('game_token');
      if (token) {
        // Validate token and load player data
        try {
          // Mock authentication check
          setIsAuthenticated(true);
          setPlayer({ name: 'TestPlayer', level: 1 });
          setGameState('playing');
        } catch (error) {
          localStorage.removeItem('game_token');
          setGameState('login');
        }
      } else {
        setGameState('login');
      }
    };

    loadGame();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      // Start background music when game starts
      playMusic();
      
      // Show welcome celebration
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setShowWelcome(true);
      }, 1000);
    }
  }, [gameState, playMusic]);

  const handleLogin = (userData: any) => {
    playSuccess();
    setIsAuthenticated(true);
    setPlayer(userData);
    
    if (userData.isNewPlayer) {
      setGameState('character-creation');
    } else {
      setGameState('playing');
    }
  };

  const handleCharacterCreated = (characterData: any) => {
    playSuccess();
    setPlayer(prev => ({ ...prev, ...characterData }));
    setGameState('playing');
  };

  if (gameState === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/fantasy-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main game content */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {gameState === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center w-full h-full"
            >
              <LoginModal onLogin={handleLogin} />
            </motion.div>
          )}

          {gameState === 'character-creation' && (
            <motion.div
              key="character-creation"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center w-full h-full"
            >
              <CharacterCreation onCharacterCreated={handleCharacterCreated} />
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full"
            >
              <GameCanvas />
              <GameUI player={player} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Welcome message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg shadow-lg border border-purple-400">
              <h2 className="text-2xl font-bold text-center">
                🎮 Добро пожаловать в Epic MMO RPG! 🎮
              </h2>
              <p className="text-center mt-2 opacity-90">
                Приготовьтесь к величайшему приключению!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game title overlay */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-8 left-8 z-20"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-lg">
          Epic MMO RPG
        </h1>
        <p className="text-purple-200 text-sm mt-1">
          Версия 1.0.0 - Массовая многопользовательская онлайн игра
        </p>
      </motion.div>

      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-purple-300 text-sm opacity-70">
        Build: 2024.07.21 | Players Online: 1,337 | Server: EU-West
      </div>

      {/* Performance monitor */}
      <div className="absolute top-4 right-4 text-green-400 text-xs font-mono opacity-70">
        <div>FPS: 60</div>
        <div>Ping: 42ms</div>
        <div>Memory: 156MB</div>
      </div>
    </div>
  );
}