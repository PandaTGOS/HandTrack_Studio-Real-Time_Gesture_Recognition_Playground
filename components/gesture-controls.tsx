"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Camera, Hand, Settings, Plus } from "lucide-react"
import { useHandTracking } from "../contexts/hand-tracking-context"
import { toast } from "sonner"

const GestureControls = () => {
  const { hands, customGestures, addCustomGesture, removeCustomGesture, isTracking, builtInGestures, toggleBuiltInGesture } = useHandTracking()

  const [gestureName, setGestureName] = useState("")
  const [fingerStates, setFingerStates] = useState({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  })

  // Create gesture from UI controls
  const createGestureFromUI = () => {
    if (!gestureName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for your gesture",
      })
      return
    }

    addCustomGesture({
      name: gestureName,
      fingerStates: { ...fingerStates },
    })

    toast({
      title: "Gesture created",
      description: `"${gestureName}" has been added to your custom gestures`,
    })

    // Reset form
    setGestureName("")
    setFingerStates({
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    })
  }

  // Capture gesture from live feed
  const captureGestureFromFeed = () => {
    if (!gestureName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for your gesture",
      })
      return
    }

    if (!isTracking || hands.length === 0) {
      toast({
        variant: "destructive",
        title: "No hand detected",
        description: "Please show your hand to the camera first",
      })
      return
    }

    addCustomGesture({
      name: gestureName,
      landmarks: hands[0].landmarks,
    })

    toast({
      title: "Gesture captured",
      description: `"${gestureName}" has been captured from the live feed`,
    })

    setGestureName("")
  }

  const toggleFinger = (finger: keyof typeof fingerStates) => {
    setFingerStates((prev) => ({
      ...prev,
      [finger]: !prev[finger],
    }))
  }

  const fingerNames = {
    thumb: "Thumb",
    index: "Index",
    middle: "Middle",
    ring: "Ring",
    pinky: "Pinky",
  }

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-blue-400" />
          Gesture Controls
          <Badge variant="secondary" className="ml-auto">
            {customGestures.length + builtInGestures.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-[calc(100%-80px)] overflow-y-auto">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-gray-600">
              <Plus className="w-4 h-4 mr-1" />
              Create
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-gray-600">
              <Hand className="w-4 h-4 mr-1" />
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gesture-name" className="text-sm font-medium">
                Gesture Name
              </Label>
              <Input
                id="gesture-name"
                value={gestureName}
                onChange={(e) => setGestureName(e.target.value)}
                placeholder="Enter gesture name..."
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <Tabs defaultValue="ui-controls" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="ui-controls" className="data-[state=active]:bg-gray-600 text-xs">
                  <Hand className="w-3 h-3 mr-1" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="capture" className="data-[state=active]:bg-gray-600 text-xs">
                  <Camera className="w-3 h-3 mr-1" />
                  Capture
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ui-controls" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-300">Finger Positions</Label>
                  <div className="space-y-2">
                    {Object.entries(fingerNames).map(([key, name]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                        <span className="text-sm text-white">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-300">
                            {fingerStates[key as keyof typeof fingerStates] ? "Extended" : "Curled"}
                          </span>
                          <Switch
                            checked={fingerStates[key as keyof typeof fingerStates]}
                            onCheckedChange={() => toggleFinger(key as keyof typeof fingerStates)}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={createGestureFromUI}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!gestureName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Gesture
                </Button>
              </TabsContent>

              <TabsContent value="capture" className="space-y-3 mt-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isTracking && hands.length > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                    ></div>
                    <span className="text-sm">
                      {isTracking && hands.length > 0 ? "Ready to capture" : "No hand detected"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Position your hand and click capture</p>
                </div>

                <Button
                  onClick={captureGestureFromFeed}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!gestureName.trim() || !isTracking || hands.length === 0}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Gesture
                </Button>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="manage" className="space-y-3 mt-4">
            <div className="space-y-4">
              {/* Built-in gestures */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Built-in Gestures</h3>
                <div className="space-y-2">
                  {builtInGestures.map((gesture) => (
                    <div key={gesture.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-white">{gesture.displayName}</span>
                          <Badge variant="secondary" className="text-xs">Built-in</Badge>
                          {!gesture.isEnabled && (
                            <Badge variant="destructive" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={gesture.isEnabled}
                          onCheckedChange={() => toggleBuiltInGesture(gesture.id)}
                          className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom gestures */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Gestures</h3>
                {customGestures.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Hand className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No custom gestures yet</p>
                    <p className="text-xs text-gray-500">Create your first gesture</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customGestures.map((gesture) => (
                      <div key={gesture.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-white">{gesture.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {gesture.landmarks ? "Captured" : "Manual"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">
                            Created: {gesture.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeCustomGesture(gesture.id)
                            toast.success(`"${gesture.name}" gesture removed`)
                          }}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default GestureControls

