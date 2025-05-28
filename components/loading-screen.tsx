import { Hand } from "lucide-react"

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <Hand className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading HandTrack Studio</h2>
        <p className="text-gray-400">Initializing hand tracking models...</p>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
