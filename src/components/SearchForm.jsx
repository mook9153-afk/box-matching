/**
 * SearchForm.jsx
 * 규격 입력 폼 컴포넌트
 *
 * - 외경 / 내경 입력 (가로*세로*높이 mm)
 * - 비교 대상 회사 선택
 * - 허용오차 고급 설정 (접기/펼치기)
 */
import React, { useState } from 'react';
import { DEFAULT_TOLERANCE } from '../services/matchingService';

const COMPANIES = ['전체', '태성산업', '세광이피에스'];

export default function SearchForm({ onSearch, loading }) {
  const [outerStr, setOuterStr] = useState('');
  const [innerStr, setInnerStr] = useState('');
  const [company, setCompany] = useState('전체');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tolerance, setTolerance] = useState(DEFAULT_TOLERANCE);

  // 허용오차 변경 핸들러
  const handleTolChange = (type, axis, value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setTolerance((prev) => ({
      ...prev,
      [type]: { ...prev[type], [axis]: num },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ outerStr: outerStr.trim(), innerStr: innerStr.trim(), company, tolerance });
  };

  const handleReset = () => {
    setOuterStr('');
    setInnerStr('');
    setCompany('전체');
    setTolerance(DEFAULT_TOLERANCE);
    onSearch(null); // 결과 초기화
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-section-title">규격 입력</div>

      {/* 회사 선택 */}
      <div className="form-row">
        <label className="form-label">비교 대상</label>
        <div className="company-tabs">
          {COMPANIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`company-tab${company === c ? ' company-tab--active' : ''}`}
              onClick={() => setCompany(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 외경 입력 */}
      <div className="form-row">
        <label className="form-label" htmlFor="outer-input">
          외경 <span className="form-hint">(가로 × 세로 × 높이 mm)</span>
        </label>
        <input
          id="outer-input"
          className="form-input"
          type="text"
          inputMode="numeric"
          placeholder="예) 385*283*275"
          value={outerStr}
          onChange={(e) => setOuterStr(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* 내경 입력 */}
      <div className="form-row">
        <label className="form-label" htmlFor="inner-input">
          내경 <span className="form-hint">(가로 × 세로 × 높이 mm)</span>
        </label>
        <input
          id="inner-input"
          className="form-input"
          type="text"
          inputMode="numeric"
          placeholder="예) 340*240*220"
          value={innerStr}
          onChange={(e) => setInnerStr(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* 입력 가이드 */}
      <p className="form-guide">
        외경/내경 중 하나만 입력해도 검색 가능합니다. 구분자는 *(곱하기), x, 공백 모두 허용됩니다.
      </p>

      {/* 고급 설정 (허용오차) */}
      <div className="advanced-toggle" onClick={() => setShowAdvanced((v) => !v)}>
        <span>{showAdvanced ? '▲' : '▼'} 허용오차 설정</span>
        <span className="advanced-badge">
          외경 ±{tolerance.outer.w}/{tolerance.outer.d}/{tolerance.outer.h}mm &nbsp;|&nbsp;
          내경 ±{tolerance.inner.w}/{tolerance.inner.d}/{tolerance.inner.h}mm
        </span>
      </div>

      {showAdvanced && (
        <div className="advanced-panel">
          <div className="tol-grid">
            {/* 외경 허용오차 */}
            <div className="tol-group">
              <div className="tol-group-title">외경 허용오차 (mm)</div>
              {[['w', '가로'], ['d', '세로'], ['h', '높이']].map(([axis, label]) => (
                <div className="tol-row" key={axis}>
                  <label>±{label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={tolerance.outer[axis]}
                    onChange={(e) => handleTolChange('outer', axis, e.target.value)}
                    className="tol-input"
                  />
                  <span>mm</span>
                </div>
              ))}
            </div>
            {/* 내경 허용오차 */}
            <div className="tol-group">
              <div className="tol-group-title">내경 허용오차 (mm)</div>
              {[['w', '가로'], ['d', '세로'], ['h', '높이']].map(([axis, label]) => (
                <div className="tol-row" key={axis}>
                  <label>±{label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={tolerance.inner[axis]}
                    onChange={(e) => handleTolChange('inner', axis, e.target.value)}
                    className="tol-input"
                  />
                  <span>mm</span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setTolerance(DEFAULT_TOLERANCE)}
          >
            기본값으로 초기화
          </button>
        </div>
      )}

      {/* 버튼 */}
      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? '검색 중...' : '🔍 규격 검색'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleReset}>
          초기화
        </button>
      </div>
    </form>
  );
}
