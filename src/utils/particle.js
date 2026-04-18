import { Color } from 'three'
import { randomBetween } from './math'

function sampleEllipticVolume(radiusX, radiusY, radiusZ) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(1 - 2 * Math.random())
  const radius = Math.cbrt(Math.random())

  const sinPhi = Math.sin(phi)
  const x = radius * sinPhi * Math.cos(theta) * radiusX
  const y = radius * sinPhi * Math.sin(theta) * radiusY
  const z = radius * Math.cos(phi) * radiusZ

  return [x, y, z]
}

export function createParticleShape(count) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const layers = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const i3 = index * 3
    const edgeBias = Math.pow(Math.random(), 1.7)
    const [x, y, z] = sampleEllipticVolume(
      1.4 - edgeBias * 0.48,
      0.92 - edgeBias * 0.18,
      0.72 - edgeBias * 0.22,
    )

    positions[i3] = x + randomBetween(-0.04, 0.04)
    positions[i3 + 1] = y + randomBetween(-0.03, 0.03)
    positions[i3 + 2] = z + randomBetween(-0.06, 0.06)
    seeds[index] = Math.random()
    layers[index] = edgeBias > 0.55 ? 1 : 0
  }

  return {
    positions,
    seeds,
    layers,
  }
}

export function createParticlePalette(count, layers = null) {
  const colors = new Float32Array(count * 3)
  const cloud = new Color('#f1eee7')
  const mist = new Color('#d9d5cc')
  const celadon = new Color('#b9c8c5')

  for (let index = 0; index < count; index += 1) {
    const mixA = Math.random()
    const mixB = Math.random() * 0.18
    const contourLift = layers ? layers[index] * 0.12 : 0
    const tone = cloud
      .clone()
      .lerp(mist, mixA * 0.68 + contourLift)
      .lerp(celadon, mixB + contourLift * 0.5)
    const i3 = index * 3

    colors[i3] = tone.r
    colors[i3 + 1] = tone.g
    colors[i3 + 2] = tone.b
  }

  return colors
}
