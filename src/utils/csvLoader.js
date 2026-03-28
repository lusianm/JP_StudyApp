import Papa from 'papaparse'

const BASE = import.meta.env.BASE_URL

export async function loadCategories() {
  const res = await fetch(`${BASE}data/categories.csv`)
  const text = await res.text()
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
  return data.sort((a, b) => Number(a.order) - Number(b.order))
}

export async function loadWords(catId, catName) {
  try {
    const fileName = encodeURIComponent(catName.replace(/\s/g, ''))
    const res = await fetch(`${BASE}data/${fileName}.csv`)
    if (!res.ok) return []
    const text = await res.text()
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
    return data.map(row => ({ ...row, catId }))
  } catch {
    return []
  }
}