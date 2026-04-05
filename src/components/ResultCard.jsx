/**
 * ResultCard.jsx
 * 개별 매칭 결과 카드 컴포넌트
 *
 * 각 제품의 적합도, 규격, 차이값을 카드 형식으로 표시합니다.
 */
import React from 'react';
import { FITNESS } from '../services/matchingService';

/** 적합도 → CSS 클래스명 매핑 */
const FITNESS_CLASS = {
  [FITNESS.PERFECT]: 'fitness--perfect',
  [FITNESS.CONDITIONAL]: 'fitness--conditional',
  [FITNESS.REVIEW]: 'fitness--review',
};

/** 적합도 → 아이콘 매핑 */
const FITNESS_ICON = {
  [FITNESS.PERFECT]: '✅',
  [FITNESS.CONDITIONAL]: '⚠️',
  [FITNESS.REVIEW]: '🔴',
};

/** 회사 → 배지 색상 클래스 */
const COMPANY_CLASS = {
  '태성산업': 'company-badge--ts',
  '세광이피에스': 'company-badge--sk',
};

/**
 * 차이값 표시 컴포넌트 (가로/세로/높이를 색상으로 구분)
 */
function DiffDisplay({ diff, tolerance, type }) {
  if (!diff) return <span className="diff-na">-</span>;

  const axes = [
    { key: 'w', label: '가로', tol: tolerance[type].w },
    { key: 'd', label: '세로', tol: tolerance[type].d },
    { key: 'h', label: '높이', tol: tolerance[type].h },
  ];

  return (
    <div className="diff-display">
      {axes.map(({ key, label, tol }) => {
        const val = diff[key];
        const ok1 = val <= tol;
        const ok2 = val <= tol * 2;
        const cls = ok1 ? 'diff-ok' : ok2 ? 'diff-warn' : 'diff-bad';
        return (
          <span key={key} className={`diff-chip ${cls}`}>
            {label} ±{val}
          </span>
        );
      })}
    </div>
  );
}

export default function ResultCard({ result, rank, tolerance, hasOuter, hasInner, onQuote }) {
  const fitnessClass = FITNESS_CLASS[result.fitness] || '';
  const fitnessIcon = FITNESS_ICON[result.fitness] || '';
  const companyClass = COMPANY_CLASS[result.company] || '';

  return (
    <div className={`result-card ${fitnessClass}`}>
      {/* 카드 상단: 순위 + 적합도 + 회사 */}
      <div className="card-header">
        <div className="card-rank">#{rank}</div>
        <div className={`fitness-badge ${fitnessClass}`}>
          {fitnessIcon} {result.fitness}
        </div>
        <div className={`company-badge ${companyClass}`}>{result.company}</div>
      </div>

      {/* 제품 기본 정보 */}
      <div className="card-body">
        <div className="card-product-name">
          <span className="card-code">{result.code}</span>
          <span className="card-name">{result.name}</span>
        </div>
        <div className="card-weight">중량 {result.weight}g</div>
      </div>

      {/* 규격 비교 테이블 */}
      <div className="card-dims">
        {/* 외경 */}
        {hasOuter && (
          <div className="dim-row">
            <div className="dim-label">외경</div>
            <div className="dim-value">
              {result.outer.w} × {result.outer.d} × {result.outer.h} mm
            </div>
            <div className="dim-diff">
              <DiffDisplay diff={result.outerDiff} tolerance={tolerance} type="outer" />
            </div>
          </div>
        )}

        {/* 내경 */}
        {hasInner && (
          <div className="dim-row">
            <div className="dim-label">내경</div>
            <div className="dim-value">
              {result.inner.w} × {result.inner.d} × {result.inner.h} mm
            </div>
            <div className="dim-diff">
              <DiffDisplay diff={result.innerDiff} tolerance={tolerance} type="inner" />
            </div>
          </div>
        )}
      </div>

      {/* 총 오차 점수 + 견적 버튼 */}
      <div className="card-footer">
        <div className="card-footer-left">
          <span className="score-label">총 오차</span>
          <span className="score-value">{result.totalScore} mm</span>
          {result.notes && <span className="card-notes">{result.notes}</span>}
        </div>
        {onQuote && (
          <button
            className="btn btn--quote"
            onClick={() => onQuote(result)}
          >
            견적 내기
          </button>
        )}
      </div>
    </div>
  );
}
