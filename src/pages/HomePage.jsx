/**
 * HomePage.jsx
 * 메인 규격 검색 페이지
 */
import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import ResultList from '../components/ResultList';
import { matchProducts } from '../services/matchingService';
import { getActiveProducts } from '../services/dataService';

export default function HomePage() {
  const [results, setResults] = useState(null);      // null = 미검색, [] = 결과 없음
  const [loading, setLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState(null); // 마지막 검색 파라미터 저장
  const [tolerance, setTolerance] = useState(null);

  const handleSearch = (params) => {
    if (!params) {
      // 초기화
      setResults(null);
      setLastSearch(null);
      return;
    }

    setLoading(true);
    // 실제 DB 연동 시에는 async/await 사용 가능
    try {
      const activeProducts = getActiveProducts();
      const matched = matchProducts({
        outerStr: params.outerStr,
        innerStr: params.innerStr,
        company: params.company,
        tolerance: params.tolerance,
        products: activeProducts,
      });
      setResults(matched);
      setLastSearch(params);
      setTolerance(params.tolerance);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <div className="page-layout">
        {/* 좌측/상단: 검색 폼 */}
        <aside className="search-sidebar">
          <SearchForm onSearch={handleSearch} loading={loading} />

          {/* 사용법 안내 */}
          <div className="usage-guide">
            <div className="guide-title">사용 방법</div>
            <ol className="guide-list">
              <li>비교할 제조사를 선택하세요 (기본: 전체)</li>
              <li>외경 또는 내경 치수를 입력하세요</li>
              <li>형식: <code>가로*세로*높이</code> (mm)</li>
              <li>허용오차를 조정하려면 "허용오차 설정"을 클릭하세요</li>
              <li>검색 결과는 적합도 우선으로 정렬됩니다</li>
            </ol>
            <div className="guide-legend">
              <span className="fitness-dot dot--perfect" /> 완전 적합: 모든 치수 허용오차 이내<br />
              <span className="fitness-dot dot--conditional" /> 조건부 적합: 허용오차 2배 이내<br />
              <span className="fitness-dot dot--review" /> 검토 필요: 허용오차 초과
            </div>
          </div>
        </aside>

        {/* 우측/하단: 검색 결과 */}
        <section className="result-section">
          {!results && !loading && (
            <div className="result-placeholder">
              <div className="placeholder-icon">📐</div>
              <div className="placeholder-text">외경 또는 내경을 입력하고 검색하세요</div>
              <div className="placeholder-sub">
                입력한 치수와 가장 유사한 제품을 추천해 드립니다
              </div>
            </div>
          )}
          {results && (
            <ResultList
              results={results}
              tolerance={tolerance}
              searchParams={lastSearch}
            />
          )}
        </section>
      </div>
    </main>
  );
}
