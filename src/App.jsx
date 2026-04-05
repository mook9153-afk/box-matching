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
import QuotePage from './pages/QuotePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [quoteProduct, setQuoteProduct] = useState(null);

  const handleNavigate = (page) => {
    if (page !== 'quote') setQuoteProduct(null);
    setCurrentPage(page);
  };

  const handleQuote = (product) => {
    setQuoteProduct(product);
    setCurrentPage('quote');
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'home' && <HomePage onQuote={handleQuote} />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'quote' && <QuotePage product={quoteProduct} onBack={() => handleNavigate('home')} />}
    </div>
  );
}
