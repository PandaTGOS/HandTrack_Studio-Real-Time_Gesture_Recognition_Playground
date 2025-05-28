"use client"

import { useEffect, useState } from "react"
import HandTracker from "../components/hand-tracker"
import GestureDisplay from "../components/gesture-display"
import GestureControls from "../components/gesture-controls"
import GestureList from "../components/gesture-list"
import Header from "../components/header"
import LoadingScreen from "../components/loading-screen"
import { HandTrackingProvider } from "../contexts/hand-tracking-context"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url("/images/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {isLoading && <LoadingScreen />}

      <div
        className={`flex-1 flex flex-col transition-opacity duration-500 relative z-10 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <Header />

        <main className="flex-1 container mx-auto px-4 py-4">
          <HandTrackingProvider>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left side - Camera and gesture detection */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex-1">
                  <HandTracker onInitialized={() => setHasInitialized(true)} />
                </div>
                {hasInitialized && (
                  <div className="h-32">
                    <GestureDisplay />
                  </div>
                )}
              </div>

              {/* Right side - Controls */}
              <div className="lg:col-span-1">{hasInitialized && <GestureControls />}</div>
            </div>

            {/* Bottom - Gesture List */}
            {hasInitialized && (
              <div className="mt-4">
                <GestureList />
              </div>
            )}
          </HandTrackingProvider>
        </main>
      </div>
    </div>
  )
}
