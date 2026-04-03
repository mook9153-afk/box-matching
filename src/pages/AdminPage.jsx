/**
 * AdminPage.jsx
 * 제품 관리 페이지
 */
import React, { useState, useEffect } from 'react';
import AdminPanel from '../components/AdminPanel';
import {
  getProducts,
  addProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
  resetToDefault,
} from '../services/dataService';

export default function AdminPage() {
  const [products, setProducts] = useState([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleAdd = (data) => {
    addProduct(data);
    setProducts(getProducts());
  };

  const handleUpdate = (id, data) => {
    updateProduct(id, data);
    setProducts(getProducts());
  };

  const handleToggle = (id) => {
    toggleProductActive(id);
    setProducts(getProducts());
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setProducts(getProducts());
  };

  const handleReset = () => {
    resetToDefault();
    setProducts(getProducts());
  };

  return (
    <main className="page-main">
      <div className="admin-page-wrapper">
        <AdminPanel
          products={products}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
