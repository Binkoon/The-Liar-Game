import { io } from 'socket.io-client'
import { SOCKET_EVENTS } from '../data/game-types'
import { GameError, ERROR_TYPES, ERROR_MESSAGES, handleError, retryOperation } from './error-handler'

class SocketClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.roomId = null
    this.sessionId = null
    this.playerName = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.maxReconnectDelay = 30000
    this.reconnectTimer = null
    this.eventListeners = new Map()
    this.pendingMessages = []
    this._isReconnecting = false
  }

  // Socket 연결
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    try {
      this.socket = io(process.env.NODE_ENV === 'production' 
        ? 'https://the-liar-game.vercel.app'
        : 'http://localhost:3000', {
        transports: ['polling', 'websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        maxReconnectionAttempts: 5,
        forceNew: true,
        withCredentials: true
      })

      this.setupEventListeners()
      return this.socket
    } catch (error) {
      const gameError = handleError(error, { action: 'socket_connect' })
      throw gameError
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    if (!this.socket) return

    // 연결 성공
    this.socket.on('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      this._isReconnecting = false
      
      // 재연결 시 대기 중인 메시지들 전송
      this.flushPendingMessages()
      
      // 이벤트 리스너 재등록
      this.reregisterEventListeners()
    })

    // 연결 해제
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      
      // 의도적인 연결 해제가 아닌 경우 재연결 시도
      if (reason !== 'io client disconnect' && !this._isReconnecting) {
        this.scheduleReconnect()
      }
    })

    // 연결 에러
    this.socket.on('connect_error', (error) => {
      this.isConnected = false
      
      if (!this._isReconnecting) {
        this.scheduleReconnect()
      }
    })

    // 재연결 시도
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      // 재연결 시도 중
    })

    // 재연결 실패
    this.socket.on('reconnect_failed', () => {
      this._isReconnecting = false
      this.emit('reconnection_failed', new GameError(
        ERROR_TYPES.SOCKET,
        ERROR_MESSAGES[ERROR_TYPES.SOCKET].RECONNECTION_FAILED,
        'high'
      ))
    })
  }

  // 재연결 스케줄링
  scheduleReconnect() {
    if (this._isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this._isReconnecting = true
    this.reconnectAttempts++

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    )

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect()
    }, delay)
  }

  // 재연결 시도
  async attemptReconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect()
      }

      this.socket = null
      this.connect()

      // 재연결 후 방 재입장
      if (this.roomId && this.playerName && this.sessionId) {
        setTimeout(() => {
          this.joinRoom(this.roomId, this.playerName, this.sessionId)
        }, 1000)
      }
    } catch (error) {
      this.scheduleReconnect()
    }
  }

  // 대기 중인 메시지들 전송
  flushPendingMessages() {
    while (this.pendingMessages.length > 0) {
      const { event, data } = this.pendingMessages.shift()
      this.socket.emit(event, data)
    }
  }

  // 이벤트 리스너 재등록
  reregisterEventListeners() {
    for (const [event, callback] of this.eventListeners) {
      this.socket.on(event, callback)
    }
  }

  // Socket 연결 해제
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.isConnected = false
    this._isReconnecting = false
    this.reconnectAttempts = 0
    this.roomId = null
    this.sessionId = null
    this.playerName = null
    this.eventListeners.clear()
    this.pendingMessages = []
  }

  // 방 입장
  joinRoom(roomId, playerName, sessionId) {
    try {
      if (!this.socket) {
        this.connect()
      }

      this.roomId = roomId
      this.sessionId = sessionId
      this.playerName = playerName

      const joinData = {
        roomId,
        playerName,
        sessionId
      }

      if (this.isConnected) {
        this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, joinData)
      } else {
        // 연결되지 않은 경우 대기열에 추가
        this.pendingMessages.push({
          event: SOCKET_EVENTS.JOIN_ROOM,
          data: joinData
        })
      }
    } catch (error) {
      const gameError = handleError(error, { action: 'join_room', roomId, playerName })
      throw gameError
    }
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
      // 재연결을 위해 리스너 저장
      this.eventListeners.set(event, callback)
    }
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
      this.eventListeners.delete(event)
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
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      // 연결되지 않은 경우 대기열에 추가
      this.pendingMessages.push({ event, data })
    }
  }

  // 연결 상태 확인
  isSocketConnected() {
    return this.socket && this.isConnected
  }

  // 재연결 상태 확인
  get isReconnecting() {
    return this._isReconnecting
  }

  // 재연결 시도 횟수 확인
  getReconnectAttempts() {
    return this.reconnectAttempts
  }

  // 수동 재연결 시도
  manualReconnect() {
    if (this._isReconnecting) {
      return
    }

    this.reconnectAttempts = 0
    this.attemptReconnect()
  }
}

// 싱글톤 인스턴스
const socketClient = new SocketClient()

export default socketClient
