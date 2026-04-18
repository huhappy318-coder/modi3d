export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start, end, alpha) {
  return start + (end - start) * alpha
}

export function damp(value, target, lambda, delta) {
  return lerp(value, target, 1 - Math.exp(-lambda * delta))
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function smoothPulse(time, seed) {
  return Math.sin(time * 0.42 + seed * Math.PI * 2) * Math.cos(time * 0.18 + seed * 7.3)
}

export function smoothStep(value) {
  const clamped = clamp(value, 0, 1)
  return clamped * clamped * (3 - 2 * clamped)
}
