'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSound } from 'use-sound';

interface CharacterCreationProps {
  onComplete: (characterData: any) => void;
  onBack: () => void;
}

const characterSchema = z.object({
  characterName: z.string().min(3, 'Имя должно содержать минимум 3 символа').max(20, 'Максимум 20 символов'),
  race: z.string().min(1, 'Выберите расу'),
  class: z.string().min(1, 'Выберите класс'),
  gender: z.enum(['male', 'female']),
  appearance: z.object({
    skinColor: z.string(),
    hairColor: z.string(),
    eyeColor: z.string(),
    hairStyle: z.string(),
    faceType: z.string(),
    bodyType: z.string()
  })
});

const races = [
  {
    id: 'Human',
    name: 'Человек',
    description: 'Универсальная раса с балансированными характеристиками',
    bonuses: { strength: 1, agility: 1, intelligence: 1, vitality: 1, luck: 1 },
    image: '/images/races/human.jpg'
  },
  {
    id: 'Elf',
    name: 'Эльф',
    description: 'Грациозная раса с высокой ловкостью и интеллектом',
    bonuses: { agility: 3, intelligence: 2, vitality: -1, luck: 1 },
    image: '/images/races/elf.jpg'
  },
  {
    id: 'Dwarf',
    name: 'Дворф',
    description: 'Крепкая раса с высокой силой и выносливостью',
    bonuses: { strength: 2, vitality: 3, agility: -1, intelligence: 0, luck: 1 },
    image: '/images/races/dwarf.jpg'
  },
  {
    id: 'Orc',
    name: 'Орк',
    description: 'Воинственная раса с превосходной физической силой',
    bonuses: { strength: 4, vitality: 2, agility: 0, intelligence: -2, luck: 1 },
    image: '/images/races/orc.jpg'
  },
  {
    id: 'Halfling',
    name: 'Хоббит',
    description: 'Маленькая, но очень удачливая раса',
    bonuses: { strength: -1, agility: 2, intelligence: 1, vitality: 1, luck: 3 },
    image: '/images/races/halfling.jpg'
  },
  {
    id: 'Dragonborn',
    name: 'Драконорожденный',
    description: 'Могущественная раса с драконьей кровью',
    bonuses: { strength: 2, agility: 1, intelligence: 2, vitality: 2, luck: 0 },
    image: '/images/races/dragonborn.jpg'
  },
  {
    id: 'Tiefling',
    name: 'Тифлинг',
    description: 'Раса с демонической кровью, склонная к магии',
    bonuses: { strength: 0, agility: 1, intelligence: 3, vitality: 1, luck: 2 },
    image: '/images/races/tiefling.jpg'
  }
];

const classes = [
  {
    id: 'Warrior',
    name: 'Воин',
    description: 'Мастер ближнего боя с тяжелой броней',
    primaryStats: ['strength', 'vitality'],
    startingSkills: ['Sword Mastery', 'Shield Block', 'Heavy Armor'],
    image: '/images/classes/warrior.jpg'
  },
  {
    id: 'Mage',
    name: 'Маг',
    description: 'Повелитель стихий и тайных знаний',
    primaryStats: ['intelligence', 'mana'],
    startingSkills: ['Fireball', 'Magic Shield', 'Mana Efficiency'],
    image: '/images/classes/mage.jpg'
  },
  {
    id: 'Rogue',
    name: 'Разбойник',
    description: 'Скрытный мастер кинжалов и ловушек',
    primaryStats: ['agility', 'luck'],
    startingSkills: ['Stealth', 'Backstab', 'Lockpicking'],
    image: '/images/classes/rogue.jpg'
  },
  {
    id: 'Cleric',
    name: 'Жрец',
    description: 'Целитель и защитник от нежити',
    primaryStats: ['intelligence', 'vitality'],
    startingSkills: ['Heal', 'Turn Undead', 'Divine Protection'],
    image: '/images/classes/cleric.jpg'
  },
  {
    id: 'Ranger',
    name: 'Рейнджер',
    description: 'Мастер дальнего боя и выживания в дикой природе',
    primaryStats: ['agility', 'intelligence'],
    startingSkills: ['Bow Mastery', 'Track', 'Animal Companion'],
    image: '/images/classes/ranger.jpg'
  },
  {
    id: 'Paladin',
    name: 'Паладин',
    description: 'Святой воин света и справедливости',
    primaryStats: ['strength', 'intelligence'],
    startingSkills: ['Holy Strike', 'Divine Heal', 'Aura of Protection'],
    image: '/images/classes/paladin.jpg'
  },
  {
    id: 'Warlock',
    name: 'Чернокнижник',
    description: 'Темный маг, черпающий силу из запретных знаний',
    primaryStats: ['intelligence', 'luck'],
    startingSkills: ['Dark Bolt', 'Curse', 'Demon Pact'],
    image: '/images/classes/warlock.jpg'
  },
  {
    id: 'Bard',
    name: 'Бард',
    description: 'Музыкант и рассказчик с магическими способностями',
    primaryStats: ['intelligence', 'luck'],
    startingSkills: ['Inspiring Song', 'Charm', 'Lore Knowledge'],
    image: '/images/classes/bard.jpg'
  }
];

