import { create } from 'zustand'

const useRoomStore = create((set, get) => ({
  // 방 정보
  roomCode: null,
  roomId: null,
  hostId: null,
  isHost: false,
  
  // 연결 상태
  isConnected: false,
  connectionError: null,
  
  // 액션들
  setRoomCode: (code) => set({ roomCode: code }),
  setRoomId: (id) => set({ roomId: id }),
  setHostId: (id) => set({ hostId: id }),
  setIsHost: (isHost) => set({ isHost }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  setConnectionError: (error) => set({ connectionError: error }),
  
  // 방 생성
  createRoom: async () => {
    try {
      const response = await fetch('/api/rooms/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        set({
          roomCode: data.roomCode,
          isHost: true,
          hostId: 'current-user' // TODO: 실제 사용자 ID로 변경
        })
        return data.roomCode
      } else {
        throw new Error(data.error || '방 생성에 실패했습니다')
      }
    } catch (error) {
      set({ connectionError: error.message })
      throw error
    }
  },
  
  // 방 참가
  joinRoom: async (roomCode, playerName) => {
    try {
      const response = await fetch('/api/rooms/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomCode,
          playerName
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        set({
          roomCode,
          isHost: false
        })
        return data.player
      } else {
        throw new Error(data.error || '방 참가에 실패했습니다')
      }
    } catch (error) {
      set({ connectionError: error.message })
      throw error
    }
  },
  
  // 방 퇴장
  leaveRoom: () => set({
    roomCode: null,
    roomId: null,
    hostId: null,
    isHost: false,
    isConnected: false,
    connectionError: null
  }),
  
  // 연결 재시도
  retryConnection: () => {
    set({ connectionError: null })
    // TODO: 실제 재연결 로직 구현
  }
}))

export default useRoomStore
