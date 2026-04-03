/**
 * App.jsx
 * 루트 컴포넌트 – 페이지 라우팅 (단순 상태 기반)
 *
 * 추후 react-router-dom을 도입할 경우 이 파일에서 Route를 정의합니다.
 */
import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}
