/**
 * matchingService.js
 * 규격 매칭 핵심 로직
 *
 * 입력된 외경/내경 치수와 제품 데이터를 비교하여
 * 적합도 점수와 차이값을 계산합니다.
 */

// ─── 기본 허용 오차 설정 ─────────────────────────────────────────────────────
export const DEFAULT_TOLERANCE = {
  outer: { w: 20, d: 20, h: 25 }, // 외경 허용오차 (mm): 가로±20, 세로±20, 높이±25
  inner: { w: 20, d: 20, h: 25 }, // 내경 허용오차 (mm): 가로±20, 세로±20, 높이±25
};

// 적합도 등급 상수
export const FITNESS = {
  PERFECT: '완전 적합',
  CONDITIONAL: '조건부 적합',
  REVIEW: '검토 필요',
};

// 적합도 우선순위 (정렬용)
const FITNESS_ORDER = {
  [FITNESS.PERFECT]: 0,
  [FITNESS.CONDITIONAL]: 1,
  [FITNESS.REVIEW]: 2,
};

/**
 * 치수 문자열을 파싱하여 { w, d, h } 객체를 반환합니다.
 * 지원 형식: "275*212*153", "275x212x153", "275×212×153", "275 212 153"
 *
 * @param {string} str - 치수 문자열
 * @returns {{ w: number, d: number, h: number } | null}
 */
export function parseDimension(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str
    .trim()
    .replace(/[×xX*\s]+/g, ',')
    .split(',')
    .map((v) => parseFloat(v.trim()))
    .filter((v) => !isNaN(v) && v > 0);

  if (parts.length === 3) {
    return { w: parts[0], d: parts[1], h: parts[2] };
  }
  return null;
}

/**
 * 두 치수 객체의 차이를 계산합니다.
 *
 * @param {{ w, d, h }} input - 입력 치수
 * @param {{ w, d, h }} product - 제품 치수
 * @returns {{ w: number, d: number, h: number, total: number }}
 */
function calcDiff(input, product) {
  const w = Math.abs(input.w - product.w);
  const d = Math.abs(input.d - product.d);
  const h = Math.abs(input.h - product.h);
  return { w, d, h, total: w + d + h };
}

/**
 * 차이값과 허용오차를 비교하여 모든 항목이 오차 이내인지 확인합니다.
 *
 * @param {{ w, d, h }} diff
 * @param {{ w, d, h }} tolerance
 * @param {number} multiplier - 1 = 1배 오차, 2 = 2배 오차
 * @returns {boolean}
 */
function withinTolerance(diff, tolerance, multiplier = 1) {
  return (
    diff.w <= tolerance.w * multiplier &&
    diff.d <= tolerance.d * multiplier &&
    diff.h <= tolerance.h * multiplier
  );
}

/**
 * 적합도 등급을 판별합니다.
 * - 완전 적합: 모든 입력 항목의 차이가 허용오차 이내
 * - 조건부 적합: 모든 차이가 허용오차 2배 이내
 * - 검토 필요: 하나라도 허용오차 2배 초과
 *
 * @param {Object|null} outerDiff - 외경 차이 (외경 미입력 시 null)
 * @param {Object|null} innerDiff - 내경 차이 (내경 미입력 시 null)
 * @param {Object} tolerance - 허용오차
 * @returns {string} 적합도 등급
 */
function getFitness(outerDiff, innerDiff, tolerance) {
  const checks1x = [];
  const checks2x = [];

  if (outerDiff) {
    checks1x.push(withinTolerance(outerDiff, tolerance.outer, 1));
    checks2x.push(withinTolerance(outerDiff, tolerance.outer, 2));
  }
  if (innerDiff) {
    checks1x.push(withinTolerance(innerDiff, tolerance.inner, 1));
    checks2x.push(withinTolerance(innerDiff, tolerance.inner, 2));
  }

  if (checks1x.length > 0 && checks1x.every(Boolean)) return FITNESS.PERFECT;
  if (checks2x.length > 0 && checks2x.every(Boolean)) return FITNESS.CONDITIONAL;
  return FITNESS.REVIEW;
}

/**
 * 제품 목록에서 입력 치수와 가장 적합한 제품들을 찾아 반환합니다.
 *
 * @param {Object} params
 * @param {string} params.outerStr - 외경 입력 문자열 (없으면 빈 문자열)
 * @param {string} params.innerStr - 내경 입력 문자열 (없으면 빈 문자열)
 * @param {string} params.company  - 비교 대상 ('전체' | '태성산업' | '세광이피에스')
 * @param {Object} params.tolerance - 허용오차 객체
 * @param {Array}  params.products  - 전체 활성 제품 배열
 * @returns {Array} 매칭 결과 배열 (정렬됨)
 */
export function matchProducts({ outerStr, innerStr, company, tolerance, products }) {
  // 1. 입력값 파싱
  const inputOuter = parseDimension(outerStr);
  const inputInner = parseDimension(innerStr);

  // 입력값이 하나도 없으면 빈 배열 반환
  if (!inputOuter && !inputInner) return [];

  // 2. 회사 필터
  const filtered =
    company === '전체'
      ? products
      : products.filter((p) => p.company === company);

  // 3. 각 제품에 대해 차이 계산 및 적합도 판별
  const results = filtered.map((product) => {
    const outerDiff = inputOuter ? calcDiff(inputOuter, product.outer) : null;
    const innerDiff = inputInner ? calcDiff(inputInner, product.inner) : null;

    // 입력된 항목만으로 총 점수 계산
    const totalScore =
      (outerDiff ? outerDiff.total : 0) + (innerDiff ? innerDiff.total : 0);

    const fitness = getFitness(outerDiff, innerDiff, tolerance);

    return {
      ...product,
      outerDiff,
      innerDiff,
      totalScore,
      fitness,
    };
  });

  // 4. 정렬: 적합도 우선 → 총 오차 낮은 순
  results.sort((a, b) => {
    const fo = FITNESS_ORDER[a.fitness] - FITNESS_ORDER[b.fitness];
    if (fo !== 0) return fo;
    return a.totalScore - b.totalScore;
  });

  return results;
}

/**
 * 차이값을 "±Nmm" 형식의 문자열로 변환합니다.
 *
 * @param {number} val
 * @returns {string}
 */
export function formatDiff(val) {
  if (val === undefined || val === null) return '-';
  return `±${val}`;
}

/**
 * 치수 객체를 "W × D × H" 표시 문자열로 변환합니다.
 *
 * @param {{ w, d, h }} dim
 * @returns {string}
 */
export function formatDim(dim) {
  if (!dim) return '-';
  return `${dim.w} × ${dim.d} × ${dim.h}`;
}
