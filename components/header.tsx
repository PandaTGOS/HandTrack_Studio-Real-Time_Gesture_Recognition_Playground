import { Hand } from "lucide-react"

const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Hand className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">HandTrack Studio</h1>
            <p className="text-sm text-gray-400">Advanced Hand Gesture Recognition</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Powered by</div>
          <div className="text-sm font-medium text-blue-400">TensorFlow & MediaPipe</div>
        </div>
      </div>
    </header>
  )
}

export default Header
