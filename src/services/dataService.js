/**
 * dataService.js
 * 데이터 접근 레이어 (Data Access Layer)
 *
 * 현재는 localStorage를 사용하여 products.json을 기반으로 데이터를 관리합니다.
 * 추후 Supabase 등 외부 DB로 교체 시, 이 파일의 함수만 수정하면 됩니다.
 */

import initialProducts from '../data/products.json';

const STORAGE_KEY = 'cooling_box_products';

/**
 * 로컬스토리지에서 제품 목록을 불러옵니다.
 * 최초 실행 시 products.json 데이터로 초기화합니다.
 */
export function getProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 최초 실행: JSON 파일 데이터로 초기화
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  } catch {
    return initialProducts;
  }
}

/**
 * 활성화된 제품만 반환합니다.
 */
export function getActiveProducts() {
  return getProducts().filter((p) => p.active);
}

/**
 * 새 제품을 추가합니다.
 * @param {Object} product - 추가할 제품 객체 (id 없이 전달하면 자동 생성)
 */
export function addProduct(product) {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: product.id || `CUSTOM-${Date.now()}`,
    active: true,
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return newProduct;
}

/**
 * 기존 제품을 수정합니다.
 * @param {string} id - 수정할 제품 ID
 * @param {Object} updates - 수정할 필드
 */
export function updateProduct(id, updates) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`제품을 찾을 수 없습니다: ${id}`);
  products[index] = { ...products[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return products[index];
}

/**
 * 제품 활성/비활성을 토글합니다.
 * @param {string} id - 제품 ID
 */
export function toggleProductActive(id) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`제품을 찾을 수 없습니다: ${id}`);
  products[index].active = !products[index].active;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return products[index];
}

/**
 * 제품을 삭제합니다. (완전 삭제)
 * @param {string} id - 삭제할 제품 ID
 */
export function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 모든 데이터를 초기(products.json) 상태로 리셋합니다.
 */
export function resetToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
  return initialProducts;
}
