// Valtio와 Firebase 동기화를 위한 유틸리티
import { gameState } from '../stores/valtioGameStore';
import { subscribe } from 'valtio';

// Firebase와 Valtio 상태 동기화
export const syncWithFirebase = (roomCode) => {
  if (typeof window === 'undefined' || !window.realtimeSync) {
    console.warn('Firebase 동기화를 위한 realtimeSync가 없습니다.');
    return;
  }

  const sync = window.realtimeSync;
  
  // Firebase에서 Valtio로 데이터 동기화
  const syncFromFirebase = (firebaseData) => {
    
    // 게임 상태 동기화
    if (firebaseData.gameState) {
      Object.assign(gameState.gameState, firebaseData.gameState);
    }
    
    // 기타 상태 동기화
    if (firebaseData.gamePhase) {
      gameState.gamePhase = firebaseData.gamePhase;
    }
    if (firebaseData.showRoleAssignment !== undefined) {
      gameState.showRoleAssignment = firebaseData.showRoleAssignment;
    }
    if (firebaseData.currentSpeaker) {
      gameState.currentSpeaker = firebaseData.currentSpeaker;
    }
  };

  // Valtio에서 Firebase로 데이터 동기화
  const syncToFirebase = (valtioData) => {
    
    if (sync && sync.updateGameState) {
      sync.updateGameState(valtioData);
    }
  };

  // Firebase 리스너 등록
  const handleFirebaseUpdate = (event, data) => {
    if (event === 'gameStateUpdated') {
      syncFromFirebase(data);
    }
  };
  
  sync.addListener(handleFirebaseUpdate);

  // Valtio 변경 감지 및 Firebase 동기화
  let unsubscribeValtio = null;
  
  if (sync && sync.updateGameState) {
    // Valtio 상태 변경 시 Firebase에 동기화
    unsubscribeValtio = subscribe(gameState, () => {
      const valtioData = {
        gameState: gameState.gameState,
        gamePhase: gameState.gamePhase,
        showRoleAssignment: gameState.showRoleAssignment,
        currentSpeaker: gameState.currentSpeaker,
        suspectedPlayer: gameState.suspectedPlayer,
        explanations: gameState.explanations,
        chatMessages: gameState.chatMessages
      };
      
      syncToFirebase(valtioData);
    });
  }
  
  return {
    syncFromFirebase,
    syncToFirebase,
    cleanup: () => {
      // Valtio 구독 해제
      if (unsubscribeValtio) {
        unsubscribeValtio();
      }
      
      // Firebase 리스너 정리
      if (sync && sync.removeListener) {
        sync.removeListener(handleFirebaseUpdate);
      }
    }
  };
};

// 게임 상태를 Firebase에 저장
export const saveGameStateToFirebase = (roomCode) => {
  if (typeof window === 'undefined' || !window.realtimeSync) {
    return;
  }

  const sync = window.realtimeSync;
  
  const gameData = {
    gameState: gameState.gameState,
    gamePhase: gameState.gamePhase,
    showRoleAssignment: gameState.showRoleAssignment,
    currentSpeaker: gameState.currentSpeaker,
    suspectedPlayer: gameState.suspectedPlayer,
    explanations: gameState.explanations,
    chatMessages: gameState.chatMessages
  };

  sync.updateGameState(gameData);
};

// 플레이어 상태를 Firebase에 저장
export const savePlayerStateToFirebase = (roomCode) => {
  if (typeof window === 'undefined' || !window.realtimeSync) {
    return;
  }

  const sync = window.realtimeSync;
  
  // 현재 플레이어 정보 업데이트
  if (gameState.currentPlayerId) {
    const currentPlayer = gameState.gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (currentPlayer) {
      sync.updatePlayer(currentPlayer);
    }
  }
};
