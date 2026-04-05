# 보냉박스 규격 매칭 시스템

태성산업·세광이피에스 보냉박스 규격 데이터와 거래처 규격을 비교하여 최적 제품을 추천하는 사내 웹 앱입니다.

---

## 빠른 시작

```bash
cd 보냉박스-매칭
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 폴더 구조

```
src/
├── data/
│   └── products.json          # 제품 마스터 데이터 (태성산업 27종 + 세광이피에스 29종)
├── services/
│   ├── matchingService.js     # 핵심 매칭 알고리즘
│   └── dataService.js         # 데이터 접근 레이어 (localStorage ↔ Supabase 교체 지점)
├── utils/
│   └── exportUtils.js         # 클립보드 복사 / CSV 다운로드
├── components/
│   ├── Header.jsx             # 상단 네비게이션
│   ├── SearchForm.jsx         # 외경/내경 입력 폼 + 허용오차 설정
│   ├── ResultCard.jsx         # 개별 결과 카드 (적합도·차이값 시각화)
│   ├── ResultList.jsx         # 결과 목록 (필터탭·내보내기 포함)
│   └── AdminPanel.jsx         # 제품 CRUD 관리 테이블
└── pages/
    ├── HomePage.jsx           # 규격 검색 메인 페이지
    └── AdminPage.jsx          # 제품 관리 페이지
```

---

## 데이터 구조 (`products.json`)

```json
{
  "id": "TS-5",              // 내부 고유 ID
  "company": "태성산업",      // "태성산업" | "세광이피에스"
  "code": "TS-5",            // 제품 코드 (표시용)
  "name": "김치10K",          // 제품명
  "weight": 180,             // 중량 (g)
  "outer": { "w": 385, "d": 283, "h": 275 },  // 외경 가로×세로×높이 (mm)
  "inner": { "w": 340, "d": 240, "h": 220 },  // 내경 가로×세로×높이 (mm)
  "active": true,            // 검색 노출 여부
  "notes": ""                // 비고
}
```

---

## 매칭 알고리즘

### 입력 파싱
- 지원 구분자: `*`, `x`, `×`, 공백 → "385\*283\*275", "385x283x275" 모두 허용

### 오차 계산
- 입력된 항목(외경/내경)만 계산에 포함
- 각 축(가로/세로/높이)의 절댓값 차이 합산

### 적합도 판정
| 등급 | 조건 |
|------|------|
| ✅ 완전 적합 | 모든 축의 차이 ≤ 허용오차 (기본: W/D ±20mm, H ±25mm) |
| ⚠️ 조건부 적합 | 모든 축의 차이 ≤ 허용오차 × 2 |
| 🔴 검토 필요 | 하나라도 허용오차 × 2 초과 |

### 정렬 순서
1. 적합도 우선 (완전 → 조건부 → 검토)
2. 총 오차 합산 낮은 순

---

## Supabase 전환 방법

`src/services/dataService.js`에서 localStorage 함수들만 Supabase 클라이언트 호출로 교체하면 됩니다.

```js
// 현재 (localStorage)
export function getProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialProducts;
}

// 전환 후 (Supabase)
export async function getProducts() {
  const { data } = await supabase.from('products').select('*');
  return data;
}
```

---

## 기본 허용오차

| 항목 | 가로 | 세로 | 높이 |
|------|------|------|------|
| 외경 | ±20mm | ±20mm | ±25mm |
| 내경 | ±20mm | ±20mm | ±25mm |

UI의 "허용오차 설정"에서 검색마다 자유롭게 변경 가능합니다.
