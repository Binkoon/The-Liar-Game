// ===== REALTIME SYNC =====
// 클라이언트 사이드 실시간 동기화 시스템

class RealtimeSync {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.storageKey = `liar_game_sync_${roomCode}`;
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.isHost = false;
    this.syncInterval = null;
    this.listeners = new Set();
    
    this.init();
  }

  init() {
    // 첫 번째 플레이어인지 확인 (호스트)
    const existingData = this.getSyncData();
    if (!existingData || Object.keys(existingData.players || {}).length === 0) {
      this.isHost = true;
    }

    // 동기화 시작
    this.startSync();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // 동기화 데이터 가져오기
  getSyncData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { players: {}, lastUpdate: 0 };
    } catch (error) {
      console.error('동기화 데이터 읽기 실패:', error);
      return { players: {}, lastUpdate: 0 };
    }
  }

  // 동기화 데이터 저장
  setSyncData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        ...data,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('동기화 데이터 저장 실패:', error);
    }
  }

  // 플레이어 추가
  addPlayer(playerData) {
    const syncData = this.getSyncData();
    syncData.players[this.playerId] = {
      ...playerData,
      id: this.playerId,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      status: 'playing', // 'playing' 또는 'spectating'
      isHost: playerData.isHost || false
    };
    this.setSyncData(syncData);
    this.notifyListeners('playerAdded', syncData.players[this.playerId]);
    
    // 즉시 동기화 (중요한 변경사항)
    this.forceSync();
  }

  // 플레이어 제거
  removePlayer(playerId) {
    const syncData = this.getSyncData();
    if (syncData.players[playerId]) {
      delete syncData.players[playerId];
      this.setSyncData(syncData);
      this.notifyListeners('playerRemoved', playerId);
    }
  }

  // 플레이어 업데이트
  updatePlayer(playerId, updates) {
    const syncData = this.getSyncData();
    if (syncData.players[playerId]) {
      syncData.players[playerId] = {
        ...syncData.players[playerId],
        ...updates,
        lastSeen: Date.now()
      };
      this.setSyncData(syncData);
      this.notifyListeners('playerUpdated', syncData.players[playerId]);
    }
  }

  // 플레이어 상태 변경 (참여/관전)
  togglePlayerStatus(playerId) {
    const syncData = this.getSyncData();
    if (syncData.players[playerId]) {
      const currentStatus = syncData.players[playerId].status;
      const newStatus = currentStatus === 'playing' ? 'spectating' : 'playing';
      
      syncData.players[playerId] = {
        ...syncData.players[playerId],
        status: newStatus,
        lastSeen: Date.now()
      };
      this.setSyncData(syncData);
      this.notifyListeners('playerStatusChanged', syncData.players[playerId]);
      
      // 즉시 동기화 (중요한 변경사항)
      this.forceSync();
    }
  }

  // 게임 상태 업데이트
  updateGameState(gameState) {
    const syncData = this.getSyncData();
    syncData.gameState = {
      ...gameState,
      updatedAt: Date.now()
    };
    this.setSyncData(syncData);
    this.notifyListeners('gameStateUpdated', syncData.gameState);
    
    // 즉시 동기화 (중요한 변경사항)
    this.forceSync();
  }

  // 모든 플레이어 가져오기
  getAllPlayers() {
    const syncData = this.getSyncData();
    return Object.values(syncData.players || {});
  }

  // 게임 상태 가져오기
  getGameState() {
    const syncData = this.getSyncData();
    return syncData.gameState || null;
  }

  // 동기화 시작
  startSync() {
    // 1초마다 동기화 체크 (실시간성 향상)
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 1000);
  }

  // 강제 동기화 (중요한 변경사항)
  forceSync() {
    this.sync();
  }

  // 동기화 실행
  sync() {
    const syncData = this.getSyncData();
    const currentTime = Date.now();
    let hasChanges = false;
    
    // 30초 이상 접속하지 않은 플레이어 제거
    Object.keys(syncData.players || {}).forEach(playerId => {
      const player = syncData.players[playerId];
      if (currentTime - player.lastSeen > 30000) { // 30초
        delete syncData.players[playerId];
        hasChanges = true;
      }
    });

    // 현재 플레이어의 lastSeen 업데이트
    if (syncData.players[this.playerId]) {
      const lastSeen = syncData.players[this.playerId].lastSeen;
      syncData.players[this.playerId].lastSeen = currentTime;
      
      // 5초 이상 지났을 때만 업데이트
      if (currentTime - lastSeen > 5000) {
        hasChanges = true;
      }
    }

    // 변경사항이 있을 때만 저장 및 알림
    if (hasChanges) {
      this.setSyncData(syncData);
      this.notifyListeners('sync', syncData);
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

  // 정리
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // 호스트가 나가면 모든 데이터 삭제
    if (this.isHost) {
      localStorage.removeItem(this.storageKey);
    } else {
      // 일반 플레이어는 자신만 제거
      this.removePlayer(this.playerId);
    }
  }

  // 방 코드 변경
  changeRoom(roomCode) {
    this.cleanup();
    this.roomCode = roomCode;
    this.storageKey = `liar_game_sync_${roomCode}`;
    this.init();
  }
}

// 싱글톤 인스턴스
let syncInstance = null;

export const initRealtimeSync = (roomCode) => {
  if (syncInstance) {
    syncInstance.changeRoom(roomCode);
  } else {
    syncInstance = new RealtimeSync(roomCode);
  }
  return syncInstance;
};

export const getRealtimeSync = () => {
  return syncInstance;
};

export const cleanupRealtimeSync = () => {
  if (syncInstance) {
    syncInstance.cleanup();
    syncInstance = null;
  }
};
