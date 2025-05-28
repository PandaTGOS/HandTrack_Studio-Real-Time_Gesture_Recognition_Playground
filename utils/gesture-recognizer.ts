import type { Landmark, Gesture, CustomGesture, BuiltInGesture } from "../contexts/hand-tracking-context"

class GestureRecognizer {
  private customGestures: CustomGesture[] = []
  private builtInGestures: BuiltInGesture[] = []

  setCustomGestures(gestures: CustomGesture[]) {
    this.customGestures = gestures
  }

  setBuiltInGestures(gestures: BuiltInGesture[]) {
    this.builtInGestures = gestures
  }

  // Calculate the Euclidean distance between two landmarks
  private distance(a: Landmark, b: Landmark): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2))
  }

  // Check if a finger is extended by comparing the tip to the base
  private isFingerExtended(landmarks: Landmark[], tipIdx: number, baseIdx: number): boolean {
    const tip = landmarks[tipIdx]
    const base = landmarks[baseIdx]
    const mcp = landmarks[0] // Palm center

    const distTipBase = this.distance(tip, base)
    const distBaseMcp = this.distance(base, mcp)

    return distTipBase > distBaseMcp * 0.85
  }

  // Calculate finger curl by measuring how close the tip is to the palm
  private getFingerCurl(landmarks: Landmark[], tipIdx: number): number {
    const palmBase = landmarks[0]
    const fingerTip = landmarks[tipIdx]

    const distToPalm = this.distance(fingerTip, palmBase)
    const handSize = this.distance(landmarks[0], landmarks[9])

    return Math.min(1, Math.max(0, distToPalm / (handSize * 1.5)))
  }

  // Get finger states for current hand
  private getFingerStates(landmarks: Landmark[]) {
    return {
      thumb: this.isFingerExtended(landmarks, 4, 1),
      index: this.isFingerExtended(landmarks, 8, 5),
      middle: this.isFingerExtended(landmarks, 12, 9),
      ring: this.isFingerExtended(landmarks, 16, 13),
      pinky: this.isFingerExtended(landmarks, 20, 17),
    }
  }

  // Calculate similarity between two landmark sets
  private calculateLandmarkSimilarity(landmarks1: Landmark[], landmarks2: Landmark[]): number {
    if (landmarks1.length !== landmarks2.length) return 0

    const handSize1 = this.distance(landmarks1[0], landmarks1[9])
    const handSize2 = this.distance(landmarks2[0], landmarks2[9])
    const totalDistance = landmarks1.reduce((sum, landmark, i) => {
      const norm1 = {
        x: (landmark.x - landmarks1[0].x) / handSize1,
        y: (landmark.y - landmarks1[0].y) / handSize1,
        z: (landmark.z - landmarks1[0].z) / handSize1,
      }
      const norm2 = {
        x: (landmarks2[i].x - landmarks2[0].x) / handSize2,
        y: (landmarks2[i].y - landmarks2[0].y) / handSize2,
        z: (landmarks2[i].z - landmarks2[0].z) / handSize2,
      }
      return sum + this.distance(norm1, norm2)
    }, 0)

    return Math.max(0, 1 - (totalDistance / landmarks1.length) * 5)
  }

  // Check if finger states match
  private fingerStatesMatch(states1: any, states2: any): boolean {
    return Object.keys(states1).every(key => states1[key] === states2[key])
  }

  // Recognize custom gestures
  private recognizeCustomGesture(landmarks: Landmark[]): string | null {
    const currentFingerStates = this.getFingerStates(landmarks)
    return this.customGestures.find(gesture => 
      (gesture.fingerStates && this.fingerStatesMatch(currentFingerStates, gesture.fingerStates)) ||
      (gesture.landmarks && this.calculateLandmarkSimilarity(landmarks, gesture.landmarks) > 0.8)
    )?.name ?? null
  }

  // Recognize gestures based on hand landmarks
  recognizeGesture(landmarks: Landmark[]): Gesture | string {
    if (!landmarks || landmarks.length !== 21) {
      return "none"
    }

    // First check custom gestures
    const customGesture = this.recognizeCustomGesture(landmarks)
    if (customGesture) {
      return customGesture
    }

    // Fall back to built-in gestures
    const fingerStates = this.getFingerStates(landmarks)
    const { thumb, index, middle, ring, pinky } = fingerStates

    // Check each built-in gesture if it's enabled
    const enabledGestures = this.builtInGestures.filter(g => g.isEnabled)
    
    if (enabledGestures.some(g => g.id === "open_hand") && index && middle && ring && pinky) return "open_hand"
    if (enabledGestures.some(g => g.id === "closed_fist") && !index && !middle && !ring && !pinky && 
        this.getFingerCurl(landmarks, 8) < 0.5 &&
        this.getFingerCurl(landmarks, 12) < 0.5 &&
        this.getFingerCurl(landmarks, 16) < 0.5 &&
        this.getFingerCurl(landmarks, 20) < 0.5) return "closed_fist"
    if (enabledGestures.some(g => g.id === "pointing") && index && !middle && !ring && !pinky) return "pointing"
    if (enabledGestures.some(g => g.id === "victory") && index && middle && !ring && !pinky) return "victory"
    if (enabledGestures.some(g => g.id === "thumbs_up") && thumb && !index && !middle && !ring && !pinky && 
        this.getFingerCurl(landmarks, 4) > 0.7) return "thumbs_up"

    return "none"
  }
}

export default GestureRecognizer
