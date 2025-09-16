import { Server as SocketServer } from 'socket.io'
import { getRoom, setRoom, deleteRoom } from '../../lib/redis' // Redis Cloud 사용
import { 
  createPlayer, 
  createRoom, 
  GAME_PHASES, 
  SOCKET_EVENTS,
  GAME_CONFIG 
} from '../../data/game-types'
import { assignRoles } from '../../data/game-rules'
import { getRandomKeyword } from '../../data/keywords'

// Socket.io 서버 초기화
const SocketHandler = (req, res) => {
  // 이미 초기화된 경우
  if (res.socket.server.io) {
    res.end()
    return
  }

        // Socket.io 서버 생성
        const io = new SocketServer(res.socket.server, {
          cors: {
            origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
            methods: ['GET', 'POST']
          },
          pingInterval: 25000,
          pingTimeout: 60000,
        })

  // Socket 연결 이벤트 리스너
  io.on('connection', (socket) => {
    console.log('새로운 클라이언트 연결:', socket.id)

    // 연결 해제 처리
    socket.on('disconnect', async () => {
      const { roomId } = socket.data
      console.log('클라이언트 연결 해제:', socket.id)

      if (roomId) {
        try {
          const room = await getRoom(roomId)
          if (room) {
            // 플레이어 제거
            const playerIndex = room.players.findIndex(
              player => player.socketId === socket.id
            )
            
            if (playerIndex !== -1) {
              room.players.splice(playerIndex, 1)
              room.lastUpdatedAt = Date.now()
              await setRoom(room)

              // 다른 플레이어들에게 플레이어 퇴장 알림
              io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.PLAYER_LEFT, {
                socketId: socket.id
              })

              // 플레이어 목록 업데이트
              io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.UPDATE_PLAYERS, 
                room.players.map(player => ({
                  id: player.socketId,
                  name: player.name,
                  isHost: player.isHost
                }))
              )
            }
          }
        } catch (error) {
          console.error('플레이어 퇴장 처리 오류:', error)
        }
      }
    })

    // 방 입장 처리
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
      const { roomId, playerName, sessionId } = data
      
      console.log(`플레이어 ${playerName}이 방 ${roomId}에 입장 시도`)

      try {
        let room = await getRoom(roomId)
        
        // 방이 없으면 생성
        if (!room) {
          room = createRoom(roomId)
          await setRoom(room)
        }

        // 플레이어 이름 검증
        const trimmedName = playerName.trim()
        if (trimmedName.length === 0) {
          socket.emit(SOCKET_EVENTS.ERROR, '이름을 입력해주세요.')
          return
        }

        // 중복 이름 검사
        const existingPlayer = room.players.find(p => p.name === trimmedName)
        if (existingPlayer) {
          socket.emit(SOCKET_EVENTS.ERROR, '이미 사용 중인 이름입니다.')
          return
        }

        // 최대 플레이어 수 검사
        if (room.players.length >= GAME_CONFIG.MAX_PLAYERS) {
          socket.emit(SOCKET_EVENTS.ERROR, '방이 가득 찼습니다.')
          return
        }

        // 첫 번째 플레이어는 호스트
        const isHost = room.players.length === 0

        // 플레이어 생성 및 추가
        const player = createPlayer(socket.id, sessionId, trimmedName, isHost)
        room.players.push(player)
        room.lastUpdatedAt = Date.now()

        // 방 입장
        socket.join(`liarGame:room:${roomId}`)
        socket.data.roomId = roomId
        socket.data.playerName = trimmedName
        socket.data.sessionId = sessionId

        // Redis에 저장
        await setRoom(room)

        // 입장 성공 응답
        socket.emit(SOCKET_EVENTS.JOIN_ROOM_SUCCESS, {
          roomId,
          playerName: trimmedName,
          sessionId,
          isHost,
          currentPhase: room.phase
        })

        // 다른 플레이어들에게 새 플레이어 입장 알림
        socket.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.PLAYER_JOINED, {
          playerName: trimmedName,
          sessionId,
          isHost
        })

        // 플레이어 목록 업데이트
        io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.UPDATE_PLAYERS, 
          room.players.map(player => ({
            id: player.socketId,
            name: player.name,
            isHost: player.isHost
          }))
        )

        console.log(`플레이어 ${trimmedName}이 방 ${roomId}에 성공적으로 입장`)

      } catch (error) {
        console.error('방 입장 처리 오류:', error)
        socket.emit(SOCKET_EVENTS.ERROR, '방 입장 중 오류가 발생했습니다.')
      }
    })

    // 게임 단계 변경
    socket.on(SOCKET_EVENTS.NEXT_PHASE, async () => {
      const { roomId } = socket.data
      
      if (!roomId) {
        socket.emit(SOCKET_EVENTS.ERROR, '방 정보가 없습니다.')
        return
      }

      try {
        const room = await getRoom(roomId)
        if (!room) {
          socket.emit(SOCKET_EVENTS.ERROR, '방을 찾을 수 없습니다.')
          return
        }

        // 호스트만 단계 변경 가능
        const player = room.players.find(p => p.socketId === socket.id)
        if (!player || !player.isHost) {
          socket.emit(SOCKET_EVENTS.ERROR, '호스트만 게임을 시작할 수 있습니다.')
          return
        }

        console.log(`방 ${roomId}의 게임 단계 변경: ${room.phase} -> ${getNextPhase(room.phase)}`)

        // 단계별 처리
        if (room.phase === GAME_PHASES.WAITING) {
          // 게임 시작
          const minPlayers = process.env.NODE_ENV === 'development' ? 2 : 3
          if (room.players.length < minPlayers) {
            socket.emit(SOCKET_EVENTS.ERROR, `최소 ${minPlayers}명의 플레이어가 필요합니다.`)
            return
          }

          // 역할 배정
          const roles = assignRoles(room.players.length)
          room.players.forEach((player, index) => {
            player.role = roles[`player_${index}`]
          })

          // 라이어 선택
          const liarIndex = room.players.findIndex(p => p.role === 'liar')
          if (liarIndex !== -1) {
            room.liar = {
              sessionId: room.players[liarIndex].sessionId,
              name: room.players[liarIndex].name
            }
          }

          // 주제와 키워드 선택
          const subjects = Object.keys(require('../../data/keywords').keywords)
          const subject = subjects[Math.floor(Math.random() * subjects.length)]
          const keyword = getRandomKeyword(subject)

          room.subject = subject
          room.keyword = keyword
          room.phase = GAME_PHASES.PLAYING

        } else if (room.phase === GAME_PHASES.PLAYING) {
          room.phase = GAME_PHASES.ENDED
        } else if (room.phase === GAME_PHASES.ENDED) {
          // 게임 재시작
          room.phase = GAME_PHASES.WAITING
          room.liar = null
          room.subject = null
          room.keyword = null
          room.votes = {}
          room.currentSpeakerIndex = 0
          room.round = 1
          
          // 플레이어 상태 초기화
          room.players.forEach(player => {
            player.hasSpoken = false
            player.isDead = false
            player.role = null
          })
        }

        room.lastUpdatedAt = Date.now()
        await setRoom(room)

        // 모든 플레이어에게 단계 변경 알림
        io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.PHASE_CHANGED, room.phase)

      } catch (error) {
        console.error('게임 단계 변경 오류:', error)
        socket.emit(SOCKET_EVENTS.ERROR, '게임 단계 변경 중 오류가 발생했습니다.')
      }
    })

    // 라이어 확인 요청
    socket.on(SOCKET_EVENTS.ASK_IF_IM_LIAR, async (data) => {
      const { sessionId } = data
      const { roomId } = socket.data

      try {
        const room = await getRoom(roomId)
        if (!room || room.phase !== GAME_PHASES.PLAYING || !room.liar) {
          socket.emit(SOCKET_EVENTS.ERROR, '게임이 진행 중이 아닙니다.')
          return
        }

        const isLiar = room.liar.sessionId === sessionId

        socket.emit(SOCKET_EVENTS.ANSWER_IF_IM_LIAR, {
          isLiar,
          subject: isLiar ? null : room.subject,
          keyword: isLiar ? null : room.keyword
        })

      } catch (error) {
        console.error('라이어 확인 오류:', error)
        socket.emit(SOCKET_EVENTS.ERROR, '라이어 확인 중 오류가 발생했습니다.')
      }
    })

          // 라이어 공개
          socket.on(SOCKET_EVENTS.REVEAL_LIAR, async () => {
            const { roomId } = socket.data

            try {
              const room = await getRoom(roomId)
              if (!room || !room.liar || !room.subject || !room.keyword) {
                socket.emit(SOCKET_EVENTS.ERROR, '라이어 정보를 찾을 수 없습니다.')
                return
              }

              // 모든 플레이어에게 라이어 공개
              io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.LIAR_REVEALED, {
                subject: room.subject,
                keyword: room.keyword,
                liarName: room.liar.name
              })

            } catch (error) {
              console.error('라이어 공개 오류:', error)
              socket.emit(SOCKET_EVENTS.ERROR, '라이어 공개 중 오류가 발생했습니다.')
            }
          })

          // 투표하기
          socket.on(SOCKET_EVENTS.VOTE, async (data) => {
            const { targetPlayerId } = data
            const { roomId, sessionId } = socket.data

            try {
              const room = await getRoom(roomId)
              if (!room || room.phase !== GAME_PHASES.PLAYING) {
                socket.emit(SOCKET_EVENTS.ERROR, '투표할 수 없는 상태입니다.')
                return
              }

              // 플레이어 존재 확인
              const targetPlayer = room.players.find(p => p.socketId === targetPlayerId)
              if (!targetPlayer) {
                socket.emit(SOCKET_EVENTS.ERROR, '투표 대상 플레이어를 찾을 수 없습니다.')
                return
              }

              // 투표 기록
              room.votes[sessionId] = targetPlayer.sessionId
              room.lastUpdatedAt = Date.now()
              await setRoom(room)

              // 투표 완료 알림
              socket.emit(SOCKET_EVENTS.VOTE_SUCCESS, {
                targetPlayerName: targetPlayer.name
              })

              // 다른 플레이어들에게 투표 상태 업데이트
              io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.VOTE_CASTED, {
                voterSessionId: sessionId,
                targetPlayerId: targetPlayerId
              })

              console.log(`플레이어 ${sessionId}가 ${targetPlayer.name}에게 투표`)

              // 모든 플레이어가 투표했는지 확인
              const activePlayers = room.players.filter(p => !p.isDead)
              if (Object.keys(room.votes).length >= activePlayers.length) {
                // 투표 결과 계산
                const voteResult = calculateVoteResult(room)
                
                // 투표 결과 전송
                io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.VOTE_RESULT, voteResult)

                // 게임 결과 처리
                await handleVoteResult(room, voteResult, io)
              }

            } catch (error) {
              console.error('투표 처리 오류:', error)
              socket.emit(SOCKET_EVENTS.ERROR, '투표 중 오류가 발생했습니다.')
            }
          })

          // 설명하기
          socket.on(SOCKET_EVENTS.SPEAK, async (data) => {
            const { content } = data
            const { roomId, sessionId } = socket.data

            try {
              const room = await getRoom(roomId)
              if (!room || room.phase !== GAME_PHASES.PLAYING) {
                socket.emit(SOCKET_EVENTS.ERROR, '설명할 수 없는 상태입니다.')
                return
              }

              const player = room.players.find(p => p.sessionId === sessionId)
              if (!player || player.hasSpoken) {
                socket.emit(SOCKET_EVENTS.ERROR, '이미 설명했거나 설명할 수 없습니다.')
                return
              }

              // 설명 기록
              player.hasSpoken = true
              player.speech = content
              room.lastUpdatedAt = Date.now()
              await setRoom(room)

              // 설명 완료 알림
              socket.emit(SOCKET_EVENTS.SPEAK_SUCCESS)

              // 모든 플레이어에게 설명 내용 전송
              io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.SPEECH_MADE, {
                playerName: player.name,
                content: content
              })

              console.log(`${player.name}의 설명: ${content}`)

              // 모든 플레이어가 설명했는지 확인
              const activePlayers = room.players.filter(p => !p.isDead)
              if (activePlayers.every(p => p.hasSpoken)) {
                // 설명 단계 완료, 투표 단계로 전환
                room.currentPhase = 'voting'
                room.lastUpdatedAt = Date.now()
                await setRoom(room)

                io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.PHASE_CHANGED, 'voting')
                io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.VOTING_STARTED)
              }

            } catch (error) {
              console.error('설명 처리 오류:', error)
              socket.emit(SOCKET_EVENTS.ERROR, '설명 중 오류가 발생했습니다.')
            }
          })

          // 플레이어 목록 업데이트 요청
          socket.on('requestPlayerUpdate', async () => {
            const { roomId } = socket.data

            try {
              const room = await getRoom(roomId)
              if (room) {
                // 모든 플레이어에게 플레이어 목록 업데이트
                io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.UPDATE_PLAYERS, 
                  room.players.map(player => ({
                    id: player.socketId,
                    name: player.name,
                    isHost: player.isHost,
                    isBot: player.isBot || false
                  }))
                )
              }
            } catch (error) {
              console.error('플레이어 목록 업데이트 오류:', error)
            }
          })
  })

  // 서버에 Socket.io 인스턴스 저장
  res.socket.server.io = io
  res.end()
}

