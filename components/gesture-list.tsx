import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hand, Zap, Star } from "lucide-react"
import { useHandTracking } from "../contexts/hand-tracking-context"

const GestureList = () => {
  const { customGestures, currentGesture } = useHandTracking()

  // Built-in gestures
  const builtInGestures = [
    { name: "open_hand", display: "Open Hand", icon: "✋" },
    { name: "closed_fist", display: "Closed Fist", icon: "✊" },
    { name: "pointing", display: "Pointing", icon: "👉" },
    { name: "victory", display: "Victory Sign", icon: "✌️" },
    { name: "thumbs_up", display: "Thumbs Up", icon: "👍" },
  ]

  const allGestures = [
    ...builtInGestures.map((g) => ({ ...g, isCustom: false })),
    ...customGestures.map((g) => ({
      name: g.name,
      display: g.name,
      icon: "🤏",
      isCustom: true,
      createdAt: g.createdAt,
    })),
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hand className="w-5 h-5 text-blue-400" />
          Active Gestures
          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-300">
            {allGestures.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {allGestures.map((gesture, index) => (
            <div
              key={`${gesture.name}-${index}`}
              className={`
                relative p-3 rounded-lg border transition-all duration-300 cursor-pointer group
                ${
                  currentGesture === gesture.name
                    ? gesture.isCustom
                      ? "bg-purple-900/30 border-purple-500/60 shadow-lg"
                      : "bg-blue-900/30 border-blue-500/60 shadow-lg"
                    : "bg-gray-700/30 border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-700/50"
                }
              `}
            >
              {/* Active indicator */}
              {currentGesture === gesture.name && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}

              {/* Custom gesture indicator */}
              {gesture.isCustom && (
                <div className="absolute -top-1 -left-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                </div>
              )}

              <div className="text-center">
                <div className="text-2xl mb-1">{gesture.icon}</div>
                <div className="text-xs font-medium text-gray-300 truncate">{gesture.display}</div>
                {gesture.isCustom && <div className="text-xs text-purple-400 mt-1">Custom</div>}
              </div>
            </div>
          ))}

          {/* Add gesture placeholder */}
          <div className="p-3 rounded-lg border-2 border-dashed border-gray-600/50 hover:border-gray-500/70 transition-colors cursor-pointer group">
            <div className="text-center text-gray-500 group-hover:text-gray-400">
              <div className="text-2xl mb-1">➕</div>
              <div className="text-xs font-medium">Add New</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-400" />
              <span>{builtInGestures.length} Built-in</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>{customGestures.length} Custom</span>
            </div>
          </div>
          {currentGesture !== "none" && <div className="text-xs text-green-400 font-medium">● Currently Active</div>}
        </div>
      </CardContent>
    </Card>
  )
}

export default GestureList
