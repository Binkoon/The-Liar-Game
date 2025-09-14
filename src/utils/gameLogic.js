import { ROLES, GAME_TOPICS } from '../data/gameData.js';

// 플레이어 클래스
export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.role = null;
    this.isAlive = true;
    this.hasSpoken = false;
    this.voteTarget = null;
    this.hasWithdrawn = false;
    this.roleConfirmed = false;
  }

  assignRole(role) {
    this.role = role;
  }

  confirmRole() {
    this.roleConfirmed = true;
  }

  speak() {
    this.hasSpoken = true;
  }

  vote(targetId) {
    this.voteTarget = targetId;
  }

  withdraw() {
    this.hasWithdrawn = true;
  }

  die() {
    this.isAlive = false;
  }
}

// 게임 상태 관리 클래스
export class GameState {
  constructor() {
    this.players = [];
    this.currentState = 'waiting';
    this.topic = null;
    this.word = null;
    this.currentSpeakerIndex = 0;
    this.votes = {};
    this.gamePhase = 'waiting';
    this.winner = null;
    this.gameResult = null;
  }

  // 플레이어 추가
  addPlayer(name) {
    const id = `player_${Date.now()}_${Math.random()}`;
    const player = new Player(id, name);
    this.players.push(player);
    return player;
  }

  // 플레이어 제거
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
  }

  // 게임 시작 (역할 배정)
  startGame() {
    if (this.players.length < 3) {
      throw new Error('최소 3명이 필요합니다.');
    }

    this.currentState = 'role_assignment';
    this.assignRoles();
    this.gamePhase = 'explanation';
    this.currentSpeakerIndex = 0;
  }

  // 역할 배정 (랜덤)
  assignRoles = () => {
    const playerCount = this.players.length;
    const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);

    if (playerCount >= 7) {
      // 7명 이상: 1명 라이어, 1명 광신도, 나머지 일반인
      shuffledPlayers[0].assignRole(ROLES.LIAR);
      shuffledPlayers[1].assignRole(ROLES.FANATIC);
      shuffledPlayers.slice(2).forEach(player => {
        player.assignRole(ROLES.CIVILIAN);
      });
    } else {
      // 6명 이하: 1명 라이어, 나머지 일반인
      shuffledPlayers[0].assignRole(ROLES.LIAR);
      shuffledPlayers.slice(1).forEach(player => {
        player.assignRole(ROLES.CIVILIAN);
      });
    }

    // 발언 순서도 랜덤으로 설정
    this.randomizeSpeakingOrder();
  }

  // 발언 순서 랜덤화
  randomizeSpeakingOrder = () => {
    const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
    this.players = shuffledPlayers;
    this.currentSpeakerIndex = 0;
  }

  // 주제와 단어 선택
  selectTopicAndWord(selectedTopic = null) {
    if (selectedTopic) {
      this.topic = selectedTopic;
    } else {
      const topics = Object.keys(GAME_TOPICS);
      this.topic = topics[Math.floor(Math.random() * topics.length)];
    }
    const words = GAME_TOPICS[this.topic];
    this.word = words[Math.floor(Math.random() * words.length)];
  }

  // 플레이어 역할 확인 완료
  confirmPlayerRole = (playerId) => {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.confirmRole();
    }
  }

  // 모든 플레이어가 역할 확인했는지 확인
  areAllRolesConfirmed = () => {
    return this.players.every(p => p.roleConfirmed);
  }

  // 역할 확인 단계로 이동
  startRoleConfirmation = () => {
    this.gamePhase = 'role_confirmation';
    this.currentState = 'role_confirmation';
  }

  // 현재 발언자 가져오기
  getCurrentSpeaker = () => {
    return this.players[this.currentSpeakerIndex];
  }

  // 다음 발언자로 이동
  nextSpeaker = () => {
    const currentPlayer = this.getCurrentSpeaker();
    if (currentPlayer) {
      currentPlayer.speak();
    }

    this.currentSpeakerIndex = (this.currentSpeakerIndex + 1) % this.players.length;
  }

  // 투표
  vote = (voterId, targetId) => {
    this.votes[voterId] = targetId;
  }

  // 투표 결과 계산
  calculateVoteResult = () => {
    const voteCounts = {};
    Object.values(this.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // 가장 많이 투표받은 플레이어 찾기
    let maxVotes = 0;
    let mostVotedPlayer = null;

    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedPlayer = playerId;
      }
    });

    return {
      mostVotedPlayer,
      voteCounts,
      maxVotes
    };
  }

  // 최후 발언 단계
  startFinalSpeech = () => {
    this.gamePhase = 'final_speech';
    this.currentState = 'final_speech';
  }

  // 철회 단계
  startWithdrawal = () => {
    this.gamePhase = 'withdrawal';
    this.currentState = 'withdrawal';
  }

  // 철회
  withdrawVote = (playerId) => {
    const player = this.players.find(p => p.id === playerId);
    if (player && !player.hasWithdrawn) {
      player.withdraw();
      delete this.votes[playerId];
    }
  }

  // 게임 결과 계산
  calculateGameResult = () => {
    const voteResult = this.calculateVoteResult();
    const mostVotedPlayer = this.players.find(p => p.id === voteResult.mostVotedPlayer);
    
    if (!mostVotedPlayer) {
      this.gameResult = 'no_vote';
      return;
    }

    // 라이어가 지목된 경우
    if (mostVotedPlayer.role === ROLES.LIAR) {
      this.gameResult = 'liar_caught';
      this.winner = ROLES.CIVILIAN;
    }
    // 광신도가 지목된 경우 (7명 이상일 때)
    else if (mostVotedPlayer.role === ROLES.FANATIC) {
      this.gameResult = 'fanatic_caught';
      this.winner = ROLES.FANATIC;
    }
    // 일반인이 지목된 경우
    else {
      this.gameResult = 'civilian_caught';
      this.winner = ROLES.LIAR;
    }

    this.gamePhase = 'result';
    this.currentState = 'result';
  }

  // 라이어가 제시어를 맞혔는지 확인
  checkLiarAnswer = (guessedWord) => {
    return guessedWord === this.word;
  }

  // 플레이어 정보 가져오기 (역할에 따라 다른 정보 제공)
  getPlayerInfo = (playerId) => {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    const info = {
      id: player.id,
      name: player.name,
      role: player.role,
      isAlive: player.isAlive,
      hasSpoken: player.hasSpoken,
      voteTarget: player.voteTarget,
      hasWithdrawn: player.hasWithdrawn
    };

    // 라이어가 아닌 경우에만 단어 정보 제공
    if (player.role !== ROLES.LIAR) {
      info.topic = this.topic;
      info.word = this.word;
    } else {
      info.topic = this.topic;
      info.word = null; // 라이어는 단어를 모름
    }

    return info;
  }
}
