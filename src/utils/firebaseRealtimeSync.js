// ===== FIREBASE REALTIME SYNC =====
// Firebase Realtime Database 기반 실시간 동기화 시스템

import { database } from '../../firebaseInit.js';
import { 
  ref, 
  set, 
  get, 
  onValue, 
  off, 
  push, 
  remove, 
  update,
  serverTimestamp 
} from 'firebase/database';

class FirebaseRealtimeSync {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.isHost = false;
    this.listeners = new Set();
    this.roomRef = ref(database, `rooms/${roomCode}`);
    this.playersRef = ref(database, `rooms/${roomCode}/players`);
    this.gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
    this.playerRef = ref(database, `rooms/${roomCode}/players/${this.playerId}`);
    
    this.init();
  }

  async init() {
    try {
      // 첫 번째 플레이어인지 확인 (호스트)
      const snapshot = await get(this.playersRef);
      if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
        this.isHost = true;
        // 방 생성 시 타임스탬프 추가
        await set(ref(database, `rooms/${this.roomCode}/createdAt`), serverTimestamp());
      }

      // 실시간 리스너 등록
      this.setupRealtimeListeners();
      
      // 현재 플레이어 등록
      await this.registerPlayer();
      
    } catch (error) {
      console.error('Firebase 동기화 초기화 실패:', error);
    }
  }

  // 실시간 리스너 설정
  setupRealtimeListeners() {
    // 플레이어 목록 변경 감지
    onValue(this.playersRef, (snapshot) => {
      const players = snapshot.val() || {};
      this.notifyListeners('playersUpdated', { players });
    });

    // 게임 상태 변경 감지
    onValue(this.gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        this.notifyListeners('gameStateUpdated', gameState);
      }
    });
  }

  // 플레이어 등록
  async registerPlayer(playerData = {}) {
    try {
      const player = {
        id: this.playerId,
        name: playerData.name || 'Unknown Player',
        isHost: this.isHost,
        status: playerData.status || 'playing',
        lastSeen: serverTimestamp(),
        ...playerData
      };

      await set(this.playerRef, player);
      return player;
    } catch (error) {
      console.error('플레이어 등록 실패:', error);
      throw error;
    }
  }

  // 플레이어 업데이트
  async updatePlayer(playerData) {
    try {
      const updates = {
        ...playerData,
        lastSeen: serverTimestamp()
      };
      
      await update(this.playerRef, updates);
    } catch (error) {
      console.error('플레이어 업데이트 실패:', error);
      throw error;
    }
  }

  // 플레이어 제거
  async removePlayer() {
    try {
      await remove(this.playerRef);
    } catch (error) {
      console.error('플레이어 제거 실패:', error);
      throw error;
    }
  }

  // 게임 상태 업데이트
  async updateGameState(gameState) {
    try {
      const updates = {
        ...gameState,
        lastUpdated: serverTimestamp(),
        // 자동 정리를 위한 타임스탬프 추가
        createdAt: gameState.createdAt || serverTimestamp()
      };
      
      await set(this.gameStateRef, updates);
    } catch (error) {
      console.error('게임 상태 업데이트 실패:', error);
      throw error;
    }
  }

  // 게임 상태 가져오기
  async getGameState() {
    try {
      const snapshot = await get(this.gameStateRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('게임 상태 가져오기 실패:', error);
      return null;
    }
  }

  // 모든 플레이어 가져오기
  async getAllPlayers() {
    try {
      const snapshot = await get(this.playersRef);
      if (!snapshot.exists()) return [];
      
      const players = snapshot.val();
      return Object.values(players).filter(player => 
        player && Date.now() - player.lastSeen < 30000 // 30초 이내 접속한 플레이어만
      );
    } catch (error) {
      console.error('플레이어 목록 가져오기 실패:', error);
      return [];
    }
  }

  // 리스너 등록
  addListener(callback) {
    this.listeners.add(callback);
  }

  // 리스너 제거
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // 리스너들에게 알림
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('리스너 실행 실패:', error);
      }
    });
  }

  // 자동 정리 기능 (24시간 후 방 삭제)
  async autoCleanup() {
    try {
      const roomSnapshot = await get(this.roomRef);
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        const now = Date.now();
        
        // 24시간(86400000ms) 이상 된 방은 삭제
        if (roomData.createdAt && (now - roomData.createdAt) > 86400000) {
          await remove(this.roomRef);
          console.log('오래된 방이 자동으로 삭제되었습니다:', this.roomCode);
        }
      }
    } catch (error) {
      console.error('자동 정리 실패:', error);
    }
  }

  // 정리
  cleanup() {
    try {
      // 리스너 제거
      off(this.playersRef);
      off(this.gameStateRef);
      
      // 플레이어 제거
      this.removePlayer();
      
      // 리스너 목록 정리
      this.listeners.clear();
      
      // 자동 정리 실행
      this.autoCleanup();
    } catch (error) {
      console.error('정리 실패:', error);
    }
  }

  // 방 변경
  changeRoom(roomCode) {
    this.cleanup();
    this.roomCode = roomCode;
    this.roomRef = ref(database, `rooms/${roomCode}`);
    this.playersRef = ref(database, `rooms/${roomCode}/players`);
    this.gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
    this.playerRef = ref(database, `rooms/${roomCode}/players/${this.playerId}`);
    this.init();
  }
}

// 싱글톤 인스턴스
let syncInstance = null;

export const initFirebaseRealtimeSync = (roomCode) => {
  if (syncInstance) {
    syncInstance.changeRoom(roomCode);
  } else {
    syncInstance = new FirebaseRealtimeSync(roomCode);
  }
  return syncInstance;
};

export const getFirebaseRealtimeSync = () => {
  return syncInstance;
};

export const cleanupFirebaseRealtimeSync = () => {
  if (syncInstance) {
    syncInstance.cleanup();
    syncInstance = null;
  }
};
