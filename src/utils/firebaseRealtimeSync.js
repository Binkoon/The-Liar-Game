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
    console.log('FirebaseRealtimeSync 생성자 호출:', roomCode);
    
    if (!database) {
      console.error('Firebase Database가 초기화되지 않았습니다!');
      throw new Error('Firebase Database 초기화 실패');
    }
    
    this.roomCode = roomCode;
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.isHost = false;
    this.listeners = new Set();
    this.roomRef = ref(database, `rooms/${roomCode}`);
    this.playersRef = ref(database, `rooms/${roomCode}/players`);
    this.gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
    this.playerRef = ref(database, `rooms/${roomCode}/players/${this.playerId}`);
    
    console.log('Firebase Refs 생성됨:', {
      roomRef: this.roomRef,
      playersRef: this.playersRef,
      gameStateRef: this.gameStateRef,
      playerRef: this.playerRef
    });
    
    this.init();
  }

  async init() {
    try {
      console.log('Firebase 동기화 초기화 시작:', this.roomCode);
      
      // 실시간 리스너 등록 (먼저 등록)
      this.setupRealtimeListeners();
      console.log('실시간 리스너 등록됨');
      
      // 첫 번째 플레이어인지 확인 (호스트)
      const snapshot = await get(this.playersRef);
      console.log('기존 플레이어 확인:', snapshot.exists() ? snapshot.val() : '없음');
      
      if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
        this.isHost = true;
        console.log('호스트로 설정됨 - isHost:', this.isHost);
        // 방 생성 시 타임스탬프 추가
        await set(ref(database, `rooms/${this.roomCode}/createdAt`), serverTimestamp());
        console.log('방 생성 타임스탬프 추가됨');
      } else {
        console.log('기존 플레이어가 있어서 게스트로 설정됨 - isHost:', this.isHost);
      }

      // 현재 플레이어 등록
      await this.registerPlayer();
      console.log('플레이어 등록 완료');
      
    } catch (error) {
      console.error('Firebase 동기화 초기화 실패:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
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

    // 방 삭제 감지 (호스트 퇴장 시)
    onValue(this.roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log('방이 삭제되었습니다 (호스트 퇴장)');
        this.notifyListeners('roomDeleted', null);
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

      console.log('플레이어 등록 시도:', {
        playerId: this.playerId,
        name: player.name,
        isHost: this.isHost,
        playerData: playerData
      });

      await set(this.playerRef, player);
      console.log('플레이어 등록 성공 - isHost:', this.isHost);
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
      console.log('updateGameState 호출됨:', gameState);
      
      const updates = {
        ...gameState,
        lastUpdated: serverTimestamp(),
        // 자동 정리를 위한 타임스탬프 추가
        createdAt: gameState.createdAt || serverTimestamp()
      };
      
      console.log('Firebase에 업데이트할 데이터:', updates);
      await set(this.gameStateRef, updates);
      console.log('게임 상태 업데이트 성공');
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
        player && player.id && player.name // 기본적인 유효성만 확인
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

  // 호스트 퇴장 시 방 즉시 삭제
  async deleteRoom() {
    try {
      console.log('호스트 퇴장으로 인한 방 삭제:', this.roomCode);
      await remove(this.roomRef);
      console.log('방 삭제 완료:', this.roomCode);
    } catch (error) {
      console.error('방 삭제 실패:', error);
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
