"use client"

import { useRef, useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useHandTracking } from "../contexts/hand-tracking-context"
import GestureRecognizer from "../utils/gesture-recognizer"

interface HandTrackerProps {
  onInitialized: () => void
}

const HandTracker = ({ onInitialized }: HandTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<handpose.HandPose | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const { setHands, setIsTracking, setCurrentGesture, setDetectionConfidence, customGestures, builtInGestures } = useHandTracking()

  const gestureRecognizer = useRef(new GestureRecognizer()).current

  // Update gesture recognizer when gestures change
  useEffect(() => {
    gestureRecognizer.setCustomGestures(customGestures)
    gestureRecognizer.setBuiltInGestures(builtInGestures)
  }, [customGestures, builtInGestures, gestureRecognizer])

  // Initialize TensorFlow and load the handpose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready()
        const handModel = await handpose.load({
          detectionConfidence: 0.8,
          maxContinuousChecks: 10,
          iouThreshold: 0.3,
          scoreThreshold: 0.75,
        })
        setModel(handModel)
        onInitialized()
        toast.success("Model loaded successfully")
      } catch (error) {
        console.error("Failed to load the handpose model", error)
        toast.error("Failed to load model")
      }
    }
    loadModel()
  }, [onInitialized])

  // Set up webcam access
  const setupCamera = async () => {
    if (!videoRef.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })
      videoRef.current.srcObject = stream
      setCameraActive(true)
      setIsTracking(true)
      toast.success("Camera activated")
    } catch (error) {
      console.error("Error accessing the webcam:", error)
      toast.error("Camera access denied")
    }
  }

  // Handle when video is ready to play
  const handleVideoReady = () => {
    setIsVideoReady(true)
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
    }
  }

  // Stop the webcam
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setIsTracking(false)
      setHands([])
      setCurrentGesture("none")
    }
  }

  // Detect hands and run gesture recognition
  useEffect(() => {
    let animationFrameId: number

    const detectHands = async () => {
      if (!model || !videoRef.current || !canvasRef.current || !cameraActive) return

      try {
        const predictions = await model.estimateHands(videoRef.current)
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        if (predictions.length > 0) {
          const detectedHands = predictions.map(prediction => ({
            landmarks: prediction.landmarks.map(point => ({
              x: point[0],
              y: point[1],
              z: point[2],
            })),
            handedness: prediction.handInViewConfidence > 0.8 ? "Right" : "Left",
          }))

          setHands(detectedHands)
          setDetectionConfidence(predictions[0].handInViewConfidence)

          if (detectedHands.length > 0) {
            const gesture = gestureRecognizer.recognizeGesture(detectedHands[0].landmarks)
            setCurrentGesture(gesture)
          }

          drawHand(detectedHands, canvasRef.current)
        } else {
          setHands([])
          setCurrentGesture("none")
        }
      } catch (error) {
        console.error("Error during hand detection:", error)
      }

      animationFrameId = requestAnimationFrame(detectHands)
    }

    if (isVideoReady && cameraActive) {
      detectHands()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [model, isVideoReady, cameraActive, setHands, setCurrentGesture, gestureRecognizer])

  // Draw hand landmarks on canvas
  const drawHand = (hands: any[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    hands.forEach(hand => {
      const landmarks = hand.landmarks
      drawConnections(ctx, landmarks)

      landmarks.forEach((landmark: any, index: number) => {
        const isFingerTip = [4, 8, 12, 16, 20].includes(index)
        ctx.beginPath()
        ctx.arc(landmark.x, landmark.y, isFingerTip ? 6 : 4, 0, 2 * Math.PI)
        ctx.fillStyle = isFingerTip ? "#06b6d4" : "#0ea5e9"
        ctx.fill()
      })
    })
  }

  // Draw connections between landmarks
  const drawConnections = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15],
      [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [0, 5], [5, 9],
      [9, 13], [13, 17]
    ]

    ctx.lineWidth = 2
    ctx.strokeStyle = "#94a3b8"

    connections.forEach(([start, end]) => {
      ctx.beginPath()
      ctx.moveTo(landmarks[start].x, landmarks[start].y)
      ctx.lineTo(landmarks[end].x, landmarks[end].y)
      ctx.stroke()
    })
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
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ transform: "scaleX(-1)" }} />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Button
              onClick={setupCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg"
              disabled={!model}
            >
              {!model ? "Loading Model..." : "Start Camera"}
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
