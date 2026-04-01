import { useState, useEffect } from 'react'
import Home from './components/Home'
import WordTable from './components/WordTable'
import QuizMode from './components/QuizMode'
import InstallButton from './components/InstallButton'
import { loadCategories, loadWords } from './utils/csvLoader'
import { getStorage, setStorage } from './utils/storage'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => getStorage('darkMode', false))
  const [categories, setCategories] = useState([])
  const [allWords, setAllWords] = useState({})
  const [currentView, setCurrentView] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [quizConfig, setQuizConfig] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  // checks를 useState로 관리
  const [checks, setChecks] = useState(() => getStorage('wordChecks', {}))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    setStorage('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const init = async () => {
      const cats = await loadCategories()
      setCategories(cats)
      const wordsMap = {}
      for (const cat of cats) {
        const words = await loadWords(cat.id, cat.name)
        wordsMap[cat.id] = words
      }
      setAllWords(wordsMap)
    }
    init()
  }, [])

  // 뒤로가기 버튼 연동
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state
      if (!state) {
        setCurrentView('home')
        setSelectedCategory(null)
        setQuizConfig(null)
      } else if (state.view === 'home') {
        setCurrentView('home')
        setSelectedCategory(null)
        setQuizConfig(null)
      } else if (state.view === 'table') {
        setCurrentView('table')
        setSelectedCategory(state.category)
        setQuizConfig(null)
      } else if (state.view === 'quiz') {
        setCurrentView('quiz')
        setSelectedCategory(state.category)
        setQuizConfig(state.quizConfig)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const getWordsWithChecks = (catId) => {
    const words = allWords[catId] || []
    return words.map(w => ({
      ...w,
      isMemorized: checks[w.id]?.isMemorized ?? false,
      isFavorite: checks[w.id]?.isFavorite ?? false,
    }))
  }

  const handleCheck = (wordId, field, value) => {
    const updated = {
      ...checks,
      [wordId]: { ...checks[wordId], [field]: value }
    }
    setStorage('wordChecks', updated)
    // checks 상태 업데이트 → 리렌더링 트리거
    setChecks(updated)
  }

  const goHome = () => {
    window.history.pushState({ view: 'home' }, '')
    setCurrentView('home')
    setSelectedCategory(null)
    setQuizConfig(null)
  }

  const openTable = (cat) => {
    window.history.pushState({ view: 'table', category: cat }, '')
    setSelectedCategory(cat)
    setCurrentView('table')
  }

  const openQuiz = (cat, config) => {
    window.history.pushState({ view: 'quiz', category: cat, quizConfig: config }, '')
    setSelectedCategory(cat)
    setQuizConfig(config)
    setCurrentView('quiz')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {currentView === 'home' && (
        <Home
          categories={categories}
          allWords={allWords}
          checks={checks}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenTable={openTable}
          onOpenQuiz={openQuiz}
          getWordsWithChecks={getWordsWithChecks}
        />
      )}
      {currentView === 'table' && (
        <WordTable
          category={selectedCategory}
          words={getWordsWithChecks(selectedCategory?.id)}
          onCheck={handleCheck}
          onBack={goHome}
          onStartQuiz={(config) => openQuiz(selectedCategory, config)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
      {currentView === 'quiz' && (
        <QuizMode
          category={selectedCategory}
          words={getWordsWithChecks(selectedCategory?.id)}
          config={quizConfig}
          onCheck={handleCheck}
          onBack={() => {
            window.history.pushState({ view: 'table', category: selectedCategory }, '')
            setCurrentView('table')
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
      <InstallButton />
    </div>
  )
}