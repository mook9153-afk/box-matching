/**
 * Header.jsx
 * 상단 헤더 네비게이션 컴포넌트
 */
import React from 'react';

export default function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* 로고 / 시스템명 */}
        <div className="header-brand">
          <span className="header-icon">📦</span>
          <div>
            <div className="header-title">보냉박스 규격 매칭 시스템</div>
            <div className="header-subtitle">태성산업 · 세광이피에스</div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="header-nav">
          <button
            className={`nav-btn${currentPage === 'home' ? ' nav-btn--active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            규격 검색
          </button>
          <button
            className={`nav-btn${currentPage === 'admin' ? ' nav-btn--active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            제품 관리
          </button>
        </nav>
      </div>
    </header>
  );
}
