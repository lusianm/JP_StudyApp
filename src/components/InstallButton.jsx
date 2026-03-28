import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-blue-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <p className="font-semibold text-sm">앱으로 설치하기</p>
          <p className="text-xs text-blue-100">홈 화면에 추가해서 앱처럼 사용하세요</p>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-blue-200 px-2 py-1 text-sm"
        >
          닫기
        </button>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-white text-blue-500 px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Download size={15} />
          설치
        </button>
      </div>
    </div>
  )
}