const appearanceOptions = {
  skinColor: [
    { id: 'pale', name: 'Бледная', color: '#F5DEB3' },
    { id: 'fair', name: 'Светлая', color: '#FDBCB4' },
    { id: 'medium', name: 'Средняя', color: '#E0AC69' },
    { id: 'olive', name: 'Оливковая', color: '#C68642' },
    { id: 'brown', name: 'Коричневая', color: '#8D5524' },
    { id: 'dark', name: 'Темная', color: '#654321' }
  ],
  hairColor: [
    { id: 'blonde', name: 'Блондин', color: '#FAD5A5' },
    { id: 'brown', name: 'Каштановый', color: '#964B00' },
    { id: 'black', name: 'Черный', color: '#000000' },
    { id: 'red', name: 'Рыжий', color: '#CC4125' },
    { id: 'white', name: 'Белый', color: '#FFFFFF' },
    { id: 'silver', name: 'Серебряный', color: '#C0C0C0' }
  ],
  eyeColor: [
    { id: 'brown', name: 'Карие', color: '#8B4513' },
    { id: 'blue', name: 'Голубые', color: '#4169E1' },
    { id: 'green', name: 'Зеленые', color: '#008000' },
    { id: 'hazel', name: 'Ореховые', color: '#8E7618' },
    { id: 'gray', name: 'Серые', color: '#708090' },
    { id: 'violet', name: 'Фиолетовые', color: '#8A2BE2' }
  ],
  hairStyle: [
    { id: 'short', name: 'Короткие' },
    { id: 'medium', name: 'Средние' },
    { id: 'long', name: 'Длинные' },
    { id: 'braided', name: 'Косы' },
    { id: 'ponytail', name: 'Хвост' },
    { id: 'bald', name: 'Лысый' }
  ],
  faceType: [
    { id: 'oval', name: 'Овальное' },
    { id: 'round', name: 'Круглое' },
    { id: 'square', name: 'Квадратное' },
    { id: 'heart', name: 'Сердечком' },
    { id: 'diamond', name: 'Ромбовидное' }
  ],
  bodyType: [
    { id: 'slim', name: 'Худощавое' },
    { id: 'athletic', name: 'Атлетическое' },
    { id: 'average', name: 'Среднее' },
    { id: 'muscular', name: 'Мускулистое' },
    { id: 'heavy', name: 'Плотное' }
  ]
};

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [previewStats, setPreviewStats] = useState<any>(null);
  
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.7 });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      characterName: '',
      race: '',
      class: '',
      gender: 'male' as const,
      appearance: {
        skinColor: 'fair',
        hairColor: 'brown',
        eyeColor: 'brown',
        hairStyle: 'medium',
        faceType: 'oval',
        bodyType: 'average'
      }
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (selectedRace && selectedClass) {
      const race = races.find(r => r.id === selectedRace);
      const classData = classes.find(c => c.id === selectedClass);
      
      if (race && classData) {
        const baseStats = {
          strength: 10,
          agility: 10,
          intelligence: 10,
          vitality: 10,
          luck: 10
        };

        const finalStats = {
          strength: baseStats.strength + race.bonuses.strength,
          agility: baseStats.agility + race.bonuses.agility,
          intelligence: baseStats.intelligence + race.bonuses.intelligence,
          vitality: baseStats.vitality + race.bonuses.vitality,
          luck: baseStats.luck + race.bonuses.luck
        };

        setPreviewStats({
          ...finalStats,
          health: finalStats.vitality * 10 + 50,
          mana: finalStats.intelligence * 5 + 25,
          stamina: finalStats.agility * 3 + 30
        });
      }
    }
  }, [selectedRace, selectedClass]);

  const onSubmit = async (data: any) => {
    try {
      playSuccess();
      
      const characterData = {
        ...data,
        stats: previewStats,
        startingLocation: 'newbie_town'
      };

      toast.success('Персонаж создан успешно!');
      setTimeout(() => {
        onComplete(characterData);
      }, 1000);
    } catch (error) {
      toast.error('Ошибка при создании персонажа');
    }
  };

  const nextStep = () => {
    playClick();
    setStep(step + 1);
  };

  const prevStep = () => {
    playClick();
    setStep(step - 1);
  };

  const selectRace = (raceId: string) => {
    playClick();
    setSelectedRace(raceId);
    setValue('race', raceId);
  };

  const selectClass = (classId: string) => {
    playClick();
    setSelectedClass(classId);
    setValue('class', classId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 10 }}
            animate={{
              y: -10,
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30">
          <h2 className="text-3xl font-bold text-white text-center">
            Создание Персонажа
          </h2>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step >= stepNum ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={onBack}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Назад
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Character Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Как зовут вашего героя?</h3>
                  <div className="max-w-md mx-auto">
                    <input
                      {...register('characterName')}
                      type="text"
                      placeholder="Введите имя персонажа"
                      className="w-full px-4 py-3 bg-slate-700 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.characterName && (
                      <p className="text-red-400 text-sm mt-2">{errors.characterName.message}</p>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-xl font-semibold text-white mb-4">Выберите пол</h4>
                  <div className="flex justify-center space-x-4">
                    {['male', 'female'].map((gender) => (
                      <label key={gender} className="cursor-pointer">
                        <input
                          {...register('gender')}
                          type="radio"
                          value={gender}
                          className="sr-only"
                        />
                        <div className={`px-6 py-3 rounded-lg border-2 transition-all ${
                          watchedValues.gender === gender
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}>
                          {gender === 'male' ? '♂ Мужской' : '♀ Женский'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Race Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center mb-6">Выберите расу</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {races.map((race) => (
                    <motion.div
                      key={race.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectRace(race.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRace === race.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                          {race.name[0]}
                        </div>
                        <h4 className="font-bold text-white mb-2">{race.name}</h4>
                        <p className="text-sm text-gray-300 mb-3">{race.description}</p>
                        <div className="text-xs space-y-1">
                          {Object.entries(race.bonuses).map(([stat, bonus]) => (
                            <div key={stat} className={`flex justify-between ${bonus > 0 ? 'text-green-400' : bonus < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              <span className="capitalize">{stat}:</span>
                              <span>{bonus > 0 ? '+' : ''}{bonus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Class Selection */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center mb-6">Выберите класс</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {classes.map((classData) => (
                    <motion.div
                      key={classData.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectClass(classData.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedClass === classData.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                          {classData.name[0]}
                        </div>
                        <h4 className="font-bold text-white mb-2">{classData.name}</h4>
                        <p className="text-sm text-gray-300 mb-3">{classData.description}</p>
                        <div className="text-xs space-y-1">
                          <div className="text-blue-400 font-semibold">Основные характеристики:</div>
                          {classData.primaryStats.map((stat) => (
                            <div key={stat} className="text-gray-300 capitalize">{stat}</div>
                          ))}
                          <div className="text-green-400 font-semibold mt-2">Начальные навыки:</div>
                          {classData.startingSkills.map((skill) => (
                            <div key={skill} className="text-gray-300 text-xs">{skill}</div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Appearance & Preview */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center mb-6">Внешность и предпросмотр</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Appearance Customization */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-white">Настройка внешности</h4>
                    
                    {Object.entries(appearanceOptions).map(([category, options]) => (
                      <div key={category} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 capitalize">
                          {category === 'skinColor' ? 'Цвет кожи' :
                           category === 'hairColor' ? 'Цвет волос' :
                           category === 'eyeColor' ? 'Цвет глаз' :
                           category === 'hairStyle' ? 'Прическа' :
                           category === 'faceType' ? 'Тип лица' :
                           category === 'bodyType' ? 'Телосложение' : category}
                        </label>
                        
                        {['skinColor', 'hairColor', 'eyeColor'].includes(category) ? (
                          <div className="flex flex-wrap gap-2">
                            {options.map((option: any) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setValue(`appearance.${category}`, option.id)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  watchedValues.appearance?.[category as keyof typeof watchedValues.appearance] === option.id
                                    ? 'border-blue-500 scale-110'
                                    : 'border-gray-600 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: option.color }}
                                title={option.name}
                              />
                            ))}
                          </div>
                        ) : (
                          <select
                            {...register(`appearance.${category}` as any)}
                            className="w-full px-3 py-2 bg-slate-700 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {options.map((option: any) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Character Preview */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-white">Предпросмотр персонажа</h4>
                    
                    {/* 3D Model Preview Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-blue-500/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                          {watchedValues.characterName?.[0] || '?'}
                        </div>
                        <p className="text-gray-300">3D модель персонажа</p>
                        <p className="text-sm text-gray-400">(в разработке)</p>
                      </div>
                    </div>

                    {/* Stats Preview */}
                    {previewStats && (
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/30">
                        <h5 className="font-semibold text-white mb-3">Характеристики</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Сила:</span>
                              <span className="text-red-400 font-semibold">{previewStats.strength}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Ловкость:</span>
                              <span className="text-green-400 font-semibold">{previewStats.agility}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Интеллект:</span>
                              <span className="text-blue-400 font-semibold">{previewStats.intelligence}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Выносливость:</span>
                              <span className="text-yellow-400 font-semibold">{previewStats.vitality}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Удача:</span>
                              <span className="text-purple-400 font-semibold">{previewStats.luck}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-600 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Здоровье:</span>
                            <span className="text-red-400 font-semibold">{previewStats.health}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Мана:</span>
                            <span className="text-blue-400 font-semibold">{previewStats.mana}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Выносливость:</span>
                            <span className="text-green-400 font-semibold">{previewStats.stamina}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Назад
            </button>
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && (!watchedValues.characterName || watchedValues.characterName.length < 3)) ||
                  (step === 2 && !selectedRace) ||
                  (step === 3 && !selectedClass)
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Создать персонажа
              </button>
            )}
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-blue-400 opacity-30">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default CharacterCreation;