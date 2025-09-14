// ===== ROOM MANAGER =====
// URL 기반 방 관리 및 세션 복구 시스템

// 랜덤 방 코드 생성 (6자리 영숫자)
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 현재 URL에서 방 코드 추출 (새로운 라우팅 구조 지원)
export const getRoomCodeFromURL = () => {
  const path = window.location.pathname;
  // 새로운 라우팅: /room/roomCode/action
  const newMatch = path.match(/\/room\/([A-Z0-9]{6})\/(create|join)/);
  if (newMatch) return newMatch[1];
  
  // 기존 라우팅: /game/roomCode (하위 호환성)
  const legacyMatch = path.match(/\/game\/([A-Z0-9]{6})/);
  return legacyMatch ? legacyMatch[1] : null;
};

// 방 URL 생성 (새로운 라우팅 구조)
export const createRoomURL = (roomCode, action = 'join') => {
  const baseURL = window.location.origin;
  return `${baseURL}/room/${roomCode}/${action}`;
};

// 기존 방 URL 생성 (하위 호환성)
export const createLegacyRoomURL = (roomCode) => {
  const baseURL = window.location.origin;
  return `${baseURL}/game/${roomCode}`;
};

// localStorage 키 생성
export const getStorageKey = (roomCode) => `liar_game_${roomCode}`;

// 게임 상태 저장
export const saveGameState = (roomCode, gameState) => {
  try {
    const storageKey = getStorageKey(roomCode);
    const data = {
      ...gameState,
      lastSaved: Date.now(),
      version: '1.0.0'
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('게임 상태 저장 실패:', error);
    return false;
  }
};

// 게임 상태 복구
export const loadGameState = (roomCode) => {
  try {
    const storageKey = getStorageKey(roomCode);
    const data = localStorage.getItem(storageKey);
    
    if (!data) return null;
    
    const gameState = JSON.parse(data);
    
    // 24시간 이내 데이터만 유효
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    if (Date.now() - gameState.lastSaved > maxAge) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return gameState;
  } catch (error) {
    console.error('게임 상태 복구 실패:', error);
    return null;
  }
};

// 게임 상태 삭제
export const clearGameState = (roomCode) => {
  try {
    const storageKey = getStorageKey(roomCode);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('게임 상태 삭제 실패:', error);
    return false;
  }
};

// 모든 게임 상태 정리 (오래된 데이터)
export const cleanupOldGameStates = () => {
  try {
    const keys = Object.keys(localStorage);
    const gameKeys = keys.filter(key => key.startsWith('liar_game_'));
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    
    gameKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Date.now() - data.lastSaved > maxAge) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // 잘못된 데이터는 삭제
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('오래된 게임 상태 정리 실패:', error);
  }
};

// URL 업데이트 (히스토리 API 사용)
export const updateURL = (roomCode, replace = false) => {
  const newURL = createRoomURL(roomCode);
  
  if (replace) {
    window.history.replaceState({ roomCode }, '', newURL);
  } else {
    window.history.pushState({ roomCode }, '', newURL);
  }
};

// 브라우저 뒤로가기 처리
export const setupPopstateHandler = (onRoomChange) => {
  const handlePopstate = (event) => {
    const roomCode = getRoomCodeFromURL();
    if (roomCode) {
      onRoomChange(roomCode);
    }
  };
  
  window.addEventListener('popstate', handlePopstate);
  
  // 정리 함수 반환
  return () => {
    window.removeEventListener('popstate', handlePopstate);
  };
};

// QR 코드 생성용 데이터 URL
export const generateQRData = (roomCode) => {
  const roomURL = createRoomURL(roomCode, 'join');
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomURL)}`;
};

// 링크 복사
export const copyRoomLink = async (roomCode) => {
  const roomURL = createRoomURL(roomCode, 'join');
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(roomURL);
      return { success: true, message: '링크가 복사되었습니다!' };
    } else {
      // 폴백: 텍스트 영역 사용
      const textArea = document.createElement('textarea');
      textArea.value = roomURL;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return { 
        success, 
        message: success ? '링크가 복사되었습니다!' : '복사에 실패했습니다.' 
      };
    }
  } catch (error) {
    console.error('링크 복사 실패:', error);
    return { success: false, message: '복사에 실패했습니다.' };
  }
};
