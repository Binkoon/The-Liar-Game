// 게임 키워드 데이터
export const keywords = {
  animals: [
    '강아지', '고양이', '사자', '호랑이', '코끼리', '기린', '펭귄', '곰',
    '늑대', '여우', '토끼', '다람쥐', '햄스터', '새', '물고기', '거북이'
  ],
  
  food: [
    '피자', '햄버거', '파스타', '라면', '김치', '불고기', '초밥', '치킨',
    '떡볶이', '순두부찌개', '갈비', '삼겹살', '회', '샐러드', '커피', '케이크'
  ],
  
  sports: [
    '축구', '야구', '농구', '배구', '테니스', '탁구', '수영', '달리기',
    '자전거', '등산', '골프', '볼링', '당구', '스키', '스케이트', '요가'
  ],
  
  movies: [
    '어벤져스', '타이타닉', '겨울왕국', '토이스토리', '해리포터', '스타워즈',
    '인터스텔라', '인셉션', '터미네이터', '백투더퓨처', '매트릭스', '기생충'
  ],
  
  places: [
    '파리', '도쿄', '뉴욕', '런던', '로마', '시드니', '베를린', '바르셀로나',
    '아테네', '모스크바', '두바이', '싱가포르', '홍콩', '방콕', '서울', '부산'
  ],
  
  jobs: [
    '의사', '교사', '변호사', '경찰', '소방관', '요리사', '가수', '배우',
    '화가', '작가', '기자', '회계사', '건축가', '엔지니어', '비서', '택시기사'
  ]
}

// 카테고리별 키워드 선택
export function getRandomKeyword(category) {
  const categoryKeywords = keywords[category]
  if (!categoryKeywords) {
    throw new Error(`Unknown category: ${category}`)
  }
  
  const randomIndex = Math.floor(Math.random() * categoryKeywords.length)
  return categoryKeywords[randomIndex]
}

// 모든 카테고리 목록
export const categories = Object.keys(keywords)

// 카테고리 설명
export const categoryDescriptions = {
  animals: '동물',
  food: '음식',
  sports: '스포츠',
  movies: '영화',
  places: '장소',
  jobs: '직업'
}
