"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useHandTracking } from "../contexts/hand-tracking-context"
import GestureRecognizer from "../utils/gesture-recognizer"

declare global {
  interface Window {
    Hands: any
    Camera: any
  }
}

interface HandTrackerProps {
  onInitialized: () => void
}

const HandTracker = ({ onInitialized }: HandTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const { setHands, setIsTracking, setCurrentGesture, setDetectionConfidence, customGestures, builtInGestures } = useHandTracking()
  const gestureRecognizer = useRef(new GestureRecognizer()).current
  const cameraRef = useRef<any>(null)
  const handsRef = useRef<any>(null)

  useEffect(() => {
    gestureRecognizer.setCustomGestures(customGestures)
    gestureRecognizer.setBuiltInGestures(builtInGestures)
  }, [customGestures, builtInGestures])

  const drawHands = useCallback((ctx: CanvasRenderingContext2D, landmarksList: any[]) => {
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ]

    for (const landmarks of landmarksList) {
      connections.forEach(([start, end]) => {
        const s = landmarks[start]
        const e = landmarks[end]
        ctx.beginPath()
        ctx.moveTo(s.x * canvasRef.current!.width, s.y * canvasRef.current!.height)
        ctx.lineTo(e.x * canvasRef.current!.width, e.y * canvasRef.current!.height)
        ctx.strokeStyle = "#94a3b8"
        ctx.lineWidth = 2
        ctx.stroke()
      })

      landmarks.forEach((point: any, index: number) => {
        const x = point.x * canvasRef.current!.width
        const y = point.y * canvasRef.current!.height
        ctx.beginPath()
        ctx.arc(x, y, [4, 8, 12, 16, 20].includes(index) ? 6 : 4, 0, 2 * Math.PI)
        ctx.fillStyle = [4, 8, 12, 16, 20].includes(index) ? "#06b6d4" : "#0ea5e9"
        ctx.fill()
      })
    }
  }, [])

  const handleVideoReady = () => {
    setIsVideoReady(true)
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
    }
  }

  const startCamera = () => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      toast.error("Camera not supported in this browser")
      return
    }

    if (!videoRef.current) {
      toast.error("Video element not available")
      return
    }

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.7,
    })

    hands.onResults((results: any) => {
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx || !results.multiHandLandmarks) return

      const detected = results.multiHandLandmarks.map((landmarks: any, idx: number) => ({
        landmarks: landmarks.map((l: any) => ({ x: l.x, y: l.y, z: l.z })),
        handedness: results.multiHandedness?.[idx]?.label === "Left" ? "Left" : "Right",
      }))

      drawHands(ctx, results.multiHandLandmarks)
      setHands(detected)
      setDetectionConfidence(results.multiHandedness?.[0]?.score || 0)

      if (detected.length > 0) {
        const gesture = gestureRecognizer.recognizeGesture(detected[0].landmarks)
        setCurrentGesture(gesture)
      } else {
        setCurrentGesture("none")
      }
    })

    handsRef.current = hands

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current })
      },
      width: 640,
      height: 480,
    })

    camera.start()
    cameraRef.current = camera
    setCameraActive(true)
    setIsTracking(true)
    onInitialized()
    toast.success("MediaPipe Hands initialized")
  }


  const stopCamera = () => {
    cameraRef.current?.stop()
    setCameraActive(false)
    setIsTracking(false)
    setHands([])
    setCurrentGesture("none")
    toast("Camera stopped")
  }

  return (
    <div className="rounded-lg overflow-hidden bg-gray-800 border border-gray-700 relative">
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          onLoadedData={handleVideoReady}
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg"
            >
              Start Camera
            </Button>
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="p-3 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Hand Tracking Active
          </div>
          <Button variant="destructive" onClick={stopCamera} size="sm">
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  )
}

export default HandTracker
