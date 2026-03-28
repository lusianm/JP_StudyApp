import Papa from 'papaparse'

const BASE = import.meta.env.BASE_URL

export async function loadCategories() {
  try {
    const res = await fetch(`${BASE}data/categories.csv`)
    if (!res.ok) {
      console.error('categories.csv 로드 실패:', res.status)
      return []
    }
    const text = await res.text()
    console.log('categories.csv 내용:', text) // 디버그용
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
    console.log('파싱된 카테고리:', data) // 디버그용
    return data.sort((a, b) => Number(a.order) - Number(b.order))
  } catch (e) {
    console.error('카테고리 로드 에러:', e)
    return []
  }
}

export async function loadWords(catId, catName) {
  try {
    const fileName = catName.trim()
    const url = `${BASE}data/${fileName}.csv`
    console.log('단어 파일 로드 시도:', url) // 디버그용
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`${fileName}.csv 로드 실패:`, res.status)
      return []
    }
    const text = await res.text()
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
    return data.map(row => ({ ...row, catId }))
  } catch (e) {
    console.error('단어 로드 에러:', e)
    return []
  }
}