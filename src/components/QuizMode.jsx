import { useState, useMemo, useCallback } from 'react'
import { ArrowLeft, Sun, Moon, Star, Check, RotateCcw } from 'lucide-react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function QuizMode({
  category, words, config, onCheck, onBack, darkMode, setDarkMode
}) {
  const { mode, filter } = config

  const quizWords = useMemo(() => {
    const filtered = words.filter(w =>
      filter === 'all' ? true :
      filter === 'unmemorized' ? !w.isMemorized :
      filter === 'favorite' ? w.isFavorite : true
    )
    return shuffle(filtered)
  }, [])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  // 퀴즈 내에서 실시간으로 체크 상태 관리
  const [localChecks, setLocalChecks] = useState({})

  const handleCheck = useCallback((wordId, field, value) => {
    // 부모 컴포넌트(localStorage)에도 저장
    onCheck(wordId, field, value)
    // 로컬 상태도 즉시 업데이트
    setLocalChecks(prev => ({
      ...prev,
      [wordId]: { ...prev[wordId], [field]: value }
    }))
  }, [onCheck])

  // 현재 단어의 체크 상태 (로컬 우선, 없으면 words에서 가져옴)
  const getWordState = (word) => {
    if (!word) return {}
    return {
      ...word,
      isMemorized: localChecks[word.id]?.isMemorized ?? word.isMemorized,
      isFavorite: localChecks[word.id]?.isFavorite ?? word.isFavorite,
    }
  }

  const handleNext = () => {
    if (index + 1 >= quizWords.length) {
      setFinished(true)
    } else {
      setIndex(i => i + 1)
      setRevealed(false)
    }
  }

  const handleRestart = () => {
    setIndex(0)
    setRevealed(false)
    setFinished(false)
    setLocalChecks({})
  }

  if (quizWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-xl">퀴즈</h1>
        </div>
        <p className="text-center text-gray-400 mt-20">해당 조건의 단어가 없습니다</p>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8 w-full">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-xl flex-1">{category.name} 퀴즈</h1>
        </div>
        <div className="text-center mt-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">완료!</h2>
          <p className="text-gray-500 mb-8">{quizWords.length}개 단어를 모두 풀었습니다</p>
          <div className="flex gap-3">
            <button onClick={onBack}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-medium">
              돌아가기
            </button>
            <button onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium">
              <RotateCcw size={16} />
              다시 풀기
            </button>
          </div>
        </div>
      </div>
    )
  }

  const current = getWordState(quizWords[index])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg flex-1">{category.name}</h1>
        <span className="text-sm text-gray-500">{index + 1} / {quizWords.length}</span>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((index + 1) / quizWords.length) * 100}%` }}
        />
      </div>

      {/* 모드 뱃지 */}
      <div className="flex justify-center mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          {mode === 'kanji' ? '한자를 보고 뜻/음 맞추기' : '뜻/음을 보고 한자 맞추기'}
        </span>
      </div>

      {/* 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700
                      p-8 mb-6 min-h-[260px] flex flex-col items-center justify-center text-center shadow-sm">
        {mode === 'kanji' ? (
          <>
            <p className="text-5xl font-bold mb-2">{current.kanji}</p>
            {revealed && (
              <div className="mt-6">
                <p className="text-blue-500 text-2xl mb-2">{current.hiragana}</p>
                <p className="text-gray-700 dark:text-gray-300 text-xl">{current.meaning}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-blue-500 text-2xl mb-2">{current.hiragana}</p>
            <p className="text-gray-700 dark:text-gray-300 text-xl">{current.meaning}</p>
            {revealed && (
              <div className="mt-6">
                <p className="text-5xl font-bold">{current.kanji}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition"
          >
            정답 보기
          </button>
        ) : (
          <div className="flex gap-3">
            {/* 즐겨찾기 */}
            <button
              onClick={() => handleCheck(current.id, 'isFavorite', !current.isFavorite)}
              className={`p-4 rounded-2xl border-2 transition
                ${current.isFavorite
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Star size={22} className={current.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
            </button>

            {/* 암기 체크 */}
            <button
              onClick={() => handleCheck(current.id, 'isMemorized', !current.isMemorized)}
              className={`p-4 rounded-2xl border-2 transition
                ${current.isMemorized
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Check size={22} className={current.isMemorized ? 'text-green-500' : 'text-gray-400'} />
            </button>

            {/* 다음 */}
            <button
              onClick={handleNext}
              className="flex-1 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition"
            >
              {index + 1 >= quizWords.length ? '완료 🎉' : '다음 →'}
            </button>
          </div>
        )}
      </div>

      {/* 현재 단어 상태 표시 */}
      <div className="flex justify-center gap-4 mt-4 text-sm">
        {current.isMemorized && <span className="text-green-500">✓ 암기 완료</span>}
        {current.isFavorite && <span className="text-yellow-400">⭐ 즐겨찾기</span>}
      </div>
    </div>
  )
}