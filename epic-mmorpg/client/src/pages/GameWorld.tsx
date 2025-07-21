import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, IconButton, Drawer, Badge, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Inventory2 as InventoryIcon,
  PersonOutline as CharacterIcon,
  Map as MapIcon,
  Forum as ChatIcon,
  Groups as SocialIcon,
  EmojiEvents as QuestsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Favorite as HealthIcon,
  BoltOutlined as EnergyIcon,
  ShieldOutlined as DefenseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Game components
import GameCanvas from '../components/game/GameCanvas';
import ChatPanel from '../components/game/ChatPanel';
import InventoryPanel from '../components/game/InventoryPanel';
import CharacterPanel from '../components/game/CharacterPanel';
import QuestLog from '../components/game/QuestLog';
import Minimap from '../components/game/Minimap';
import ActionBar from '../components/game/ActionBar';
import TargetFrame from '../components/game/TargetFrame';
import PartyFrames from '../components/game/PartyFrames';
import BuffBar from '../components/game/BuffBar';
import CastBar from '../components/game/CastBar';
import DamageNumbers from '../components/game/DamageNumbers';
import Notifications from '../components/game/Notifications';
import ContextMenu from '../components/game/ContextMenu';
import LoadingOverlay from '../components/game/LoadingOverlay';

// Hooks
import { useGameState } from '../hooks/useGameState';
import { useKeyBindings } from '../hooks/useKeyBindings';
import { useWindowSize } from '../hooks/useWindowSize';
import { useGameAudio } from '../hooks/useGameAudio';

// Styled components
const GameContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: 'linear-gradient(to bottom, #000428, #004e92)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/assets/images/game-bg-pattern.png") repeat',
    opacity: 0.05,
    pointerEvents: 'none',
  },
}));

const UILayer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'auto',
  },
});

const TopBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 80,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  zIndex: 10,
}));

const BottomBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 120,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: theme.spacing(2),
  zIndex: 10,
}));

const SideMenu = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  background: 'rgba(0,0,0,0.3)',
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
}));