// 다음 단계 계산
const getNextPhase = (currentPhase) => {
  switch (currentPhase) {
    case GAME_PHASES.WAITING:
      return GAME_PHASES.PLAYING
    case GAME_PHASES.PLAYING:
      return GAME_PHASES.ENDED
    case GAME_PHASES.ENDED:
      return GAME_PHASES.WAITING
    default:
      return GAME_PHASES.WAITING
  }
}

// 투표 결과 계산
const calculateVoteResult = (room) => {
  const voteCounts = {}
  
  // 투표 수 계산
  Object.values(room.votes).forEach(targetSessionId => {
    voteCounts[targetSessionId] = (voteCounts[targetSessionId] || 0) + 1
  })
  
  // 가장 많이 투표받은 플레이어 찾기
  let maxVotes = 0
  let eliminatedPlayer = null
  
  Object.entries(voteCounts).forEach(([sessionId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes
      eliminatedPlayer = room.players.find(p => p.sessionId === sessionId)
    }
  })
  
  return {
    eliminatedPlayer: eliminatedPlayer ? {
      sessionId: eliminatedPlayer.sessionId,
      name: eliminatedPlayer.name,
      role: eliminatedPlayer.role
    } : null,
    voteCounts,
    isLiarEliminated: eliminatedPlayer?.role === 'liar'
  }
}

