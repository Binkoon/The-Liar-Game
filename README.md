# 🎭 라이어 게임 v2.0

> **친구들과 함께 즐기는 온라인 추리 게임**  
> 📅 **릴리즈 날짜**: 2025년 9월 16일  
> 🚀 **버전**: 2.0.0

## 🛠️ 기술 스택

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-ff6b6b?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)

### 🔧 주요 기술

- **Frontend**: Next.js 14 + React 18으로 서버사이드 렌더링과 최적화된 성능
- **Real-time Communication**: Socket.io를 통한 실시간 멀티플레이어 게임
- **State Management**: Zustand로 경량화된 상태 관리
- **Database**: Redis Cloud를 통한 빠른 데이터 저장 및 세션 관리
- **Styling**: CSS3 + Framer Motion으로 부드러운 애니메이션
- **Deployment**: Vercel을 통한 간편한 배포 및 호스팅
- **Development**: Node.js 기반의 풀스택 JavaScript 개발 환경

## 🎮 게임 소개

라이어 게임은 3명 이상의 플레이어가 함께 즐기는 추리 게임입니다. 한 명의 라이어를 찾아내거나, 라이어가 모든 라운드를 통과하는 것이 목표입니다.

## 🎯 게임 목표

- **일반인**: 라이어를 찾아내는 것
- **라이어**: 정체를 숨기고 모든 라운드를 통과하는 것
- **광신도**: 라이어가 승리하도록 도와주는 것

## 👥 역할 설명

### 🕵️ 일반인
- 주제와 키워드를 알고 있습니다
- 라이어를 찾아내야 합니다
- 다른 일반인들과 협력해야 합니다

### 🎭 라이어
- 주제는 알지만 키워드를 모릅니다
- 정체를 숨기고 게임을 통과해야 합니다 혹은 지목당하더라도 키워드를 맞히면 승리합니다
- 다른 플레이어들의 설명을 듣고 유추해내야 합니다.

### 🤝 광신도 (5명 이상일 때)
- 주제와 키워드를 알고 있습니다
- 본인이 지목당하고 게임이 종료되어야 합니다
- 일반인인 척해야 합니다

## 🎲 게임 진행

### 1단계: 설명
- 모든 플레이어가 주제에 대해 설명합니다
- 라이어는 주제를 모르므로 주의깊게 들어야 합니다
- 일반인은 라이어를 찾기 위해 힌트를 줍니다

### 2단계: 투표
- 모든 플레이어가 라이어로 의심되는 사람에게 투표합니다
- 가장 많은 표를 받은 플레이어가 제외됩니다

### 3단계: 결과
- **라이어가 제외되면**: 일반인 승리! 🏆
- **일반인이 제외되면**: 다음 라운드 진행
- **광신도가 제외되면**: 다음 라운드 진행

## 🏆 승리 조건

### 일반인 승리
- 라이어를 찾아내면 승리
- "라이어를 찾아냈습니다!" 메시지 표시

### 라이어 승리
- 모든 라운드를 통과하면 승리
- "라이어가 살아남았습니다!" 메시지 표시

## 🎯 게임 팁

### 일반인을 위한 팁
- 너무 명확한 힌트를 주지 마세요
- 다른 플레이어들의 설명을 잘 들어보세요
- 라이어가 의심스러운 행동을 하는지 관찰하세요

### 라이어를 위한 팁
- 다른 플레이어들의 설명을 주의깊게 들어보세요
- 자연스럽게 설명하세요
- 너무 완벽하거나 너무 부자연스럽지 않게 하세요

### 광신도를 위한 팁
- 일반인인 척하세요
- 라이어에게 힌트를 주되 너무 명확하지 않게 하세요
- 라이어가 승리할 수 있도록 도와주세요

## 🚀 시작하기

1. **방 만들기**: 새 게임 방을 생성합니다
2. **방 참가**: 친구들과 함께 방에 참가합니다
3. **게임 시작**: 호스트가 게임을 시작합니다
4. **게임 진행**: 설명 → 투표 → 결과 순서로 진행됩니다

## 🎮 게임 특징

- **실시간 멀티플레이어**: 최대 8명까지 함께 플레이
- **다양한 주제**: 매 게임마다 다른 주제와 키워드
- **직관적인 UI**: 쉽고 재미있는 게임 인터페이스
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🎉 함께 즐기세요!

라이어 게임으로 친구들과 함께 재미있는 시간을 보내세요! 🎭✨