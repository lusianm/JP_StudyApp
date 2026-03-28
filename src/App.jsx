import InstallButton from './components/InstallButton'
import { useState, useEffect } from 'react'
import Home from './components/Home'
import WordTable from './components/WordTable'
import QuizMode from './components/QuizMode'
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

  const checks = getStorage('wordChecks', {})

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
    setAllWords(prev => ({ ...prev }))
  }

  const goHome = () => {
    setCurrentView('home')
    setSelectedCategory(null)
    setQuizConfig(null)
  }

  const openTable = (cat) => {
    setSelectedCategory(cat)
    setCurrentView('table')
  }

  const openQuiz = (cat, config) => {
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
          onBack={() => setCurrentView('table')}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
      {/* 설치 버튼 추가 */}
      <InstallButton />
    </div>
  )
}