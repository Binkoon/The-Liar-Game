import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.database();

// 24시간마다 오래된 방들을 자동으로 정리하는 함수
export const cleanupOldRooms = functions.pubsub
  .schedule('0 0 * * *') // 매일 자정에 실행
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    console.log('오래된 방 정리 작업 시작');
    
    try {
      const roomsRef = db.ref('rooms');
      const snapshot = await roomsRef.once('value');
      
      if (!snapshot.exists()) {
        console.log('정리할 방이 없습니다.');
        return null;
      }
      
      const rooms = snapshot.val();
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24시간
      let deletedCount = 0;
      
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.createdAt && (now - room.createdAt) > oneDayInMs) {
          await roomsRef.child(roomId).remove();
          deletedCount++;
          console.log(`방 삭제됨: ${roomId}`);
        }
      }
      
      console.log(`총 ${deletedCount}개의 오래된 방이 삭제되었습니다.`);
      return null;
    } catch (error) {
      console.error('방 정리 중 오류 발생:', error);
      return null;
    }
  });

// 게임이 종료될 때 방을 즉시 정리하는 함수
export const cleanupGameRoom = functions.database
  .ref('/rooms/{roomId}/gameState/gamePhase')
  .onUpdate(async (change, context) => {
    const newPhase = change.after.val();
    const roomId = context.params.roomId;
    
    // 게임이 종료되면 5분 후에 방을 삭제
    if (newPhase === 'result') {
      console.log(`게임 종료 감지: ${roomId}, 5분 후 방 삭제 예약`);
      
      // 5분 후에 방을 삭제하는 작업 예약
      setTimeout(async () => {
        try {
          await db.ref(`rooms/${roomId}`).remove();
          console.log(`게임 종료 후 방 삭제됨: ${roomId}`);
        } catch (error) {
          console.error('게임 종료 후 방 삭제 실패:', error);
        }
      }, 5 * 60 * 1000); // 5분
    }
    
    return null;
  });
