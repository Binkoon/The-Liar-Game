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
