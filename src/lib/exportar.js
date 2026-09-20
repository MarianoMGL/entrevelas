// Utilidades de exportación: Excel (.xlsx con SheetJS) y CSV.
// SheetJS se carga de forma diferida (dynamic import) para no pesar la carga inicial.

// rows: array de objetos { Columna: valor, ... }
export async function exportXLSX(rows, filename, sheetName = 'Datos') {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  // Ancho de columnas automático (aproximado)
  const cols = Object.keys(rows[0] || {})
  ws['!cols'] = cols.map((c) => {
    const maxLen = Math.max(
      c.length,
      ...rows.map((r) => String(r[c] ?? '').length)
    )
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }
  })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

// Varias hojas en un mismo libro: sheets = [{ name, rows }]
export async function exportXLSXMulti(sheets, filename) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const { name, rows } of sheets) {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}])
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  }
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

export function downloadCSV(csv, filename) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Convierte array de objetos a CSV
export function rowsToCSV(rows) {
  if (!rows.length) return ''
  const head = Object.keys(rows[0])
  const body = rows.map((r) => head.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  return [head.join(','), ...body].join('\n')
}