// 투표 결과 처리
const handleVoteResult = async (room, voteResult, io) => {
  try {
    const roomId = room.id
    
    if (voteResult.isLiarEliminated) {
      // 라이어가 제외됨 - 일반인 팀 승리
      room.phase = GAME_PHASES.ENDED
      room.winner = 'civilians'
      room.endReason = 'liar_eliminated'
      
      io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.GAME_ENDED, {
        winner: 'civilians',
        reason: '라이어를 찾아냈습니다!',
        eliminatedPlayer: voteResult.eliminatedPlayer
      })
      
    } else if (voteResult.eliminatedPlayer) {
      // 일반인이 제외됨 - 다음 라운드
      const eliminatedPlayer = room.players.find(p => p.sessionId === voteResult.eliminatedPlayer.sessionId)
      if (eliminatedPlayer) {
        eliminatedPlayer.isDead = true
      }
      
      room.round += 1
      room.votes = {}
      room.currentPhase = 'playing'
      
      // 플레이어 상태 초기화
      room.players.forEach(player => {
        if (!player.isDead) {
          player.hasSpoken = false
          player.speech = null
        }
      })
      
      // 남은 플레이어 수 확인
      const alivePlayers = room.players.filter(p => !p.isDead)
      if (alivePlayers.length <= 2) {
        // 라이어 승리
        room.phase = GAME_PHASES.ENDED
        room.winner = 'liar'
        room.endReason = 'liar_survived'
        
        io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.GAME_ENDED, {
          winner: 'liar',
          reason: '라이어가 살아남았습니다!',
          liar: room.liar
        })
      } else {
        // 다음 라운드 시작
        io.to(`liarGame:room:${roomId}`).emit(SOCKET_EVENTS.ROUND_STARTED, {
          round: room.round,
          eliminatedPlayer: voteResult.eliminatedPlayer
        })
      }
    }
    
    room.lastUpdatedAt = Date.now()
    await setRoom(room)
    
  } catch (error) {
    console.error('투표 결과 처리 오류:', error)
  }
}

export default SocketHandler
