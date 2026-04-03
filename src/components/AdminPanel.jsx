/**
 * AdminPanel.jsx
 * 제품 관리 패널 컴포넌트
 *
 * - 제품 목록 테이블 (전체 / 활성화 필터)
 * - 제품 추가 폼
 * - 제품 수정 모달
 * - 활성/비활성 토글
 * - 기본값 초기화
 */
import React, { useState } from 'react';

const EMPTY_FORM = {
  company: '태성산업',
  code: '',
  name: '',
  weight: '',
  outer: { w: '', d: '', h: '' },
  inner: { w: '', d: '', h: '' },
  notes: '',
};

/** 빈 폼 값을 숫자로 변환하여 제품 객체를 만듭니다 */
function formToProduct(form) {
  return {
    ...form,
    weight: parseFloat(form.weight) || 0,
    outer: {
      w: parseFloat(form.outer.w) || 0,
      d: parseFloat(form.outer.d) || 0,
      h: parseFloat(form.outer.h) || 0,
    },
    inner: {
      w: parseFloat(form.inner.w) || 0,
      d: parseFloat(form.inner.d) || 0,
      h: parseFloat(form.inner.h) || 0,
    },
  };
}

/** 제품 객체를 폼 값으로 변환합니다 */
function productToForm(p) {
  return {
    company: p.company,
    code: p.code,
    name: p.name,
    weight: String(p.weight),
    outer: { w: String(p.outer.w), d: String(p.outer.d), h: String(p.outer.h) },
    inner: { w: String(p.inner.w), d: String(p.inner.d), h: String(p.inner.h) },
    notes: p.notes || '',
  };
}

