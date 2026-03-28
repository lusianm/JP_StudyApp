import { useState } from 'react'
import { Sun, Moon, Search, BookOpen, Star, Zap } from 'lucide-react'

export default function Home({
  categories, allWords, checks, darkMode, setDarkMode,
  searchQuery, setSearchQuery, onOpenTable, onOpenQuiz, getWordsWithChecks
}) {
  const [quizModalCat, setQuizModalCat] = useState(null)

  const searchResults = searchQuery.trim()
    ? categories.flatMap(cat =>
        getWordsWithChecks(cat.id)
          .filter(w =>
            w.kanji?.includes(searchQuery) ||
            w.hiragana?.includes(searchQuery) ||
            w.meaning?.includes(searchQuery)
          )
          .map(w => ({ ...w, catName: cat.name }))
      )
    : []

  const getProgress = (catId) => {
    const words = getWordsWithChecks(catId)
    if (!words.length) return { memorized: 0, total: 0, pct: 0 }
    const memorized = words.filter(w => w.isMemorized).length
    return { memorized, total: words.length, pct: Math.round((memorized / words.length) * 100) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🇯🇵 일본어 단어장</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="단어 검색 (한자 / 히라가나 / 뜻)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {searchQuery.trim() && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">{searchResults.length}개 검색됨</p>
          {searchResults.length === 0 ? (
            <p className="text-center text-gray-400 py-8">검색 결과가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map(w => (
                <div key={w.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <span className="font-bold text-lg mr-2">{w.kanji}</span>
                    <span className="text-blue-500 text-sm mr-2">{w.hiragana}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{w.meaning}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {w.catName}
                  </span>
                  {w.isFavorite && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <div className="space-y-3">
          {categories.map(cat => {
            const { memorized, total, pct } = getProgress(cat.id)
            return (
              <div key={cat.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-base">{cat.name}</h2>
                  <span className="text-sm text-gray-500">{memorized}/{total}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mb-3">{pct}% 완료</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenTable(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                               bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                               text-sm font-medium transition"
                  >
                    <BookOpen size={15} />
                    단어 목록
                  </button>
                  <button
                    onClick={() => setQuizModalCat(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                               bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
                  >
                    <Zap size={15} />
                    퀴즈 시작
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {quizModalCat && (
        <QuizConfigModal
          cat={quizModalCat}
          onStart={(config) => {
            setQuizModalCat(null)
            onOpenQuiz(quizModalCat, config)
          }}
          onClose={() => setQuizModalCat(null)}
        />
      )}
    </div>
  )
}

function QuizConfigModal({ cat, onStart, onClose }) {
  const [mode, setMode] = useState('kanji')
  const [filter, setFilter] = useState('all')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-lg mb-4">퀴즈 설정 — {cat.name}</h3>

        <p className="text-sm font-medium text-gray-500 mb-2">퀴즈 모드</p>
        <div className="flex gap-2 mb-4">
          {[
            { value: 'kanji', label: '한자 → 뜻/음' },
            { value: 'meaning', label: '뜻/음 → 한자' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                ${mode === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-gray-500 mb-2">단어 범위</p>
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: '전체' },
            { value: 'unmemorized', label: '미암기' },
            { value: 'favorite', label: '즐겨찾기' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                ${filter === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm font-medium">
            취소
          </button>
          <button onClick={() => onStart({ mode, filter })}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium">
            시작
          </button>
        </div>
      </div>
    </div>
  )
}