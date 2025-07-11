import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { useHandTracking } from "../contexts/hand-tracking-context"

const GestureDisplay = () => {
  const {
    currentGesture,
    isTracking,
    detectionConfidence,
    hands,
    customGestures,
  } = useHandTracking()

  const gestureNames: Record<string, string> = {
    none: "No Gesture Detected",
    open_hand: "Open Hand",
    closed_fist: "Closed Fist",
    pointing: "Pointing",
    victory: "Victory Sign",
    thumbs_up: "Thumbs Up",
  }

  const isCustomGesture = customGestures.some(
    (g) => g.name.toLowerCase() === currentGesture?.toLowerCase()
  )

  const displayName =
    gestureNames[currentGesture] ||
    (isCustomGesture ? currentGesture : currentGesture || "Unknown Gesture")

  const confidencePercentage = Math.round(detectionConfidence * 100)

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardContent className="p-4 h-full flex flex-col justify-center">
        {isTracking ? (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">
                  Live Detection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Confidence:</span>
                <span
                  className={`text-sm font-bold ${
                    confidencePercentage > 80
                      ? "text-green-400"
                      : confidencePercentage > 50
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {hands.length > 0 ? `${confidencePercentage}%` : "No hand"}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <Progress
              value={hands.length > 0 ? confidencePercentage : 0}
              className="h-2 bg-gray-700"
            />

            {/* Gesture name */}
            <div className="flex items-center justify-between">
              <div
                className={`flex-1 text-lg font-bold py-2 px-4 rounded-lg text-center transition-all duration-300
                  ${
                    currentGesture !== "none"
                      ? isCustomGesture
                        ? "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                        : "bg-blue-900/30 text-blue-300 border border-blue-500/30"
                      : "bg-gray-700/50 text-gray-400"
                  }
                  ${currentGesture !== "none" ? "animate-pulse" : ""}
                `}
              >
                {displayName}
              </div>
              {isCustomGesture && (
                <div className="ml-3">
                  <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-400"
                  >
                    Custom
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 flex items-center justify-center h-full">
            <div>
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start camera to begin detection</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GestureDisplay
