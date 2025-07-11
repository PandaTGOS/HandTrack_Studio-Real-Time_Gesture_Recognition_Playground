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
  const {
    hands,
    customGestures,
    addCustomGesture,
    removeCustomGesture,
    isTracking,
    builtInGestures,
    toggleBuiltInGesture,
    setCustomGestures,
  } = useHandTracking()

  const [gestureName, setGestureName] = useState("")

  const [fingerStates, setFingerStates] = useState({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  })

  const createGestureFromUI = () => {
    if (!gestureName.trim()) {
      toast.error("Name required", {
        description: "Please enter a name for your gesture",
      })
      return
    }

    addCustomGesture({
      name: gestureName,
      fingerStates: { ...fingerStates },
      samples: [],
    })

    toast.success("Gesture created (manual)", {
      description: `"${gestureName}" added with finger states`,
    })

    setGestureName("")
    setFingerStates({ thumb: false, index: false, middle: false, ring: false, pinky: false })
  }

  const captureSample = () => {
    if (!gestureName.trim()) {
      toast.error("Name required", {
        description: "Please enter a name for your gesture",
      })
      return
    }

    if (!isTracking || hands.length === 0) {
      toast.error("No hand detected", {
        description: "Please show your hand to the camera",
      })
      return
    }

    const existing = customGestures.find(g => g.name === gestureName)

    if (existing) {
      existing.samples = [...(existing.samples || []), hands[0].landmarks]
      setCustomGestures([
        ...customGestures.filter(g => g.name !== gestureName),
        existing,
      ])
      toast.success("Sample added", {
        description: `"${gestureName}" now has ${existing.samples.length} samples`,
      })
    } else {
      addCustomGesture({
        name: gestureName,
        samples: [hands[0].landmarks],
      })
      toast.success("Gesture created with 1 sample", {
        description: `"${gestureName}" has been added`,
      })
    }

    setGestureName("")
  }

  const toggleFinger = (finger: keyof typeof fingerStates) => {
    setFingerStates(prev => ({ ...prev, [finger]: !prev[finger] }))
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
        <Tabs defaultValue="train" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-gray-600">
              Manual
            </TabsTrigger>
            <TabsTrigger value="capture" className="data-[state=active]:bg-gray-600">
              Capture
            </TabsTrigger>
            <TabsTrigger value="train" className="data-[state=active]:bg-gray-600">
              Train
            </TabsTrigger>
          </TabsList>

          {/* Manual Finger UI */}
          <TabsContent value="create" className="mt-4 space-y-3">
            <Label htmlFor="gesture-name">Gesture Name</Label>
            <Input
              id="gesture-name"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              placeholder="Enter gesture name..."
              className="bg-gray-700 border-gray-600"
            />
            <div className="space-y-2">
              {Object.entries(fingerNames).map(([key, name]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-700 rounded-lg">
                  <span className="text-sm text-white">{name}</span>
                  <Switch
                    checked={fingerStates[key as keyof typeof fingerStates]}
                    onCheckedChange={() => toggleFinger(key as keyof typeof fingerStates)}
                  />
                </div>
              ))}
            </div>
            <Button onClick={createGestureFromUI} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Manual Gesture
            </Button>
          </TabsContent>

          {/* Live Sample Capture */}
          <TabsContent value="capture" className="mt-4 space-y-3">
            <Label htmlFor="gesture-name">Gesture Name</Label>
            <Input
              id="gesture-name"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              placeholder="Enter gesture name..."
              className="bg-gray-700 border-gray-600"
            />
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isTracking && hands.length > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm">
                  {isTracking && hands.length > 0 ? "Ready to record sample" : "No hand detected"}
                </span>
              </div>
              <p className="text-xs text-gray-400">Show gesture and record sample</p>
            </div>
            <Button
              onClick={captureSample}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!gestureName.trim() || !isTracking || hands.length === 0}
            >
              <Camera className="w-4 h-4 mr-2" />
              Record Gesture Sample
            </Button>
          </TabsContent>

          {/* Training View */}
          <TabsContent value="train" className="mt-4 space-y-3">
            {customGestures.length === 0 ? (
              <div className="text-center text-gray-400">No custom gestures yet</div>
            ) : (
              customGestures.map((gesture) => (
                <div
                  key={gesture.id}
                  className="p-3 bg-gray-700 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-medium">{gesture.name}</div>
                    <div className="text-xs text-gray-400">
                      Samples: {gesture.samples?.length || 0}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      removeCustomGesture(gesture.id)
                      toast.success(`"${gesture.name}" removed`)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default GestureControls
