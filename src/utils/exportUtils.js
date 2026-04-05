/**
 * exportUtils.js
 * 검색 결과 내보내기 유틸리티
 * - 클립보드 복사
 * - CSV 다운로드
 */

/**
 * 매칭 결과를 텍스트로 변환합니다. (클립보드 복사용)
 *
 * @param {Array} results - matchProducts 반환값
 * @returns {string}
 */
export function resultsToText(results) {
  const header = ['회사', '코드', '제품명', '중량(g)', '외경(W×D×H)', '내경(W×D×H)', '적합도', '외경차이(W/D/H)', '내경차이(W/D/H)', '총오차'].join('\t');
  const rows = results.map((r) => [
    r.company,
    r.code,
    r.name,
    r.weight,
    `${r.outer.w}×${r.outer.d}×${r.outer.h}`,
    `${r.inner.w}×${r.inner.d}×${r.inner.h}`,
    r.fitness,
    r.outerDiff ? `${r.outerDiff.w}/${r.outerDiff.d}/${r.outerDiff.h}` : '-',
    r.innerDiff ? `${r.innerDiff.w}/${r.innerDiff.d}/${r.innerDiff.h}` : '-',
    r.totalScore,
  ].join('\t'));
  return [header, ...rows].join('\n');
}

/**
 * 클립보드에 결과를 복사합니다.
 *
 * @param {Array} results
 * @returns {Promise<boolean>} 성공 여부
 */
export async function copyToClipboard(results) {
  const text = resultsToText(results);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback: textarea 방식
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

/**
 * 매칭 결과를 CSV 파일로 다운로드합니다.
 *
 * @param {Array} results
 * @param {string} filename - 파일명 (확장자 제외)
 */
export function downloadCSV(results, filename = '보냉박스_매칭결과') {
  // BOM 추가 (Excel 한글 깨짐 방지)
  const BOM = '\uFEFF';
  const header = ['회사', '코드', '제품명', '중량(g)', '외경가로', '외경세로', '외경높이', '내경가로', '내경세로', '내경높이', '적합도', '외경가로차이', '외경세로차이', '외경높이차이', '내경가로차이', '내경세로차이', '내경높이차이', '총오차점수'];

  const rows = results.map((r) => [
    r.company,
    r.code,
    r.name,
    r.weight,
    r.outer.w, r.outer.d, r.outer.h,
    r.inner.w, r.inner.d, r.inner.h,
    r.fitness,
    r.outerDiff ? r.outerDiff.w : '',
    r.outerDiff ? r.outerDiff.d : '',
    r.outerDiff ? r.outerDiff.h : '',
    r.innerDiff ? r.innerDiff.w : '',
    r.innerDiff ? r.innerDiff.d : '',
    r.innerDiff ? r.innerDiff.h : '',
    r.totalScore,
  ]);

  const csvContent =
    BOM +
    [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${formatDateForFile()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 파일명용 날짜 문자열 (YYYYMMDD_HHMMSS) */
function formatDateForFile() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
