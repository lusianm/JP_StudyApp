import { useState } from 'react'
import { ArrowLeft, Star, Check, Search, Zap, Sun, Moon } from 'lucide-react'

export default function WordTable({
  category, words, onCheck, onBack, onStartQuiz, darkMode, setDarkMode
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [quizModal, setQuizModal] = useState(false)
  const [mode, setMode] = useState('kanji')
  const [quizFilter, setQuizFilter] = useState('all')

  const filtered = words.filter(w => {
    const matchSearch = !search.trim() ||
      w.kanji?.includes(search) ||
      w.hiragana?.includes(search) ||
      w.meaning?.includes(search)

    const matchFilter =
      filter === 'all' ? true :
      filter === 'memorized' ? w.isMemorized :
      filter === 'unmemorized' ? !w.isMemorized :
      filter === 'favorite' ? w.isFavorite : true

    return matchSearch && matchFilter
  })

  const memorizedCount = words.filter(w => w.isMemorized).length
  const pct = words.length ? Math.round((memorizedCount / words.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl flex-1">{category.name}</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">진도율</span>
          <span className="font-medium">{memorizedCount} / {words.length} ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setQuizModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
        >
          <Zap size={15} />
          퀴즈
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { value: 'all', label: `전체 ${words.length}` },
          { value: 'unmemorized', label: `미암기 ${words.filter(w => !w.isMemorized).length}` },
          { value: 'memorized', label: `암기 ${memorizedCount}` },
          { value: 'favorite', label: `⭐ ${words.filter(w => w.isFavorite).length}` },
        ].map(tab => (
          <button key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
              ${filter === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 px-4 py-2.5
                        bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
                        text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>한자</span>
          <span>히라가나</span>
          <span>뜻</span>
          <span>⭐</span>
          <span>✓</span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-10">단어가 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(w => (
              <div key={w.id}
                className={`grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 px-4 py-3 items-center
                  transition hover:bg-gray-50 dark:hover:bg-gray-700
                  ${w.isMemorized ? 'opacity-60' : ''}`}
              >
                <span className="font-bold text-base">{w.kanji}</span>
                <span className="text-blue-500 text-sm">{w.hiragana}</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{w.meaning}</span>

                <button
                  onClick={() => onCheck(w.id, 'isFavorite', !w.isFavorite)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Star
                    size={18}
                    className={w.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>

                <button
                  onClick={() => onCheck(w.id, 'isMemorized', !w.isMemorized)}
                  className={`p-1.5 rounded-lg transition
                    ${w.isMemorized
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-300 dark:border-gray-600 hover:border-green-400'}`}
                >
                  <Check size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {quizModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">퀴즈 설정</h3>

            <p className="text-sm font-medium text-gray-500 mb-2">퀴즈 모드</p>
            <div className="flex gap-2 mb-4">
              {[
                { value: 'kanji', label: '한자 → 뜻/음' },
                { value: 'meaning', label: '뜻/음 → 한자' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                    ${mode === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
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
                  onClick={() => setQuizFilter(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                    ${quizFilter === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setQuizModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                취소
              </button>
              <button onClick={() => { setQuizModal(false); onStartQuiz({ mode, filter: quizFilter }) }}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium">
                시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}