/** 치수 입력 그룹 (가로/세로/높이) */
function DimInputGroup({ label, value, onChange }) {
  return (
    <div className="dim-input-group">
      <div className="dim-input-label">{label} (mm)</div>
      <div className="dim-input-row">
        {[['w', '가로'], ['d', '세로'], ['h', '높이']].map(([axis, axisLabel]) => (
          <div key={axis} className="dim-input-item">
            <label className="dim-axis-label">{axisLabel}</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              className="form-input form-input--sm"
              value={value[axis]}
              onChange={(e) => onChange(axis, e.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 제품 추가/수정 폼 */
function ProductForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setDim = (type, axis, val) =>
    setForm((f) => ({ ...f, [type]: { ...f[type], [axis]: val } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      alert('코드와 제품명은 필수입니다.');
      return;
    }
    onSubmit(formToProduct(form));
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-grid-2">
        {/* 회사 */}
        <div className="form-row">
          <label className="form-label">회사 *</label>
          <select className="form-input" value={form.company} onChange={(e) => setField('company', e.target.value)}>
            <option>태성산업</option>
            <option>세광이피에스</option>
          </select>
        </div>
        {/* 코드 */}
        <div className="form-row">
          <label className="form-label">제품 코드 *</label>
          <input className="form-input" value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="예) TS-1" />
        </div>
        {/* 제품명 */}
        <div className="form-row">
          <label className="form-label">제품명 *</label>
          <input className="form-input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="예) 김치10K" />
        </div>
        {/* 중량 */}
        <div className="form-row">
          <label className="form-label">중량 (g)</label>
          <input type="number" inputMode="numeric" min="0" className="form-input" value={form.weight} onChange={(e) => setField('weight', e.target.value)} placeholder="0" />
        </div>
      </div>

      {/* 외경 */}
      <DimInputGroup
        label="외경"
        value={form.outer}
        onChange={(axis, val) => setDim('outer', axis, val)}
      />

      {/* 내경 */}
      <DimInputGroup
        label="내경"
        value={form.inner}
        onChange={(axis, val) => setDim('inner', axis, val)}
      />

      {/* 비고 */}
      <div className="form-row">
        <label className="form-label">비고</label>
        <input className="form-input" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="선택사항" />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">{submitLabel || '저장'}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}

export default function AdminPanel({
  products,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
  onReset,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // 수정 중인 제품 ID
  const [filterCompany, setFilterCompany] = useState('전체');
  const [filterActive, setFilterActive] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // 필터 적용
  const displayed = products.filter((p) => {
    if (filterCompany !== '전체' && p.company !== filterCompany) return false;
    if (filterActive === '활성' && !p.active) return false;
    if (filterActive === '비활성' && p.active) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        p.code.toLowerCase().includes(kw) ||
        p.name.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2 className="admin-title">제품 데이터 관리</h2>
        <div className="admin-actions">
          <button
            className="btn btn--primary btn--sm"
            onClick={() => { setShowAddForm(true); setEditTarget(null); }}
          >
            + 제품 추가
          </button>
          <button
            className="btn btn--danger btn--sm"
            onClick={() => setConfirmReset(true)}
          >
            기본값 초기화
          </button>
        </div>
      </div>

      {/* 초기화 확인 */}
      {confirmReset && (
        <div className="confirm-box">
          <span>⚠️ 모든 변경사항이 초기화됩니다. 계속하시겠습니까?</span>
          <button className="btn btn--danger btn--sm" onClick={() => { onReset(); setConfirmReset(false); }}>확인</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setConfirmReset(false)}>취소</button>
        </div>
      )}

      {/* 제품 추가 폼 */}
      {showAddForm && (
        <div className="admin-form-box">
          <h3>신규 제품 추가</h3>
          <ProductForm
            onSubmit={(data) => { onAdd(data); setShowAddForm(false); }}
            onCancel={() => setShowAddForm(false)}
            submitLabel="추가"
          />
        </div>
      )}

      {/* 필터 */}
      <div className="admin-filter-bar">
        <input
          className="form-input form-input--sm"
          placeholder="코드/제품명 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: '180px' }}
        />
        <select className="form-input form-input--sm" value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
          {['전체', '태성산업', '세광이피에스'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input form-input--sm" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
          {['전체', '활성', '비활성'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="admin-count">{displayed.length}건</span>
      </div>

      {/* 제품 테이블 */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>회사</th>
              <th>코드</th>
              <th>제품명</th>
              <th>중량</th>
              <th>외경 (W×D×H)</th>
              <th>내경 (W×D×H)</th>
              <th>비고</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((p) =>
              editTarget === p.id ? (
                /* 인라인 수정 행 */
                <tr key={p.id} className="edit-row">
                  <td colSpan={9}>
                    <ProductForm
                      initial={productToForm(p)}
                      onSubmit={(data) => { onUpdate(p.id, data); setEditTarget(null); }}
                      onCancel={() => setEditTarget(null)}
                      submitLabel="수정 저장"
                    />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className={p.active ? '' : 'row--inactive'}>
                  <td>
                    <span className={`status-dot ${p.active ? 'status-dot--on' : 'status-dot--off'}`} />
                  </td>
                  <td><span className={`company-badge company-badge--${p.company === '태성산업' ? 'ts' : 'sk'} company-badge--sm`}>{p.company}</span></td>
                  <td className="cell-mono">{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.weight}g</td>
                  <td className="cell-dim">{p.outer.w}×{p.outer.d}×{p.outer.h}</td>
                  <td className="cell-dim">{p.inner.w}×{p.inner.d}×{p.inner.h}</td>
                  <td>{p.notes}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--ghost btn--xs" onClick={() => setEditTarget(p.id)}>수정</button>
                      <button
                        className={`btn btn--xs ${p.active ? 'btn--warning' : 'btn--success'}`}
                        onClick={() => onToggle(p.id)}
                      >
                        {p.active ? '비활성' : '활성'}
                      </button>
                      <button className="btn btn--danger btn--xs" onClick={() => { if (window.confirm(`"${p.name}" 을(를) 삭제하시겠습니까?`)) onDelete(p.id); }}>삭제</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
