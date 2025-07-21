'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from 'use-sound';
import toast from 'react-hot-toast';

interface GameUIProps {
  player: any;
  socket: any;
  gameState: any;
}

interface ChatMessage {
  id: string;
  timestamp: number;
  username: string;
  message: string;
  type: 'public' | 'guild' | 'whisper' | 'system';
  color?: string;
}

interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  isCompleted: boolean;
  experience: number;
  goldReward: number;
}

const GameUI: React.FC<GameUIProps> = ({ player, socket, gameState }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('character');
  const [showInventory, setShowInventory] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [actionBarSkills, setActionBarSkills] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playNotification] = useSound('/sounds/notification.mp3', { volume: 0.7 });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: any) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        username: data.username,
        message: data.message,
        type: data.type || 'public',
        color: data.color
      };
      
      setChatMessages(prev => [...prev.slice(-99), newMessage]);
      
      if (data.type === 'whisper' || data.username !== player?.username) {
        playNotification();
      }
    };

    const handleQuestUpdate = (data: any) => {
      setActiveQuests(prev => 
        prev.map(quest => 
          quest.id === data.questId 
            ? { ...quest, ...data.updates }
            : quest
        )
      );
      
      if (data.completed) {
        toast.success(`Квест "${data.title}" выполнен!`);
      }
    };

    const handleSkillCooldown = (data: any) => {
      setActionBarSkills(prev => 
        prev.map(skill => 
          skill.id === data.skillId 
            ? { ...skill, cooldown: data.cooldown, lastUsed: Date.now() }
            : skill
        )
      );
    };

    socket.on('chat_message', handleChatMessage);
    socket.on('quest_update', handleQuestUpdate);
    socket.on('skill_cooldown', handleSkillCooldown);

    return () => {
      socket.off('chat_message', handleChatMessage);
      socket.off('quest_update', handleQuestUpdate);
      socket.off('skill_cooldown', handleSkillCooldown);
    };
  }, [socket, player, playNotification]);

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;

    socket.emit('chat_message', {
      message: chatInput,
      type: 'public'
    });

    setChatInput('');
  };

  // Use skill
  const useSkill = (skillId: string, slot: number) => {
    if (!socket || !player) return;

    const skill = actionBarSkills[slot];
    if (!skill || skill.cooldown > 0) return;

    playClick();
    socket.emit('use_skill', {
      playerId: player.userId,
      skillId: skillId,
      targetPosition: null // Will be set by click-to-cast
    });
  };

  // Calculate health/mana/stamina percentages
  const getStatPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Character Stats Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 bg-slate-800/90 border border-blue-500/30 rounded-lg p-4 pointer-events-auto min-w-[280px]"
      >
        <div className="space-y-4">
          {/* Character Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {player?.characterName?.[0] || 'P'}
            </div>
            <div>
              <h3 className="text-white font-bold">{player?.characterName}</h3>
              <div className="text-sm text-gray-300">
                Уровень {player?.level || 1} {player?.class}
              </div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">Здоровье</span>
              <span className="text-white">
                {player?.stats?.health || 0} / {player?.stats?.maxHealth || 100}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-red-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${getStatPercentage(
                    player?.stats?.health || 0, 
                    player?.stats?.maxHealth || 100
                  )}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-400">Мана</span>
              <span className="text-white">
                {player?.stats?.mana || 0} / {player?.stats?.maxMana || 50}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${getStatPercentage(
                    player?.stats?.mana || 0, 
                    player?.stats?.maxMana || 50
                  )}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Выносливость</span>
              <span className="text-white">
                {player?.stats?.stamina || 0} / {player?.stats?.maxStamina || 30}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${getStatPercentage(
                    player?.stats?.stamina || 0, 
                    player?.stats?.maxStamina || 30
                  )}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Experience Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-400">Опыт</span>
              <span className="text-white">
                {player?.experience || 0} / {player?.experienceRequired || 1000}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-yellow-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${getStatPercentage(
                    player?.experience || 0, 
                    player?.experienceRequired || 1000
                  )}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Currency */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-600">
            <span className="text-yellow-400 text-sm">💰 Золото:</span>
            <span className="text-white font-semibold">{player?.currency?.gold || 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 border border-blue-500/30 rounded-lg p-3 pointer-events-auto"
      >
        <div className="flex space-x-2">
          {Array.from({ length: 8 }).map((_, index) => {
            const skill = actionBarSkills[index];
            return (
              <button
                key={index}
                onClick={() => skill && useSkill(skill.id, index)}
                disabled={skill?.cooldown > 0}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-white font-bold transition-all relative ${
                  skill 
                    ? skill.cooldown > 0
                      ? 'bg-gray-700 border-gray-600 opacity-50'
                      : 'bg-slate-700 border-blue-500/50 hover:border-blue-400 hover:bg-slate-600'
                    : 'bg-gray-800 border-gray-600'
                }`}
              >
                {skill ? (
                  <>
                    {skill.icon || skill.name?.[0] || '?'}
                    <span className="absolute bottom-0 right-0 text-xs bg-black px-1 rounded">
                      {index + 1}
                    </span>
                    {skill.cooldown > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-xs">
                        {Math.ceil(skill.cooldown / 1000)}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">{index + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-20 left-4 w-96 h-64 bg-slate-800/90 border border-blue-500/30 rounded-lg pointer-events-auto"
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-600">
            <h4 className="text-white font-semibold">Чат</h4>
            <div className="flex space-x-1">
              <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Общий</button>
              <button className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">Гильдия</button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTime(msg.timestamp)}
                </span>
                <span 
                  className={`font-semibold ${
                    msg.type === 'system' ? 'text-yellow-400' :
                    msg.type === 'guild' ? 'text-green-400' :
                    msg.type === 'whisper' ? 'text-purple-400' :
                    'text-blue-400'
                  }`}
                >
                  {msg.username}:
                </span>
                <span className="text-gray-200 break-words">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-600">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Введите сообщение..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                ↵
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quest Tracker */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-slate-800/90 border border-blue-500/30 rounded-lg p-4 pointer-events-auto min-w-[300px] max-w-[400px]"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold">Активные квесты</h4>
            <button
              onClick={() => setShowQuests(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Показать все
            </button>
          </div>

          {activeQuests.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет активных квестов</p>
          ) : (
            <div className="space-y-3">
              {activeQuests.slice(0, 3).map((quest) => (
                <div key={quest.id} className="bg-slate-700/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm mb-1">{quest.title}</h5>
                  <div className="space-y-1">
                    {quest.objectives.map((objective) => (
                      <div key={objective.id} className="flex items-center justify-between text-xs">
                        <span className={`${objective.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                          {objective.description}
                        </span>
                        <span className={`${objective.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                          {objective.current}/{objective.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mini Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-4 right-4 mt-60 w-32 h-32 bg-slate-800/90 border border-blue-500/30 rounded-lg pointer-events-auto"
      >
        <div className="w-full h-full bg-slate-900 rounded-lg relative overflow-hidden">
          {/* Minimap content would go here */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute bottom-1 left-1 text-xs text-gray-400">Карта</div>
        </div>
      </motion.div>

      {/* UI Toggle Buttons */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 right-4 space-y-2 pointer-events-auto"
      >
        <button
          onClick={() => setShowInventory(true)}
          className="w-12 h-12 bg-slate-800 border border-blue-500/30 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
          title="Инвентарь (I)"
        >
          🎒
        </button>
        <button
          onClick={() => setShowQuests(true)}
          className="w-12 h-12 bg-slate-800 border border-blue-500/30 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
          title="Квесты (Q)"
        >
          📜
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 bg-slate-800 border border-blue-500/30 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
          title="Настройки (ESC)"
        >
          ⚙️
        </button>
      </motion.div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto"
            onClick={() => setShowInventory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-blue-500/30 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Инвентарь</h2>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 40 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-slate-700 border border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500/50 transition-colors cursor-pointer"
                  >
                    <span className="text-gray-500 text-xs">{index + 1}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Helper */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 border border-blue-500/30 rounded-lg px-4 py-2 pointer-events-auto"
      >
        <div className="flex space-x-4 text-xs text-gray-300">
          <span><kbd className="bg-gray-700 px-1 rounded">I</kbd> Инвентарь</span>
          <span><kbd className="bg-gray-700 px-1 rounded">Q</kbd> Квесты</span>
          <span><kbd className="bg-gray-700 px-1 rounded">M</kbd> Карта</span>
          <span><kbd className="bg-gray-700 px-1 rounded">ESC</kbd> Меню</span>
          <span><kbd className="bg-gray-700 px-1 rounded">1-8</kbd> Навыки</span>
        </div>
      </motion.div>
    </div>
  );
};

export default GameUI;