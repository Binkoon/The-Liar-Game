import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation, Routes, Route } from 'react-router-dom';

// 컴포넌트들을 lazy loading으로 import
const Home = lazy(() => import('./components/Home'));
const Lobby = lazy(() => import('./components/Lobby'));
const Game = lazy(() => import('./components/Game'));
const NicknameInput = lazy(() => import('./components/NicknameInput'));
const RefreshWarningModal = lazy(() => import('./components/RefreshWarningModal'));
const ErrorModal = lazy(() => import('./components/ErrorModal'));
const RoomShare = lazy(() => import('./components/RoomShare'));
import { 
  generateRoomCode
} from './utils/roomManager';
import { initFirebaseRealtimeSync, getFirebaseRealtimeSync, cleanupFirebaseRealtimeSync } from './utils/firebaseRealtimeSync';
import './App.css';

// 홈 화면 컴포넌트 (방 만들기로 바로 이동)
const HomePage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 최초 접속 시 바로 방 만들기 화면으로 이동
    navigate('/create-room', { replace: true });
  }, [navigate]);
  
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>방을 준비하는 중...</p>
    </div>
  );
};

// 방 만들기 컴포넌트
const CreateRoomPage = () => {
  const navigate = useNavigate();

  const handleJoin = (nickname) => {
    // 방 코드 생성 후 닉네임과 함께 방 생성
    const newRoomCode = generateRoomCode();
    navigate(`/room/${newRoomCode}/create`, { 
      state: { nickname: nickname.trim() } 
    });
  };

  return (
    <div className="app">
      <motion.div
        className="nickname-input-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense fallback={
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>화면을 준비하는 중...</p>
          </div>
        }>
          <NicknameInput
            onJoin={handleJoin}
            roomCode=""
            isHost={true}
            showRoomCode={false}
          />
        </Suspense>
      </motion.div>
    </div>
  );
};

