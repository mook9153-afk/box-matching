/**
 * QuotePage.jsx
 * 견적 계산 페이지
 *
 * 계산 흐름:
 *   기본 개당 단가 (운임 제외) = 중량(g) × 상차가(원/g)
 *   개당 운임비               = 총 운임비 ÷ 수량
 *   운임 녹인 개당 단가       = 기본 개당 단가 + 개당 운임비
 *   원/g (운임 포함)          = 운임 녹인 개당 단가 ÷ 중량(g)
 *   공급가액                  = 운임 녹인 개당 단가 × 수량
 *
 *   [VAT 별도]  부가세 = 공급가액 × 0.1   /  총합계 = 공급가액 + 부가세
 *   [VAT 포함]  부가세 = 공급가액 ÷ 11    /  총합계 = 공급가액
 */
import React, { useState, useEffect } from 'react';

const COMPANY_CLASS = {
  '태성산업': 'company-badge--ts',
  '세광이피에스': 'company-badge--sk',
};

const TRUCK_KEYS = [
  { key: '1t',   label: '1톤',   field: 'qty1t'  },
  { key: '3.5t', label: '3.5톤', field: 'qty35t' },
  { key: '5t',   label: '5톤',   field: 'qty5t'  },
];

/** 원 단위 정수 포맷 (반올림) */
function fmtWon(n) {
  if (!isFinite(n) || isNaN(n)) return '-';
  return Math.round(n).toLocaleString('ko-KR');
}

/** 소수점 포맷 */
function fmtDec(n, digits = 2) {
  if (!isFinite(n) || isNaN(n)) return '-';
  return n.toFixed(digits);
}

/**
 * 견적 계산 함수
 * @param {number} weight    - 제품 중량 (g)
 * @param {number} perGNum   - 상차가 (원/g)
 * @param {number} qty       - 수량 (개)
 * @param {number} freightN  - 총 운임비 (원)
 * @param {boolean} vatOn    - VAT 포함 여부
 */
function calculateQuote({ weight, perGNum, qty, freightN, vatOn }) {
  const baseUnitPrice  = weight * perGNum;                          // 기본 개당 단가 (운임 제외)
  const freightPerUnit = qty > 0 ? freightN / qty : 0;             // 개당 운임비
  const unitPriceTotal = baseUnitPrice + freightPerUnit;            // 운임 녹인 개당 단가
  const perGTotal      = weight > 0 ? unitPriceTotal / weight : 0; // 원/g (운임 포함)
  const supplyAmount   = unitPriceTotal * qty;                      // 공급가액

  // VAT 계산: 모드에 따라 분기
  const vat   = vatOn ? supplyAmount / 11      : supplyAmount * 0.1;
  const total = vatOn ? supplyAmount           : supplyAmount + vat;

  return { baseUnitPrice, freightPerUnit, unitPriceTotal, perGTotal, supplyAmount, vat, total };
}

