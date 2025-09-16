import { io } from 'socket.io-client'
import { SOCKET_EVENTS } from '../data/game-types'

class SocketClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.roomId = null
    this.sessionId = null
  }

  // Socket 연결
  connect() {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    // 연결 이벤트
    this.socket.on('connect', () => {
      console.log('Socket 연결 성공:', this.socket.id)
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Socket 연결 해제')
      this.isConnected = false
    })

    // 에러 이벤트
    this.socket.on('connect_error', (error) => {
      console.error('Socket 연결 오류:', error)
      this.isConnected = false
    })

    return this.socket
  }

  // Socket 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.roomId = null
      this.sessionId = null
    }
  }

  // 방 입장
  joinRoom(roomId, playerName, sessionId) {
    if (!this.socket) {
      this.connect()
    }

    this.roomId = roomId
    this.sessionId = sessionId

    this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      playerName,
      sessionId
    })
  }

  // 게임 단계 변경 요청
  nextPhase() {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.NEXT_PHASE)
    }
  }

  // 라이어 확인 요청
  askIfImLiar() {
    if (this.socket && this.sessionId) {
      this.socket.emit(SOCKET_EVENTS.ASK_IF_IM_LIAR, {
        sessionId: this.sessionId
      })
    }
  }

  // 라이어 공개 요청
  revealLiar() {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.REVEAL_LIAR)
    }
  }

  // 설명하기
  speak(content) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.SPEAK, { content })
    }
  }

  // 투표하기
  vote(targetPlayerId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.VOTE, { targetPlayerId })
    }
  }

  // 이벤트 리스너 등록
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // 현재 연결 상태
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      roomId: this.roomId,
      sessionId: this.sessionId,
      socketId: this.socket?.id
    }
  }

  // Socket 이벤트 전송
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }
}

// 싱글톤 인스턴스
const socketClient = new SocketClient()

export default socketClient
