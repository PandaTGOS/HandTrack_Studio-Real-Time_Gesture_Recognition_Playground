import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Hand, Zap, Settings } from "lucide-react"

const Instructions = () => {
  const steps = [
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Start Camera",
      description: "Click 'Start Camera' to begin hand tracking",
      badge: "Step 1",
    },
    {
      icon: <Hand className="w-5 h-5" />,
      title: "Show Your Hand",
      description: "Position your hand clearly in front of the camera",
      badge: "Step 2",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Create Gestures",
      description: "Use the controls to define custom gestures",
      badge: "Step 3",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Detection",
      description: "Watch as your gestures are detected live",
      badge: "Step 4",
    },
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg">How to Use</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">{step.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{step.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {step.badge}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Built-in Gestures</h4>
          <div className="flex flex-wrap gap-1">
            {["Open Hand", "Closed Fist", "Pointing", "Victory", "Thumbs Up"].map((gesture) => (
              <Badge key={gesture} variant="secondary" className="text-xs">
                {gesture}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Instructions