export default function QuotePage({ product, onBack }) {
  const [perG,    setPerG]    = useState('');    // 상차가 (원/g)
  const [truck,   setTruck]   = useState(null);  // '1t' | '3.5t' | '5t'
  const [freight, setFreight] = useState('');    // 총 운임비 (원)
  const [vatOn,   setVatOn]   = useState(false); // VAT 포함 여부

  // 제품이 바뀌면 입력 초기화
  useEffect(() => {
    setPerG('');
    setTruck(null);
    setFreight('');
    setVatOn(false);
  }, [product?.id]);

  if (!product) {
    return (
      <main className="page-main">
        <div className="quote-empty">
          <div className="placeholder-icon">📋</div>
          <div className="placeholder-text">선택된 제품이 없습니다.</div>
          <button className="btn btn--primary" onClick={onBack}>검색으로 돌아가기</button>
        </div>
      </main>
    );
  }

  const weight   = Math.max(0, product.weight  || 0);
  const perGNum  = Math.max(0, parseFloat(perG)    || 0);
  const freightN = Math.max(0, parseFloat(freight) || 0);

  const getQty = (key) => {
    if (key === '1t')   return product.qty1t  || 0;
    if (key === '3.5t') return product.qty35t || 0;
    if (key === '5t')   return product.qty5t  || 0;
    return 0;
  };
  const qty = truck ? getQty(truck) : 0;

  // 단가와 수량이 모두 있어야 계산 표시
  const canCalc = perGNum > 0 && qty > 0;

  const {
    baseUnitPrice,
    freightPerUnit,
    unitPriceTotal,
    perGTotal,
    supplyAmount,
    vat,
    total,
  } = canCalc
    ? calculateQuote({ weight, perGNum, qty, freightN, vatOn })
    : {};

  // VAT 모드에 따른 라벨
  const supplyLabel = vatOn ? '공급가액 (VAT 포함)' : '공급가액 (VAT 별도)';
  const vatLabel    = vatOn ? '부가세 (역산 ÷11)'   : '부가세 (10%)';

  const outerStr = product.outer
    ? `${product.outer.w} × ${product.outer.d} × ${product.outer.h} mm`
    : '-';
  const innerStr = product.inner
    ? `${product.inner.w} × ${product.inner.d} × ${product.inner.h} mm`
    : '-';

  return (
    <main className="page-main">
      <div className="quote-layout">
        {/* 상단 뒤로가기 */}
        <div className="quote-topbar">
          <button className="btn btn--ghost btn--sm" onClick={onBack}>
            ← 검색으로 돌아가기
          </button>
          <h2 className="quote-page-title">견적 계산</h2>
        </div>

        <div className="quote-body">
          {/* ── 왼쪽: 제품 정보 + 입력 ───────────────────────── */}
          <div className="quote-left">

            {/* 제품 정보 카드 */}
            <div className="quote-card">
              <div className="quote-card-header">
                <span className="quote-section-title">제품 정보</span>
                <span className={`company-badge ${COMPANY_CLASS[product.company] || ''}`}>
                  {product.company}
                </span>
              </div>
              <div className="quote-product-name">
                <span className="card-code">{product.code}</span>
                <span className="quote-name">{product.name}</span>
              </div>
              <div className="quote-product-specs">
                <div className="quote-spec-row">
                  <span className="quote-spec-label">중량</span>
                  <span className="quote-spec-value">{weight} g</span>
                </div>
                <div className="quote-spec-row">
                  <span className="quote-spec-label">외경</span>
                  <span className="quote-spec-value">{outerStr}</span>
                </div>
                <div className="quote-spec-row">
                  <span className="quote-spec-label">내경</span>
                  <span className="quote-spec-value">{innerStr}</span>
                </div>
              </div>
            </div>

            {/* 견적 입력 카드 */}
            <div className="quote-card">
              <div className="quote-section-title">견적 입력</div>

              {/* 상차가 입력 */}
              <div className="quote-field">
                <label className="quote-label">
                  상차가 <span className="quote-unit">(원 / g)</span>
                </label>
                <input
                  type="number"
                  className="form-input quote-input"
                  placeholder="예: 12.5"
                  min="0"
                  step="0.01"
                  value={perG}
                  onChange={(e) => setPerG(e.target.value)}
                />
              </div>

              {/* 수량 – 트럭 버튼 */}
              <div className="quote-field">
                <label className="quote-label">수량 선택 (트럭 기준)</label>
                <div className="quote-qty-tabs">
                  {TRUCK_KEYS.map(({ key, label, field }) => {
                    const q   = product[field] || 0;
                    const act = truck === key;
                    return (
                      <button
                        key={key}
                        className={[
                          'quote-qty-btn',
                          act     ? 'quote-qty-btn--active' : '',
                          q === 0 ? 'quote-qty-btn--empty'  : '',
                        ].join(' ').trim()}
                        onClick={() => setTruck(key)}
                      >
                        {label}
                        <span className="quote-qty-sub">
                          {q > 0 ? q.toLocaleString('ko-KR') + '개' : '미입력'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {truck && qty > 0 && (
                  <div className="quote-qty-display">
                    선택 수량:{' '}
                    <span className="quote-qty-num">{qty.toLocaleString('ko-KR')}</span> 개
                  </div>
                )}
                {truck && qty === 0 && (
                  <div className="quote-qty-na">
                    해당 트럭의 적재 수량이 입력되지 않았습니다.
                  </div>
                )}
              </div>

              {/* 총 운임비 */}
              <div className="quote-field">
                <label className="quote-label">
                  총 운임비 <span className="quote-unit">(원)</span>
                </label>
                <input
                  type="number"
                  className="form-input quote-input"
                  placeholder="예: 150000"
                  min="0"
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 견적 결과 ─────────────────────────────── */}
          <div className="quote-right">
            <div className="quote-card quote-result-card">
              <div className="quote-card-header">
                <span className="quote-section-title">견적 결과</span>
                {/* VAT 토글 */}
                <button
                  className={`vat-toggle-btn${vatOn ? ' vat-toggle-btn--on' : ''}`}
                  onClick={() => setVatOn((v) => !v)}
                >
                  {vatOn ? 'VAT 포함' : 'VAT 별도'}
                </button>
              </div>

              {!canCalc ? (
                <div className="quote-result-placeholder">
                  단가와 수량을 입력하면 결과가 표시됩니다.
                </div>
              ) : (
                <div className="quote-result-rows">

                  {/* 계산 과정 */}
                  <div className="quote-section-sub">계산 과정</div>

                  <div className="quote-result-row">
                    <span className="quote-result-label">
                      기본 개당 단가
                      <small className="quote-result-small"> (운임 제외)</small>
                    </span>
                    <span className="quote-result-value">
                      {fmtWon(baseUnitPrice)}{' '}
                      <span className="quote-result-unit">원</span>
                    </span>
                  </div>
                  <div className="quote-result-detail">
                    <span className="quote-result-formula">
                      {weight}g × {perGNum}원/g = {fmtWon(baseUnitPrice)}원
                    </span>
                  </div>

                  {freightN > 0 && (
                    <>
                      <div className="quote-result-row">
                        <span className="quote-result-label">개당 운임비</span>
                        <span className="quote-result-value">
                          {fmtDec(freightPerUnit, 1)}{' '}
                          <span className="quote-result-unit">원</span>
                        </span>
                      </div>
                      <div className="quote-result-detail">
                        <span className="quote-result-formula">
                          {fmtWon(freightN)}원 ÷ {qty.toLocaleString('ko-KR')}개
                          {' = '}{fmtDec(freightPerUnit, 1)}원
                        </span>
                      </div>
                    </>
                  )}

                  <div className="quote-result-divider" />

                  {/* 핵심 단가 강조 */}
                  <div className="quote-result-row quote-result-row--highlight">
                    <span className="quote-result-label">운임 녹인 개당 단가</span>
                    <span className="quote-result-value">
                      {fmtWon(unitPriceTotal)}{' '}
                      <span className="quote-result-unit">원</span>
                    </span>
                  </div>

                  <div className="quote-result-row quote-result-row--highlight">
                    <span className="quote-result-label">
                      원/g
                      <small className="quote-result-small"> (운임 포함)</small>
                    </span>
                    <span className="quote-result-value">
                      {fmtDec(perGTotal, 2)}{' '}
                      <span className="quote-result-unit">원/g</span>
                    </span>
                  </div>

                  <div className="quote-result-divider" />

                  {/* 최종 결과 */}
                  <div className="quote-section-sub">최종 결과</div>

                  <div className="quote-result-row">
                    <span className="quote-result-label">{supplyLabel}</span>
                    <span className="quote-result-value">
                      {fmtWon(supplyAmount)}{' '}
                      <span className="quote-result-unit">원</span>
                    </span>
                  </div>
                  <div className="quote-result-detail">
                    <span className="quote-result-formula">
                      {fmtWon(unitPriceTotal)}원 × {qty.toLocaleString('ko-KR')}개
                      {' = '}{fmtWon(supplyAmount)}원
                    </span>
                  </div>

                  <div className="quote-result-row">
                    <span className="quote-result-label">{vatLabel}</span>
                    <span className="quote-result-value">
                      {fmtWon(vat)}{' '}
                      <span className="quote-result-unit">원</span>
                    </span>
                  </div>

                  <div className="quote-result-total-row">
                    <span className="quote-result-total-label">
                      총 합계
                      <span className="quote-result-total-vat"> (VAT 포함)</span>
                    </span>
                    <span className="quote-result-total-value">
                      {fmtWon(total)}{' '}
                      <span className="quote-result-total-unit">원</span>
                    </span>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