const ResourceBar = styled(Box)<{ color: string }>(({ theme, color }) => ({
  position: 'relative',
  width: 200,
  height: 24,
  background: 'rgba(0,0,0,0.5)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)',
  '& .fill': {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: `linear-gradient(to right, ${color}88, ${color})`,
    transition: 'width 0.3s ease',
  },
  '& .text': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadow: '0 0 4px rgba(0,0,0,0.8)',
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    background: 'rgba(255,255,255,0.2)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const GameWorld: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const { playSound, playMusic, stopMusic } = useGameAudio();
  
  // Game state
  const {
    player,
    target,
    party,
    isLoading,
    notifications,
    contextMenu,
    activePanel,
    setActivePanel,
  } = useGameState();

  // UI state
  const [panels, setPanels] = useState({
    inventory: false,
    character: false,
    quests: false,
    social: false,
    map: false,
    settings: false,
  });

  // Setup key bindings
  useKeyBindings({
    'i': () => togglePanel('inventory'),
    'c': () => togglePanel('character'),
    'q': () => togglePanel('quests'),
    'm': () => togglePanel('map'),
    'Escape': () => closeAllPanels(),
  });

  // Initialize game
  useEffect(() => {
    playMusic('world-ambient');
    return () => {
      stopMusic();
    };
  }, []);

  const togglePanel = useCallback((panel: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }));
    playSound('ui-click');
  }, [playSound]);

  const closeAllPanels = useCallback(() => {
    setPanels({
      inventory: false,
      character: false,
      quests: false,
      social: false,
      map: false,
      settings: false,
    });
  }, []);

  const handleLogout = useCallback(() => {
    playSound('ui-click');
    // Handle logout logic
  }, [playSound]);

  return (
    <GameContainer>
      {/* 3D Game Canvas */}
      <Box ref={canvasRef} sx={{ width: '100%', height: '100%' }}>
        <GameCanvas />
      </Box>

      {/* UI Layer */}
      <UILayer>
        {/* Top Bar - Player info and minimap */}
        <TopBar>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Player Frame */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={player?.avatar || '/assets/images/default-avatar.png'}
                  alt="Player"
                  style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #ffd700' }}
                />
                <Box>
                  <Box sx={{ color: '#fff', fontWeight: 'bold' }}>{player?.name || 'Unknown'}</Box>
                  <Box sx={{ color: '#ffd700', fontSize: 12 }}>Level {player?.level || 1}</Box>
                </Box>
              </Box>
              
              {/* Resource Bars */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <ResourceBar color="#ff4444">
                  <Box className="fill" sx={{ width: `${(player?.health || 0) / (player?.maxHealth || 1) * 100}%` }} />
                  <Box className="text">
                    <HealthIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {player?.health || 0} / {player?.maxHealth || 100}
                  </Box>
                </ResourceBar>
                <ResourceBar color="#4444ff">
                  <Box className="fill" sx={{ width: `${(player?.mana || 0) / (player?.maxMana || 1) * 100}%` }} />
                  <Box className="text">
                    <EnergyIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {player?.mana || 0} / {player?.maxMana || 100}
                  </Box>
                </ResourceBar>
              </Box>
            </Box>

            {/* Buff Bar */}
            <BuffBar buffs={player?.buffs || []} />
          </Box>

          {/* Minimap */}
          <Box sx={{ position: 'relative' }}>
            <Minimap />
          </Box>
        </TopBar>

        {/* Target Frame */}
        {target && (
          <Box sx={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)' }}>
            <TargetFrame target={target} />
          </Box>
        )}

        {/* Party Frames */}
        {party && party.length > 0 && (
          <Box sx={{ position: 'absolute', top: 100, left: 20 }}>
            <PartyFrames party={party} />
          </Box>
        )}

        {/* Cast Bar */}
        <Box sx={{ position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)' }}>
          <CastBar />
        </Box>

        {/* Bottom Bar - Action bars */}
        <BottomBar>
          <ActionBar />
        </BottomBar>

        {/* Side Menu */}
        <SideMenu>
          <Tooltip title="Inventory (I)" placement="left">
            <MenuButton onClick={() => togglePanel('inventory')}>
              <Badge badgeContent={4} color="error">
                <InventoryIcon />
              </Badge>
            </MenuButton>
          </Tooltip>

          <Tooltip title="Character (C)" placement="left">
            <MenuButton onClick={() => togglePanel('character')}>
              <CharacterIcon />
            </MenuButton>
          </Tooltip>

          <Tooltip title="Quests (Q)" placement="left">
            <MenuButton onClick={() => togglePanel('quests')}>
              <Badge badgeContent={2} color="warning">
                <QuestsIcon />
              </Badge>
            </MenuButton>
          </Tooltip>

          <Tooltip title="Social" placement="left">
            <MenuButton onClick={() => togglePanel('social')}>
              <Badge badgeContent={1} color="success">
                <SocialIcon />
              </Badge>
            </MenuButton>
          </Tooltip>

          <Tooltip title="Map (M)" placement="left">
            <MenuButton onClick={() => togglePanel('map')}>
              <MapIcon />
            </MenuButton>
          </Tooltip>

          <Tooltip title="Settings" placement="left">
            <MenuButton onClick={() => togglePanel('settings')}>
              <SettingsIcon />
            </MenuButton>
          </Tooltip>

          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Tooltip title="Logout" placement="left">
              <MenuButton onClick={handleLogout} sx={{ color: '#ff4444' }}>
                <LogoutIcon />
              </MenuButton>
            </Tooltip>
          </Box>
        </SideMenu>

        {/* Chat Panel */}
        <Box sx={{ position: 'absolute', bottom: 20, left: 20, width: 400, height: 200 }}>
          <ChatPanel />
        </Box>

        {/* Panels */}
        <AnimatePresence>
          {panels.inventory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
              }}
            >
              <InventoryPanel onClose={() => togglePanel('inventory')} />
            </motion.div>
          )}

          {panels.character && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: 20,
                transform: 'translateY(-50%)',
                zIndex: 100,
              }}
            >
              <CharacterPanel onClose={() => togglePanel('character')} />
            </motion.div>
          )}

          {panels.quests && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '50%',
                right: 80,
                transform: 'translateY(-50%)',
                zIndex: 100,
              }}
            >
              <QuestLog onClose={() => togglePanel('quests')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Damage Numbers */}
        <DamageNumbers />

        {/* Notifications */}
        <Notifications notifications={notifications} />

        {/* Context Menu */}
        {contextMenu && <ContextMenu {...contextMenu} />}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}
      </UILayer>
    </GameContainer>
  );
};

export default GameWorld;