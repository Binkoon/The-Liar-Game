import React, { createContext, useContext } from 'react';
import { useSnapshot } from 'valtio';
import { gameState, useGameActions } from '../stores/valtioGameStore';

// Game Context 생성
const GameContext = createContext();

// Game Provider 컴포넌트
export const GameProvider = ({ children }) => {
  // Valtio 상태 구독
  const snap = useSnapshot(gameState);
  const actions = useGameActions();
  
  // Context 값 구성
  const contextValue = {
    // 상태
    ...snap,
    // 액션들
    actions
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom Hook for using Game Context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};

// 편의를 위한 개별 훅들
export const useGameState = () => {
  const { gameState: gameStateData, ...rest } = useGame();
  return { gameState: gameStateData, ...rest };
};

export const useGameActionsFromContext = () => {
  const { actions } = useGame();
  return actions;
};

export const useGamePhase = () => {
  const { gamePhase } = useGame();
  return gamePhase;
};

export const useCurrentPlayer = () => {
  const { actions } = useGame();
  return actions.getCurrentPlayer();
};

export const useCurrentSpeaker = () => {
  const { actions } = useGame();
  return actions.getCurrentSpeaker();
};

export const useVoteResult = () => {
  const { actions } = useGame();
  return actions.calculateVoteResult();
};

export default GameContext;
