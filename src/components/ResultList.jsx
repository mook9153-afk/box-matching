/**
 * ResultList.jsx
 * 매칭 결과 목록 컴포넌트
 *
 * - 결과 카드 목록 렌더링
 * - 클립보드 복사 / CSV 다운로드 버튼
 * - 필터 탭 (전체 / 완전 적합 / 조건부 적합 / 검토 필요)
 */
import React, { useState } from 'react';
import ResultCard from './ResultCard';
import { FITNESS } from '../services/matchingService';
import { copyToClipboard, downloadCSV } from '../utils/exportUtils';

const FILTER_TABS = ['전체', FITNESS.PERFECT, FITNESS.CONDITIONAL, FITNESS.REVIEW];

export default function ResultList({ results, tolerance, searchParams }) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [copyStatus, setCopyStatus] = useState('');

  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className="result-empty">
        <div className="empty-icon">🔍</div>
        <div>검색 결과가 없습니다.</div>
        <div className="empty-sub">입력 치수나 허용오차를 조정해 보세요.</div>
      </div>
    );
  }

  // 필터 탭 카운트
  const countByFitness = {
    [FITNESS.PERFECT]: results.filter((r) => r.fitness === FITNESS.PERFECT).length,
    [FITNESS.CONDITIONAL]: results.filter((r) => r.fitness === FITNESS.CONDITIONAL).length,
    [FITNESS.REVIEW]: results.filter((r) => r.fitness === FITNESS.REVIEW).length,
  };

  // 현재 필터 적용
  const filtered =
    activeFilter === '전체'
      ? results
      : results.filter((r) => r.fitness === activeFilter);

  // 클립보드 복사
  const handleCopy = async () => {
    const ok = await copyToClipboard(filtered);
    setCopyStatus(ok ? '복사 완료!' : '복사 실패');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // CSV 다운로드
  const handleCSV = () => downloadCSV(filtered);

  const hasOuter = !!searchParams?.outerStr;
  const hasInner = !!searchParams?.innerStr;

  return (
    <div className="result-list">
      {/* 결과 헤더 */}
      <div className="result-header">
        <div className="result-title">
          검색 결과 <span className="result-count">{results.length}건</span>
        </div>
        <div className="result-actions">
          <button className="btn btn--ghost btn--sm" onClick={handleCopy}>
            {copyStatus || '📋 복사'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleCSV}>
            📥 CSV 저장
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="filter-tabs">
        {FILTER_TABS.map((tab) => {
          const count = tab === '전체' ? results.length : countByFitness[tab];
          return (
            <button
              key={tab}
              className={`filter-tab${activeFilter === tab ? ' filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 카드 목록 */}
      <div className="card-grid">
        {filtered.map((result, i) => (
          <ResultCard
            key={result.id}
            result={result}
            rank={results.indexOf(result) + 1}
            tolerance={tolerance}
            hasOuter={hasOuter}
            hasInner={hasInner}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="result-empty">해당 적합도의 결과가 없습니다.</div>
      )}
    </div>
  );
}
