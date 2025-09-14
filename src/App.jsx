import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

// 컴포넌트들을 lazy loading으로 import
const Lobby = lazy(() => import('./components/Lobby'));
const Game = lazy(() => import('./components/Game'));
const NicknameInput = lazy(() => import('./components/NicknameInput'));
const RefreshWarningModal = lazy(() => import('./components/RefreshWarningModal'));
const ErrorModal = lazy(() => import('./components/ErrorModal'));
const RoomShare = lazy(() => import('./components/RoomShare'));
import { 
  generateRoomCode, 
  getRoomCodeFromURL, 
  saveGameState, 
  loadGameState, 
  clearGameState,
  updateURL,
  setupPopstateHandler,
  cleanupOldGameStates
} from './utils/roomManager';
import { initRealtimeSync, getRealtimeSync, cleanupRealtimeSync } from './utils/realtimeSync';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [showRoomShare, setShowRoomShare] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 게임 상태 저장
  const saveCurrentGameState = () => {
    if (currentRoomCode && gameStarted) {
      const gameState = {
        players,
        gameStarted,
        timestamp: Date.now()
      };
      saveGameState(currentRoomCode, gameState);
    }
  };

  // 게임 상태 복구
  const loadGameFromStorage = (roomCode) => {
    const savedState = loadGameState(roomCode);
    if (savedState) {
      setPlayers(savedState.players || []);
      setGameStarted(savedState.gameStarted || false);
      return true;
    }
    return false;
  };

  // 방 코드 생성 및 URL 업데이트
  const createNewRoom = () => {
    const newRoomCode = generateRoomCode();
    setCurrentRoomCode(newRoomCode);
    updateURL(newRoomCode, false);
    navigate(`/game/${newRoomCode}`);
  };

  // 방 코드로 이동
  const joinRoom = (roomCode) => {
    setCurrentRoomCode(roomCode);
    updateURL(roomCode, false);
    navigate(`/game/${roomCode}`);
  };

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
    // 실제로는 페이지가 새로고침됨
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 오래된 게임 상태 정리
    cleanupOldGameStates();

    // URL에서 방 코드 확인
    const urlRoomCode = getRoomCodeFromURL();
    
    if (urlRoomCode) {
      // URL에 방 코드가 있으면 해당 방으로 이동
      setCurrentRoomCode(urlRoomCode);
      
      // 실시간 동기화 초기화
      const sync = initRealtimeSync(urlRoomCode);
      
      // 동기화 리스너 등록
      sync.addListener((event, data) => {
        if (event === 'sync') {
          const allPlayers = Object.values(data.players || {});
          setPlayers(allPlayers);
          
          if (data.gameState) {
            setGameStarted(data.gameState.gameStarted || false);
          }
        }
      });
      
      // 기존 플레이어들 로드
      const allPlayers = sync.getAllPlayers();
      setPlayers(allPlayers);
      
      const gameState = sync.getGameState();
      if (gameState) {
        setGameStarted(gameState.gameStarted || false);
      }
      
      // 닉네임 입력 화면 표시
      setShowNicknameInput(true);
    } else {
      // URL에 방 코드가 없으면 새 방 생성
      createNewRoom();
    }

    setIsLoading(false);

    // beforeunload 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 정리
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupRealtimeSync();
    };
  }, []);

  // 게임 상태 변경 시 저장
  useEffect(() => {
    if (currentRoomCode && !isLoading) {
      saveCurrentGameState();
    }
  }, [players, gameStarted, currentRoomCode, isLoading]);

  // 닉네임으로 방 참여
  const handleJoinWithNickname = (nickname) => {
    const sync = getRealtimeSync();
    if (sync) {
      const newPlayer = {
        name: nickname,
        isHost: sync.isHost
      };
      sync.addPlayer(newPlayer);
      setCurrentPlayer(newPlayer);
      setShowNicknameInput(false);
    }
  };

  const handleRemovePlayer = (playerId) => {
    const sync = getRealtimeSync();
    if (sync) {
      sync.removePlayer(playerId);
    } else {
      // 폴백: 기존 방식
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleToggleSpectator = (playerId) => {
    const sync = getRealtimeSync();
    if (sync) {
      sync.togglePlayerStatus(playerId);
    }
  };

  const handleStartGame = () => {
    const playingPlayers = players.filter(p => p.status === 'playing');
    if (playingPlayers.length >= 3) {
      const sync = getRealtimeSync();
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
    setPlayers([]);
    // 게임 상태는 유지 (방은 그대로)
  };

  const handleEndGame = () => {
    // 게임 종료 시 저장된 상태 삭제
    if (currentRoomCode) {
      clearGameState(currentRoomCode);
    }
    setGameStarted(false);
    setPlayers([]);
    setCurrentRoomCode(null);
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
      {currentRoomCode && (
        <div className="room-header">
          <div className="room-info">
            <span className="room-label">방 코드:</span>
            <span className="room-code">{currentRoomCode}</span>
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
                roomCode={currentRoomCode}
                isHost={players.length === 0}
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
                roomCode={currentRoomCode}
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
          roomCode={currentRoomCode}
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
}

export default App;
