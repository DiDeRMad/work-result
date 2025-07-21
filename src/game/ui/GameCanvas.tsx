'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { motion } from 'framer-motion';
import { useSound } from 'use-sound';
import toast from 'react-hot-toast';

interface GameCanvasProps {
  player: any;
  socket: any;
  gameState: any;
}

interface Entity {
  id: string;
  x: number;
  y: number;
  type: 'player' | 'npc' | 'object' | 'effect';
  name?: string;
  level?: number;
  health?: number;
  maxHealth?: number;
  sprite?: string;
  color?: string;
  size?: number;
  rotation?: number;
  animation?: string;
}

interface Tile {
  x: number;
  y: number;
  type: string;
  color: string;
  biome?: string;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

const GameCanvas: React.FC<GameCanvasProps> = ({ player, socket, gameState }) => {
  const stageRef = useRef<any>(null);
  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1
  });
  
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [worldTiles, setWorldTiles] = useState<Tile[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [fps, setFps] = useState(0);
  
  const [playWalk] = useSound('/sounds/walk.mp3', { volume: 0.3 });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });

  // Initialize world tiles
  useEffect(() => {
    const tiles: Tile[] = [];
    const worldSize = 50;
    
    for (let x = -worldSize; x < worldSize; x++) {
      for (let y = -worldSize; y < worldSize; y++) {
        const distance = Math.sqrt(x * x + y * y);
        let type = 'grass';
        let color = '#4a7c59';
        let biome = 'forest';
        
        if (distance < 5) {
          type = 'stone';
          color = '#8b8680';
          biome = 'town';
        } else if (distance > 30) {
          type = 'water';
          color = '#4682b4';
          biome = 'ocean';
        } else if (Math.random() > 0.8) {
          type = 'dirt';
          color = '#8b4513';
        }
        
        tiles.push({
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
          type,
          color,
          biome
        });
      }
    }
    
    setWorldTiles(tiles);
  }, []);

  // Camera controls
  const updateCamera = useCallback(() => {
    if (player) {
      const targetX = player.position?.x || 0;
      const targetY = player.position?.y || 0;
      
      setCamera(prev => {
        const smoothFactor = 0.1;
        const newX = prev.x + (targetX - prev.x) * smoothFactor;
        const newY = prev.y + (targetY - prev.y) * smoothFactor;
        const newZoom = prev.zoom + (prev.targetZoom - prev.zoom) * smoothFactor;
        
        return {
          ...prev,
          x: newX,
          y: newY,
          zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
        };
      });
    }
  }, [player]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateCamera();
      
      // Update FPS
      const now = Date.now();
      const deltaTime = now - lastUpdate;
      setFps(Math.round(1000 / deltaTime));
      setLastUpdate(now);
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [updateCamera, lastUpdate]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleWorldUpdate = (data: any) => {
      if (data.entities) {
        const newEntities = new Map<string, Entity>();
        
        // Add players
        if (data.entities.players) {
          Object.values(data.entities.players).forEach((playerData: any) => {
            newEntities.set(playerData.userId, {
              id: playerData.userId,
              x: playerData.position?.x || 0,
              y: playerData.position?.y || 0,
              type: 'player',
              name: playerData.characterName,
              level: playerData.level,
              health: playerData.stats?.health,
              maxHealth: playerData.stats?.maxHealth,
              color: '#4a90e2',
              size: 16
            });
          });
        }

        // Add NPCs
        if (data.entities.npcs) {
          Object.values(data.entities.npcs).forEach((npc: any) => {
            newEntities.set(npc.id, {
              id: npc.id,
              x: npc.position?.x || 0,
              y: npc.position?.y || 0,
              type: 'npc',
              name: npc.name,
              level: npc.level,
              health: npc.health,
              maxHealth: npc.maxHealth,
              color: npc.isHostile ? '#e74c3c' : '#f39c12',
              size: 14
            });
          });
        }

        // Add objects
        if (data.entities.objects) {
          Object.values(data.entities.objects).forEach((obj: any) => {
            newEntities.set(obj.id, {
              id: obj.id,
              x: obj.position?.x || 0,
              y: obj.position?.y || 0,
              type: 'object',
              name: obj.name,
              color: obj.isInteractable ? '#2ecc71' : '#95a5a6',
              size: 12
            });
          });
        }

        setEntities(newEntities);
      }
    };

    const handlePlayerMove = (data: any) => {
      if (data.success && data.playerId === player?.userId) {
        // Update local player position immediately for responsiveness
        setEntities(prev => {
          const newEntities = new Map(prev);
          const playerEntity = newEntities.get(player.userId);
          if (playerEntity) {
            playerEntity.x = data.position.x;
            playerEntity.y = data.position.y;
            newEntities.set(player.userId, playerEntity);
          }
          return newEntities;
        });
      }
    };

    socket.on('world_update', handleWorldUpdate);
    socket.on('player_moved', handlePlayerMove);

    return () => {
      socket.off('world_update', handleWorldUpdate);
      socket.off('player_moved', handlePlayerMove);
    };
  }, [socket, player]);

  // Handle click to move
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!socket || !player) return;

    playClick();
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // Convert screen coordinates to world coordinates
    const worldX = (pointerPosition.x - VIEWPORT_WIDTH / 2) / camera.zoom + camera.x;
    const worldY = (pointerPosition.y - VIEWPORT_HEIGHT / 2) / camera.zoom + camera.y;

    // Send move command to server
    socket.emit('player_move', {
      playerId: player.userId,
      targetPosition: { x: worldX, y: worldY }
    });
  }, [socket, player, camera, playClick]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    setCamera(prev => {
      const newZoom = e.evt.deltaY > 0 
        ? Math.max(MIN_ZOOM, prev.targetZoom / scaleBy)
        : Math.min(MAX_ZOOM, prev.targetZoom * scaleBy);
      
      return {
        ...prev,
        targetZoom: newZoom
      };
    });
  }, []);

  // Handle entity click
  const handleEntityClick = useCallback((entityId: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    playClick();
    
    setSelectedEntity(prev => prev === entityId ? null : entityId);
    
    const entity = entities.get(entityId);
    if (entity && socket && player) {
      if (entity.type === 'npc') {
        socket.emit('interact_with_npc', { 
          playerId: player.userId, 
          npcId: entityId 
        });
      } else if (entity.type === 'object') {
        socket.emit('interact_with_object', { 
          playerId: player.userId, 
          objectId: entityId 
        });
      } else if (entity.type === 'player' && entity.id !== player.userId) {
        socket.emit('inspect_player', { 
          playerId: player.userId, 
          targetId: entityId 
        });
      }
    }
  }, [entities, socket, player, playClick]);

  // Render entity
  const renderEntity = useCallback((entity: Entity) => {
    const screenX = (entity.x - camera.x) * camera.zoom + VIEWPORT_WIDTH / 2;
    const screenY = (entity.y - camera.y) * camera.zoom + VIEWPORT_HEIGHT / 2;
    
    // Culling - don't render if outside viewport
    if (screenX < -50 || screenX > VIEWPORT_WIDTH + 50 || 
        screenY < -50 || screenY > VIEWPORT_HEIGHT + 50) {
      return null;
    }

    const isSelected = selectedEntity === entity.id;
    const isPlayer = entity.id === player?.userId;
    
    return (
      <Group key={entity.id} x={screenX} y={screenY}>
        {/* Entity selection indicator */}
        {isSelected && (
          <Circle
            radius={(entity.size || 16) + 8}
            stroke="#ffff00"
            strokeWidth={2}
            dash={[5, 5]}
          />
        )}
        
        {/* Player indicator */}
        {isPlayer && (
          <Circle
            radius={(entity.size || 16) + 12}
            stroke="#00ff00"
            strokeWidth={3}
            opacity={0.6}
          />
        )}
        
        {/* Entity body */}
        <Circle
          radius={entity.size || 16}
          fill={entity.color || '#ffffff'}
          stroke="#000000"
          strokeWidth={1}
          onClick={(e) => handleEntityClick(entity.id, e)}
          onTap={(e) => handleEntityClick(entity.id, e)}
        />
        
        {/* Health bar */}
        {entity.health !== undefined && entity.maxHealth && entity.maxHealth > 0 && (
          <Group y={-(entity.size || 16) - 15}>
            <Rect
              x={-15}
              y={0}
              width={30}
              height={4}
              fill="#333333"
            />
            <Rect
              x={-15}
              y={0}
              width={30 * (entity.health / entity.maxHealth)}
              height={4}
              fill={entity.health > entity.maxHealth * 0.5 ? "#2ecc71" : 
                   entity.health > entity.maxHealth * 0.2 ? "#f39c12" : "#e74c3c"}
            />
          </Group>
        )}
        
        {/* Entity name and level */}
        {entity.name && (
          <Text
            x={-entity.name.length * 3}
            y={(entity.size || 16) + 5}
            text={`${entity.name}${entity.level ? ` (${entity.level})` : ''}`}
            fontSize={10}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1}
          />
        )}
      </Group>
    );
  }, [camera, selectedEntity, player, handleEntityClick]);

  // Render world tiles
  const renderTiles = useCallback(() => {
    const visibleTiles = worldTiles.filter(tile => {
      const screenX = (tile.x - camera.x) * camera.zoom + VIEWPORT_WIDTH / 2;
      const screenY = (tile.y - camera.y) * camera.zoom + VIEWPORT_HEIGHT / 2;
      return screenX > -TILE_SIZE && screenX < VIEWPORT_WIDTH + TILE_SIZE &&
             screenY > -TILE_SIZE && screenY < VIEWPORT_HEIGHT + TILE_SIZE;
    });

    return visibleTiles.map((tile, index) => {
      const screenX = (tile.x - camera.x) * camera.zoom + VIEWPORT_WIDTH / 2;
      const screenY = (tile.y - camera.y) * camera.zoom + VIEWPORT_HEIGHT / 2;
      
      return (
        <Rect
          key={`${tile.x}-${tile.y}`}
          x={screenX}
          y={screenY}
          width={TILE_SIZE * camera.zoom}
          height={TILE_SIZE * camera.zoom}
          fill={tile.color}
          stroke={showGrid ? "#333333" : "transparent"}
          strokeWidth={showGrid ? 0.5 : 0}
        />
      );
    });
  }, [worldTiles, camera, showGrid]);

  // Render grid
  const renderGrid = useCallback(() => {
    if (!showGrid) return null;

    const lines = [];
    const gridSize = TILE_SIZE * camera.zoom;
    const offsetX = ((camera.x * camera.zoom) % gridSize);
    const offsetY = ((camera.y * camera.zoom) % gridSize);

    // Vertical lines
    for (let i = -offsetX; i < VIEWPORT_WIDTH + gridSize; i += gridSize) {
      lines.push(
        <Rect
          key={`v-${i}`}
          x={i}
          y={0}
          width={1}
          height={VIEWPORT_HEIGHT}
          fill="#333333"
          opacity={0.3}
        />
      );
    }

    // Horizontal lines
    for (let i = -offsetY; i < VIEWPORT_HEIGHT + gridSize; i += gridSize) {
      lines.push(
        <Rect
          key={`h-${i}`}
          x={0}
          y={i}
          width={VIEWPORT_WIDTH}
          height={1}
          fill="#333333"
          opacity={0.3}
        />
      );
    }

    return lines;
  }, [showGrid, camera]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Game Canvas */}
      <Stage
        ref={stageRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        onClick={handleStageClick}
        onWheel={handleWheel}
        className="border border-gray-600"
      >
        {/* Background Layer */}
        <Layer>
          <Rect width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT} fill="#1a1a2e" />
        </Layer>
        
        {/* World Tiles Layer */}
        <Layer>
          {renderTiles()}
        </Layer>
        
        {/* Entities Layer */}
        <Layer>
          {Array.from(entities.values()).map(renderEntity)}
        </Layer>
        
        {/* Grid Layer */}
        <Layer>
          {renderGrid()}
        </Layer>
        
        {/* UI Layer */}
        <Layer>
          {/* Crosshair */}
          <Group x={VIEWPORT_WIDTH / 2} y={VIEWPORT_HEIGHT / 2}>
            <Rect x={-10} y={-1} width={20} height={2} fill="#ffffff" opacity={0.5} />
            <Rect x={-1} y={-10} width={2} height={20} fill="#ffffff" opacity={0.5} />
          </Group>
        </Layer>
      </Stage>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 space-y-2"
      >
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showGrid ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Сетка
        </button>
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showDebugInfo ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Debug
        </button>
      </motion.div>

      {/* Debug Info */}
      {showDebugInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs space-y-1"
        >
          <div>FPS: {fps}</div>
          <div>Camera: ({Math.round(camera.x)}, {Math.round(camera.y)})</div>
          <div>Zoom: {camera.zoom.toFixed(2)}</div>
          <div>Entities: {entities.size}</div>
          <div>Tiles: {worldTiles.length}</div>
          {player && (
            <div>Player: ({Math.round(player.position?.x || 0)}, {Math.round(player.position?.y || 0)})</div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded text-sm"
      >
        Кликните для перемещения • Колесо мыши для зума • Кликните на персонажей для взаимодействия
      </motion.div>

      {/* Entity Info Panel */}
      {selectedEntity && entities.has(selectedEntity) && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-slate-800 border border-blue-500/30 rounded-lg p-4 min-w-[200px]"
        >
          {(() => {
            const entity = entities.get(selectedEntity)!;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{entity.name || 'Неизвестно'}</h4>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                {entity.level && (
                  <div className="text-sm text-gray-300">
                    Уровень: <span className="text-yellow-400">{entity.level}</span>
                  </div>
                )}
                
                {entity.health !== undefined && entity.maxHealth && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300">Здоровье:</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          entity.health > entity.maxHealth * 0.5 ? 'bg-green-500' :
                          entity.health > entity.maxHealth * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(entity.health / entity.maxHealth) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      {entity.health} / {entity.maxHealth}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 capitalize">
                  Тип: {entity.type === 'player' ? 'Игрок' : 
                        entity.type === 'npc' ? 'NPC' : 
                        entity.type === 'object' ? 'Объект' : entity.type}
                </div>
                
                <div className="text-xs text-gray-400">
                  Позиция: ({Math.round(entity.x)}, {Math.round(entity.y)})
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default GameCanvas;