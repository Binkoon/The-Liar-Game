import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import PlayerCard from '../../components/game/PlayerCard'
import socketClient from '../../utils/socket-client'
import { SOCKET_EVENTS, GAME_PHASES } from '../../data/game-types'

export default function GameRoom() {
  const router = useRouter()
  const { roomId } = router.query
  
  // 상태 관리
  const [isConnected, setIsConnected] = useState(false)
  const [players, setPlayers] = useState([])
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.WAITING)
  const [isHost, setIsHost] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState('')
  const [isLiar, setIsLiar] = useState(false)
  const [subject, setSubject] = useState(null)
  const [keyword, setKeyword] = useState(null)
  const [speechContent, setSpeechContent] = useState('')
  const [votedPlayer, setVotedPlayer] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [gameStep, setGameStep] = useState('waiting') // playing, voting, ended
  const [voteResults, setVoteResults] = useState(null)
  const [votingStatus, setVotingStatus] = useState({}) // 투표 상태 추적
  const [roundInfo, setRoundInfo] = useState(null) // 라운드 정보

  // 컴포넌트 마운트 시 Socket 연결
  useEffect(() => {
    if (!roomId) return

    // URL에서 플레이어 정보 가져오기
    const { playerName: urlPlayerName, sessionId: urlSessionId, isHost: urlIsHost } = router.query
    
    if (!urlPlayerName || !urlSessionId) {
      router.push('/')
      return
    }

    setPlayerName(urlPlayerName)
    setSessionId(urlSessionId)
    setIsHost(urlIsHost === 'true')

    // Socket 연결
    const socket = socketClient.connect()

    // Socket 이벤트 리스너 등록
    socket.on('connect', () => {
      console.log('Socket 연결됨')
      setIsConnected(true)
      
      // 방 입장
      socketClient.joinRoom(roomId, urlPlayerName, urlSessionId)
    })

    socket.on('disconnect', () => {
      console.log('Socket 연결 해제됨')
      setIsConnected(false)
    })

    // 게임 이벤트 리스너
    socket.on(SOCKET_EVENTS.JOIN_ROOM_SUCCESS, (data) => {
      console.log('방 입장 성공:', data)
      setCurrentPhase(data.currentPhase)
      // 게임이 진행 중이면 playing으로 설정
      if (data.currentPhase === GAME_PHASES.PLAYING) {
        setGameStep('playing')
      }
    })

    socket.on(SOCKET_EVENTS.JOIN_ROOM_FAILED, () => {
      setError('방 입장에 실패했습니다.')
    })

    socket.on(SOCKET_EVENTS.UPDATE_PLAYERS, (playerList) => {
      console.log('플레이어 목록 업데이트:', playerList)
      setPlayers(playerList)
    })

    socket.on(SOCKET_EVENTS.PHASE_CHANGED, (phase) => {
      console.log('게임 단계 변경:', phase)
      setCurrentPhase(phase)
      // 게임 단계에 따라 gameStep 설정
      if (phase === GAME_PHASES.PLAYING) {
        setGameStep('playing')
      } else if (phase === GAME_PHASES.ENDED) {
        setGameStep('ended')
      } else {
        setGameStep('waiting')
      }
    })

    socket.on(SOCKET_EVENTS.ANSWER_IF_IM_LIAR, (data) => {
      console.log('라이어 확인 응답:', data)
      setIsLiar(data.isLiar)
      setSubject(data.subject)
      setKeyword(data.keyword)
    })

    socket.on(SOCKET_EVENTS.LIAR_REVEALED, (data) => {
      console.log('라이어 공개:', data)
      setSubject(data.subject)
      setKeyword(data.keyword)
    })

    socket.on(SOCKET_EVENTS.SPEECH_MADE, (data) => {
      console.log('설명 완료:', data)
    })

    socket.on(SOCKET_EVENTS.VOTING_STARTED, () => {
      console.log('투표 시작')
      setGameStep('voting')
    })

    socket.on(SOCKET_EVENTS.VOTE_RESULT, (data) => {
      console.log('투표 결과:', data)
      setVoteResults(data)
      // 게임이 끝난 경우에만 gameResult 설정
      if (data.isLiarEliminated || data.gameEnded) {
        setGameResult(data)
        setGameStep('ended')
      }
    })

    socket.on(SOCKET_EVENTS.GAME_ENDED, (data) => {
      console.log('게임 종료:', data)
      setGameResult(data)
      setGameStep('ended')
    })

    socket.on(SOCKET_EVENTS.ROUND_STARTED, (data) => {
      console.log('새 라운드 시작:', data)
      setGameStep('playing')
      setVotedPlayer(null)
      setVoteResults(null)
      setRoundInfo(data)
      // 투표 상태 초기화
      setVotingStatus({})
    })

    socket.on(SOCKET_EVENTS.VOTE_CASTED, (data) => {
      console.log('투표 완료:', data)
      // 투표 상태 업데이트
      setVotingStatus(prev => ({
        ...prev,
        [data.voterSessionId]: data.targetPlayerId
      }))
    })

    socket.on(SOCKET_EVENTS.ERROR, (errorMessage) => {
      console.error('Socket 오류:', errorMessage)
      setError(errorMessage)
    })

    // 컴포넌트 언마운트 시 정리
    return () => {
      socketClient.disconnect()
    }
  }, [roomId, router])

  // 게임 시작
  const handleStartGame = () => {
    socketClient.nextPhase()
  }

  // 라이어 확인
  const handleAskIfLiar = () => {
    socketClient.askIfImLiar()
  }

  // 라이어 공개
  const handleRevealLiar = () => {
    socketClient.revealLiar()
  }

  // 설명하기
  const handleSpeak = () => {
    if (!speechContent.trim()) {
      setError('설명을 입력해주세요.')
      return
    }
    socketClient.speak(speechContent)
    setSpeechContent('')
  }

  // 투표하기
  const handleVote = (targetPlayerId) => {
    socketClient.vote(targetPlayerId)
    setVotedPlayer(targetPlayerId)
  }

  // 테스트용 봇 플레이어 추가
  const handleAddBotPlayers = async () => {
    try {
      const neededPlayers = 3 - players.length
      
      const response = await fetch('/api/rooms/add-bot-players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomId,
          count: neededPlayers
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('봇 플레이어 추가 성공:', data.message)
        // Socket을 통해 플레이어 목록 업데이트 요청
        socketClient.emit('requestPlayerUpdate')
      } else {
        setError(data.error || '봇 플레이어 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('봇 플레이어 추가 오류:', error)
      setError('봇 플레이어 추가 중 오류가 발생했습니다.')
    }
  }

  // 방 나가기
  const handleLeaveRoom = () => {
    socketClient.disconnect()
    router.push('/')
  }

  // 에러 표시 컴포넌트
  const ErrorMessage = ({ message, onClose }) => {
    if (!message) return null
    
    return (
      <div className="error-message">
        <span>{message}</span>
        <button onClick={onClose} className="error-close">×</button>
      </div>
    )
  }

  // 게임 단계별 UI 렌더링
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case GAME_PHASES.WAITING:
        return (
          <div className="waiting-phase">
            <h2>게임 대기 중</h2>
            <p>모든 플레이어가 준비되면 호스트가 게임을 시작할 수 있습니다.</p>
            {isHost && (
              <div className="host-controls">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStartGame}
                  disabled={players.length < (process.env.NODE_ENV === 'development' ? 2 : 3)}
                >
                  게임 시작하기 ({players.length}/{process.env.NODE_ENV === 'development' ? '2+' : '3+'})
                </Button>
                
                {/* 개발용: 가짜 플레이어 추가 */}
                {process.env.NODE_ENV === 'development' && players.length < 3 && (
                  <Button
                    variant="ghost"
                    size="medium"
                    onClick={handleAddBotPlayers}
                    className="add-bots-btn"
                  >
                    🤖 테스트용 플레이어 추가
                  </Button>
                )}
              </div>
            )}
          </div>
        )

      case GAME_PHASES.PLAYING:
        return (
          <motion.div 
            className="playing-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>게임 진행 중</h2>
            
            {/* 라이어 정보 표시 */}
            {/* 라운드 정보 */}
            {roundInfo && (
              <motion.div 
                className="round-info"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="round-header">
                  <h3>라운드 {roundInfo.round}</h3>
                  {roundInfo.eliminatedPlayer && (
                    <p className="eliminated-player">
                      이전 라운드에서 <strong>{roundInfo.eliminatedPlayer.name}</strong>이(가) 제외되었습니다.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {(isLiar !== null) && (
                <motion.div 
                  className="liar-info"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLiar ? (
                    <div className="liar-reveal">
                      <h3>🎭 당신은 라이어입니다!</h3>
                      <p>주제를 모르고 있으니 다른 플레이어들의 설명을 잘 들어보세요.</p>
                    </div>
                  ) : (
                    <div className="civilian-reveal">
                      <h3>👤 당신은 일반인입니다!</h3>
                      <p><strong>주제:</strong> {subject}</p>
                      <p><strong>키워드:</strong> {keyword}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 설명 입력 섹션 */}
            {gameStep === 'playing' && (
              <motion.div 
                className="speech-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3>주제에 대해 설명해주세요</h3>
                <div className="speech-input">
                  <Input
                    type="text"
                    value={speechContent}
                    onChange={(e) => setSpeechContent(e.target.value)}
                    placeholder="주제에 대한 설명을 입력하세요..."
                    maxLength={100}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSpeak}
                    disabled={!speechContent.trim()}
                  >
                    설명하기
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 투표 섹션 */}
            {gameStep === 'voting' && (
              <motion.div 
                className="voting-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3>라이어로 의심되는 플레이어를 선택하세요</h3>
                
                {/* 투표 상태 표시 */}
                <div className="voting-status">
                  <p>투표 완료: {Object.keys(votingStatus).length}/{players.filter(p => !p.isDead).length}명</p>
                </div>

                <div className="voting-players">
                  {players
                    .filter(player => !player.isDead)
                    .map((player, index) => {
                      const hasVoted = Object.values(votingStatus).includes(player.id)
                      const isVotedByMe = votedPlayer === player.id
                      
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <PlayerCard
                            player={{
                              id: player.id,
                              name: player.name,
                              isHost: player.isHost
                            }}
                            onClick={() => handleVote(player.id)}
                            className={`vote-player ${isVotedByMe ? 'voted' : ''} ${hasVoted ? 'has-votes' : ''}`}
                            clickable={!votedPlayer}
                          />
                          {hasVoted && (
                            <div className="vote-indicator">
                              {Object.values(votingStatus).filter(id => id === player.id).length}표
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                </div>
                
                {votedPlayer && (
                  <motion.p 
                    className="vote-confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    투표가 완료되었습니다!
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* 투표 결과 표시 */}
            {voteResults && !voteResults.isLiarEliminated && (
              <motion.div 
                className="vote-results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3>투표 결과</h3>
                <div className="elimination-result">
                  <p>
                    <strong>{voteResults.eliminatedPlayer?.name}</strong>이(가) 제외되었습니다.
                  </p>
                  <p className="role-info">
                    역할: {voteResults.eliminatedPlayer?.role === 'liar' ? '라이어' : 
                           voteResults.eliminatedPlayer?.role === 'fanatic' ? '광신도' : '일반인'}
                  </p>
                </div>
                <div className="next-round-info">
                  <p>다음 라운드를 준비 중입니다...</p>
                </div>
              </motion.div>
            )}

            <div className="game-actions">
              <Button
                variant="secondary"
                onClick={handleAskIfLiar}
                className="liar-check-btn"
              >
                내가 라이어인지 확인
              </Button>
              
              {isHost && (
                <Button
                  variant="danger"
                  onClick={handleRevealLiar}
                  className="reveal-btn"
                >
                  라이어 공개하기
                </Button>
              )}
            </div>
          </motion.div>
        )

      case GAME_PHASES.ENDED:
        return (
          <motion.div 
            className="ended-phase"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🎉 게임 종료! 🎉
            </motion.h2>

            {gameResult && (
              <motion.div 
                className="game-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className={`result-message ${gameResult.winner}`}>
                  {gameResult.winner === 'civilians' ? (
                    <div>
                      <h3>🏆 일반인 팀 승리! 🏆</h3>
                      <p>라이어를 성공적으로 찾아냈습니다!</p>
                      {gameResult.eliminatedPlayer && (
                        <p>제외된 플레이어: <strong>{gameResult.eliminatedPlayer.name}</strong></p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3>🎭 라이어 승리! 🎭</h3>
                      <p>라이어가 모든 라운드를 통과했습니다!</p>
                      {gameResult.liar && (
                        <p>라이어: <strong>{gameResult.liar.name}</strong></p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStartGame}
                  className="restart-button"
                >
                  새 게임 시작하기
                </Button>
              </motion.div>
            )}
          </motion.div>
        )

      default:
        return <div>알 수 없는 게임 단계</div>
    }
  }

  if (!roomId) {
    return <div>로딩 중...</div>
  }

  return (
    <>
      <Head>
        <title>게임 방 - {roomId} - 라이어 게임</title>
        <meta name="description" content={`라이어 게임 방 ${roomId}에서 게임을 즐기세요`} />
      </Head>

      <div className="game-room">
        {/* 헤더 */}
        <div className="room-header">
          <div className="room-info">
            <h1>방 코드: {roomId}</h1>
            <div className="connection-status">
              {isConnected ? '🟢 연결됨' : '🔴 연결 끊김'}
            </div>
          </div>
          <div className="room-actions">
            <Button
              variant="ghost"
              onClick={handleLeaveRoom}
            >
              방 나가기
            </Button>
          </div>
        </div>

        {/* 에러 메시지 */}
        <ErrorMessage 
          message={error} 
          onClose={() => setError('')} 
        />

        <div className="game-content">
          {/* 플레이어 목록 */}
          <motion.div 
            className="players-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>플레이어 목록 ({players.length}명)</h2>
            <div className="players-grid">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlayerCard
                      player={{
                        id: player.id,
                        name: player.name,
                        isHost: player.isHost,
                        isBot: player.isBot,
                        isDead: player.isDead
                      }}
                      showHost={true}
                      showBot={true}
                      isDead={player.isDead}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 게임 콘텐츠 */}
          <div className="game-section">
            <Card title="게임 상태">
              {renderPhaseContent()}
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .game-room {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-primary-50) 100%);
        }

        .room-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .room-info h1 {
          margin: 0;
          font-size: var(--font-size-xl);
          color: var(--color-primary-600);
        }

        .connection-status {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin-top: var(--space-1);
        }

        .error-message {
          background: var(--color-error-50);
          color: var(--color-error-700);
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-error-200);
          border-radius: var(--radius-lg);
          margin: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .error-close {
          background: none;
          border: none;
          font-size: var(--font-size-lg);
          cursor: pointer;
          color: var(--color-error-700);
        }

        .game-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          padding: var(--space-6);
          max-width: 1200px;
          margin: 0 auto;
        }

        .players-section h2 {
          margin-bottom: var(--space-4);
          color: var(--color-gray-700);
        }

        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .waiting-phase,
        .playing-phase,
        .ended-phase {
          text-align: center;
          padding: var(--space-6);
        }

        .waiting-phase h2,
        .playing-phase h2,
        .ended-phase h2 {
          margin-bottom: var(--space-4);
          color: var(--color-primary-600);
        }

        .game-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin: var(--space-6) 0;
        }

        .liar-info {
          background: var(--color-gray-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-200);
          margin-top: var(--space-4);
        }

        .liar-reveal {
          color: var(--color-error-600);
        }

        .civilian-reveal {
          color: var(--color-success-600);
        }

        .liar-info h3 {
          margin: 0 0 var(--space-2) 0;
        }

        .liar-info p {
          margin: var(--space-1) 0;
        }

        .speech-section {
          background: var(--color-primary-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-primary-200);
          margin: var(--space-6) 0;
        }

        .speech-section h3 {
          margin: 0 0 var(--space-4) 0;
          color: var(--color-primary-700);
          text-align: center;
        }

        .speech-input {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .voting-section {
          background: var(--color-error-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-error-200);
          margin: var(--space-6) 0;
        }

        .voting-section h3 {
          margin: 0 0 var(--space-4) 0;
          color: var(--color-error-700);
          text-align: center;
        }

        .voting-players {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .vote-player {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vote-player.voted {
          background: var(--color-primary-100);
          border: 2px solid var(--color-primary-500);
        }

        .vote-player:hover:not(.voted) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .vote-confirmation {
          text-align: center;
          color: var(--color-success-600);
          font-weight: 600;
          margin: 0;
        }

        .game-result {
          background: var(--color-gray-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-gray-200);
          margin: var(--space-6) 0;
        }

        .result-message {
          text-align: center;
        }

        .result-message h3 {
          margin: 0 0 var(--space-3) 0;
          font-size: var(--font-size-2xl);
        }

        .result-message.civilians h3 {
          color: var(--color-success-600);
        }

        .result-message.liar h3 {
          color: var(--color-error-600);
        }

        .result-message p {
          margin: var(--space-2) 0;
          color: var(--color-gray-700);
        }

        .restart-button {
          margin-top: var(--space-4);
        }

        .voting-status {
          background: var(--color-gray-100);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          text-align: center;
        }

        .vote-player.has-votes {
          background: var(--color-warning-50);
          border: 2px solid var(--color-warning-400);
        }

        .vote-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--color-primary-500);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .round-info {
          background: var(--color-info-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-info-200);
          margin-bottom: var(--space-4);
        }

        .round-header h3 {
          margin: 0 0 var(--space-2) 0;
          color: var(--color-info-700);
          text-align: center;
        }

        .eliminated-player {
          color: var(--color-error-600);
          text-align: center;
          margin: 0;
        }

        .vote-results {
          background: var(--color-warning-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-warning-200);
          margin: var(--space-6) 0;
          text-align: center;
        }

        .vote-results h3 {
          margin: 0 0 var(--space-4) 0;
          color: var(--color-warning-700);
        }

        .elimination-result {
          margin-bottom: var(--space-4);
        }

        .elimination-result p {
          margin: var(--space-2) 0;
          font-size: var(--font-size-lg);
        }

        .role-info {
          color: var(--color-primary-600);
          font-weight: 500;
        }

        .next-round-info {
          color: var(--color-gray-600);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .game-content {
            grid-template-columns: 1fr;
            padding: var(--space-4);
          }
          
          .room-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .players-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
