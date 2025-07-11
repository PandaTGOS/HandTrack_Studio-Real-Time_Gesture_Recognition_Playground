"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

export type Landmark = {
  x: number
  y: number
  z: number
}

export type Hand = {
  landmarks: Landmark[]
  handedness: "Left" | "Right"
}

export type Gesture = "none" | "open_hand" | "closed_fist" | "pointing" | "victory" | "thumbs_up"

export interface CustomGesture {
  id: string
  name: string
  fingerStates?: {
    thumb: boolean
    index: boolean
    middle: boolean
    ring: boolean
    pinky: boolean
  }
  samples?: Landmark[][]
  createdAt: Date
}

export interface BuiltInGesture {
  id: string
  name: string
  displayName: string
  isEnabled: boolean
}

type HandTrackingContextType = {
  hands: Hand[]
  setHands: React.Dispatch<React.SetStateAction<Hand[]>>
  currentGesture: Gesture | string
  setCurrentGesture: React.Dispatch<React.SetStateAction<Gesture | string>>
  isTracking: boolean
  setIsTracking: React.Dispatch<React.SetStateAction<boolean>>
  detectionConfidence: number
  setDetectionConfidence: React.Dispatch<React.SetStateAction<number>>
  customGestures: CustomGesture[]
  setCustomGestures: React.Dispatch<React.SetStateAction<CustomGesture[]>>
  addCustomGesture: (gesture: Omit<CustomGesture, "id" | "createdAt">) => void
  removeCustomGesture: (id: string) => void
  builtInGestures: BuiltInGesture[]
  toggleBuiltInGesture: (id: string) => void
}

const HandTrackingContext = createContext<HandTrackingContextType | undefined>(undefined)

export const HandTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hands, setHands] = useState<Hand[]>([])
  const [currentGesture, setCurrentGesture] = useState<Gesture | string>("none")
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0)
  const [customGestures, setCustomGestures] = useState<CustomGesture[]>([])
  const [builtInGestures, setBuiltInGestures] = useState<BuiltInGesture[]>([
    { id: "open_hand", name: "open_hand", displayName: "Open Hand", isEnabled: true },
    { id: "closed_fist", name: "closed_fist", displayName: "Closed Fist", isEnabled: true },
    { id: "pointing", name: "pointing", displayName: "Pointing", isEnabled: true },
    { id: "victory", name: "victory", displayName: "Victory Sign", isEnabled: true },
    { id: "thumbs_up", name: "thumbs_up", displayName: "Thumbs Up", isEnabled: true },
  ])

  const addCustomGesture = (gesture: Omit<CustomGesture, "id" | "createdAt">) => {
    const newGesture: CustomGesture = {
      ...gesture,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setCustomGestures((prev) => [...prev, newGesture])
  }

  const removeCustomGesture = (id: string) => {
    setCustomGestures((prev) => prev.filter((gesture) => gesture.id !== id))
  }

  const toggleBuiltInGesture = (id: string) => {
    setBuiltInGestures((prev) =>
      prev.map((gesture) =>
        gesture.id === id ? { ...gesture, isEnabled: !gesture.isEnabled } : gesture
      )
    )
  }

  return (
    <HandTrackingContext.Provider
      value={{
        hands,
        setHands,
        currentGesture,
        setCurrentGesture,
        isTracking,
        setIsTracking,
        detectionConfidence,
        setDetectionConfidence,
        customGestures,
        setCustomGestures,
        addCustomGesture,
        removeCustomGesture,
        builtInGestures,
        toggleBuiltInGesture,
      }}
    >
      {children}
    </HandTrackingContext.Provider>
  )
}

export const useHandTracking = () => {
  const context = useContext(HandTrackingContext)
  if (context === undefined) {
    throw new Error("useHandTracking must be used within a HandTrackingProvider")
  }
  return context
}