// 게임 방 컴포넌트
const GameRoom = () => {
  const navigate = useNavigate();
  const { roomCode, action } = useParams();
  const location = useLocation();
  
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [showRoomShare, setShowRoomShare] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // 새로고침 경고 처리
  const handleBeforeUnload = (e) => {
    if (gameStarted) {
      e.preventDefault();
      e.returnValue = '';
      setShowRefreshWarning(true);
      return '';
    }
  };

  const handleRefreshConfirm = () => {
    setShowRefreshWarning(false);
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (!roomCode) return;
    
    try {
      // Firebase 실시간 동기화 초기화
      const sync = initFirebaseRealtimeSync(roomCode);
      
      // 전역으로 사용할 수 있도록 설정
      window.realtimeSync = sync;
    
    // 동기화 리스너 등록
    sync.addListener(async (event, data) => {
      if (event === 'playersUpdated') {
        const allPlayers = Object.values(data.players || {});
        setPlayers(allPlayers);
      }
      
      // 게임 상태 업데이트 이벤트 처리
      if (event === 'gameStateUpdated') {
        // 게임 상태가 업데이트되면 게임 시작으로 표시
        if (data.gamePhase && data.gamePhase !== 'topic_selection') {
          setGameStarted(true);
        }
      }
    });
    
    // 기존 플레이어들 로드
    sync.getAllPlayers().then(allPlayers => {
      setPlayers(allPlayers);
    });
    
    sync.getGameState().then(gameState => {
      if (gameState) {
        setGameStarted(gameState.gameStarted || false);
      }
    });
    
    // location state에서 닉네임이 있으면 바로 참여
    if (location.state?.nickname) {
      const nickname = location.state.nickname;
      const newPlayer = {
        name: nickname,
        isHost: action === 'create'
      };
      sync.registerPlayer(newPlayer).then(() => {
        setCurrentPlayer(newPlayer);
        setShowNicknameInput(false);
      });
    } else {
      // 닉네임이 없으면 닉네임 입력 화면 표시
      setShowNicknameInput(true);
    }

    setIsLoading(false);

    // beforeunload 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);

    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
      setErrorMessage('연결에 실패했습니다. 페이지를 새로고침해주세요.');
      setShowError(true);
    }

    // 정리
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupFirebaseRealtimeSync();
    };
  }, [roomCode, action, location.state]);


  // 닉네임으로 방 참여
  const handleJoinWithNickname = async (nickname) => {
    try {
      setIsLoading(true);
      const sync = getFirebaseRealtimeSync();
      
      if (!sync) {
        throw new Error('연결에 실패했습니다. 다시 시도해주세요.');
      }

      const newPlayer = {
        name: nickname,
        isHost: action === 'create' // 방 만들기인 경우 호스트
      };
      
      await sync.registerPlayer(newPlayer);
      setCurrentPlayer(newPlayer);
      setShowNicknameInput(false);
      setErrorMessage('');
    } catch (error) {
      console.error('방 참여 실패:', error);
      setErrorMessage(error.message || '방 참여에 실패했습니다. 다시 시도해주세요.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    const sync = getFirebaseRealtimeSync();
    if (sync) {
      await sync.removePlayer(playerId);
    } else {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleToggleSpectator = async (playerId) => {
    const sync = getFirebaseRealtimeSync();
    if (sync) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        const newStatus = player.status === 'playing' ? 'spectating' : 'playing';
        await sync.updatePlayer({ status: newStatus });
      }
    }
  };

  const handleStartGame = () => {
    if (!currentPlayer?.isHost) {
      setErrorMessage('호스트만 게임을 시작할 수 있습니다.');
      setShowError(true);
      return;
    }

    const playingPlayers = players.filter(p => p.status === 'playing');
    if (playingPlayers.length >= 3) {
      const sync = getFirebaseRealtimeSync();
      if (sync) {
        sync.updateGameState({ gameStarted: true });
      }
      setGameStarted(true);
    } else {
      setErrorMessage('최소 3명의 참여자가 필요합니다. (관전자는 제외)');
      setShowError(true);
    }
  };

  const handleBackToLobby = () => {
    setGameStarted(false);
  };

  const handleEndGame = () => {
    const sync = getFirebaseRealtimeSync();
    if (sync) {
      sync.cleanup();
    }
    setGameStarted(false);
    setPlayers([]);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>게임을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 방 정보 헤더 */}
      {roomCode && (
        <div className="room-header">
          <div className="room-info">
            <span className="room-label">방 코드:</span>
            <span className="room-code">{roomCode}</span>
          </div>
          <div className="room-actions">
            <button 
              className="share-btn"
              onClick={() => setShowRoomShare(true)}
              title="방 공유하기"
            >
              📤 공유
            </button>
            <button 
              className={`end-game-btn ${showNicknameInput ? 'disabled' : ''}`}
              onClick={showNicknameInput ? undefined : handleEndGame}
              title={showNicknameInput ? "방 생성 후 나갈 수 있습니다" : "게임 종료"}
              disabled={showNicknameInput}
            >
              🚪 나가기
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showNicknameInput ? (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>화면을 준비하는 중...</p>
              </div>
            }>
              <NicknameInput
                onJoin={handleJoinWithNickname}
                roomCode={roomCode}
                isHost={action === 'create'}
              />
            </Suspense>
          </motion.div>
        ) : !gameStarted ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>로비를 준비하는 중...</p>
              </div>
            }>
              <Lobby
                players={players}
                onRemovePlayer={handleRemovePlayer}
                onStartGame={handleStartGame}
                roomCode={roomCode}
                currentPlayer={currentPlayer}
                onToggleSpectator={handleToggleSpectator}
              />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>게임을 준비하는 중...</p>
              </div>
            }>
              <Game
                players={players}
                onBackToLobby={handleBackToLobby}
                onEndGame={handleEndGame}
                currentPlayer={currentPlayer}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새로고침 경고 모달 */}
      <Suspense fallback={null}>
        <RefreshWarningModal
          isOpen={showRefreshWarning}
          onConfirm={handleRefreshConfirm}
          onCancel={handleRefreshCancel}
        />
      </Suspense>

      {/* 에러 모달 */}
      <Suspense fallback={null}>
        <ErrorModal
          isOpen={showError}
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      </Suspense>

      {/* 방 공유 모달 */}
      <Suspense fallback={null}>
        <RoomShare
          roomCode={roomCode}
          isOpen={showRoomShare}
          onClose={() => setShowRoomShare(false)}
        />
      </Suspense>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>&copy; 2025 Binkoon</p>
          </div>
          <div className="footer-links">
            <a 
              href="https://github.com/Binkoon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
              title="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/hyun-bin-k-005198211/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
              title="LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 기존 URL 리다이렉트 컴포넌트 (홈으로 리다이렉트)
const LegacyRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 기존 /game/roomCode 형태를 홈으로 리다이렉트
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>페이지를 이동하는 중...</p>
    </div>
  );
};

// 메인 App 컴포넌트
function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-room" element={<CreateRoomPage />} />
        <Route path="/room/:roomCode/:action" element={<GameRoom />} />
        <Route path="/game/:roomCode" element={<LegacyRedirect />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;