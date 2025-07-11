import type { Landmark, Gesture, CustomGesture, BuiltInGesture } from "../contexts/hand-tracking-context"

function normalizeLandmarks(landmarks: Landmark[]): number[] {
  const base = landmarks[0]
  const centered = landmarks.map(pt => ({
    x: pt.x - base.x,
    y: pt.y - base.y,
    z: pt.z - base.z,
  }))
  const flat = centered.flatMap(pt => [pt.x, pt.y, pt.z])
  const magnitude = Math.sqrt(flat.reduce((sum, val) => sum + val * val, 0)) || 1
  return flat.map(val => val / magnitude)
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (normA * normB)
}

class GestureRecognizer {
  private customGestures: CustomGesture[] = []
  private builtInGestures: BuiltInGesture[] = []

  setCustomGestures(gestures: CustomGesture[]) {
    this.customGestures = gestures
  }

  setBuiltInGestures(gestures: BuiltInGesture[]) {
    this.builtInGestures = gestures
  }

  private angleBetween(v1: Landmark, v2: Landmark): number {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2)
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2)
    return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI)
  }

  private isFingerExtended(landmarks: Landmark[], tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
    const pip = landmarks[pipIdx]
    const mcp = landmarks[mcpIdx]
    const tip = landmarks[tipIdx]

    const v1 = {
      x: pip.x - mcp.x,
      y: pip.y - mcp.y,
      z: pip.z - mcp.z,
    }

    const v2 = {
      x: tip.x - pip.x,
      y: tip.y - pip.y,
      z: tip.z - pip.z,
    }

    const angle = this.angleBetween(v1, v2)
    return angle < 30 // small angle → straight → extended
  }

  private getFingerStates(landmarks: Landmark[]) {
    return {
      thumb: this.isFingerExtended(landmarks, 4, 3, 2),
      index: this.isFingerExtended(landmarks, 8, 7, 5),
      middle: this.isFingerExtended(landmarks, 12, 11, 9),
      ring: this.isFingerExtended(landmarks, 16, 15, 13),
      pinky: this.isFingerExtended(landmarks, 20, 19, 17),
    }
  }

  private fingerStatesMatch(a: any, b: any): boolean {
    return Object.keys(a).every(key => a[key] === b[key])
  }

  private recognizeCustomGesture(landmarks: Landmark[]): string | null {
    const input = normalizeLandmarks(landmarks)

    for (const gesture of this.customGestures) {
      if (gesture.fingerStates) {
        const current = this.getFingerStates(landmarks)
        if (this.fingerStatesMatch(current, gesture.fingerStates)) return gesture.name
      }

      if (gesture.samples && gesture.samples.length > 0) {
        for (const sample of gesture.samples) {
          const sim = cosineSimilarity(input, normalizeLandmarks(sample))
          if (sim > 0.85) return gesture.name
        }
      }
    }
    return null
  }

  recognizeGesture(landmarks: Landmark[]): Gesture | string {
    if (!landmarks || landmarks.length !== 21) return "none"

    const custom = this.recognizeCustomGesture(landmarks)
    if (custom) return custom

    const states = this.getFingerStates(landmarks)
    const enabled = this.builtInGestures.filter(g => g.isEnabled).map(g => g.id)

    if (enabled.includes("open_hand") && states.index && states.middle && states.ring && states.pinky) return "open_hand"
    if (enabled.includes("closed_fist") && !states.index && !states.middle && !states.ring && !states.pinky && !states.thumb) return "closed_fist"
    if (enabled.includes("pointing") && states.index && !states.middle && !states.ring && !states.pinky) return "pointing"
    if (enabled.includes("victory") && states.index && states.middle && !states.ring && !states.pinky) return "victory"
    if (enabled.includes("thumbs_up") && states.thumb && !states.index && !states.middle && !states.ring && !states.pinky) return "thumbs_up"

    return "none"
  }
}

export default GestureRecognizer
