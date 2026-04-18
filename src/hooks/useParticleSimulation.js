import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clamp, smoothPulse } from '../utils/math'
import { curlLikeFlow } from '../utils/flowField'

function useParticleSimulation({
  count,
  targetPositions,
  targetLayers,
  targetSeeds,
  morphProgress = 0,
}) {
  const positionsRef = useRef(null)
  const targetPositionsRef = useRef(new Float32Array(targetPositions))
  const velocityRef = useRef(new Float32Array(count * 3))
  const tempDirection = useRef(new THREE.Vector3())

  if (!positionsRef.current) {
    const initial = new Float32Array(targetPositions)

    for (let index = 0; index < count; index += 1) {
      const i3 = index * 3
      const layer = targetLayers[index] ?? 0
      const spread = 0.12 + (1 - layer) * 0.18

      initial[i3] += (Math.random() - 0.5) * spread
      initial[i3 + 1] += (Math.random() - 0.5) * spread
      initial[i3 + 2] += (Math.random() - 0.5) * spread * 0.7
    }

    positionsRef.current = initial
  }

  useEffect(() => {
    targetPositionsRef.current = new Float32Array(targetPositions)
  }, [targetPositions])

  const api = useMemo(
    () => ({
      positions: positionsRef.current,
      step: ({ delta, elapsedTime, interactionPoint, interactionStrength }) => {
        const velocity = velocityRef.current
        const dt = Math.min(delta, 0.033)
        const breathing = 1 + Math.sin(elapsedTime * 0.28) * 0.013
        const interactionRadius = 1.08
        const interactionPower = 0.066 * interactionStrength * (1 + morphProgress * 0.18)

        for (let index = 0; index < count; index += 1) {
          const i3 = index * 3
          const seed = targetSeeds[index]
          const layer = targetLayers[index] ?? 0
          const baseX = targetPositionsRef.current[i3]
          const baseY = targetPositionsRef.current[i3 + 1]
          const baseZ = targetPositionsRef.current[i3 + 2]

          const pulse = smoothPulse(elapsedTime, seed)
          const layerWeight = 0.55 + layer * 0.65
          const flow = curlLikeFlow(baseX * 1.1, baseY * 1.1, baseZ * 1.1, elapsedTime * 0.14, seed)
          const flowX = flow.x * 0.018 + Math.sin(elapsedTime * 0.23 + seed * 6.1 + baseY * 1.4) * 0.01
          const flowY = flow.y * 0.018 + Math.cos(elapsedTime * 0.19 + seed * 5.3 + baseX * 1.1) * 0.009
          const flowZ = flow.z * 0.016 + Math.sin(elapsedTime * 0.17 + seed * 4.7 + baseX * 0.8) * 0.011

          const targetX = baseX * breathing + flowX * layerWeight
          const targetY = baseY * (breathing * 0.986) + flowY * layerWeight + pulse * 0.01
          const targetZ = baseZ * breathing + flowZ * layerWeight

          const settle = 0.04 + layer * 0.024
          velocity[i3] += (targetX - positionsRef.current[i3]) * settle
          velocity[i3 + 1] += (targetY - positionsRef.current[i3 + 1]) * settle
          velocity[i3 + 2] += (targetZ - positionsRef.current[i3 + 2]) * (settle * 0.92)

          if (interactionStrength > 0.001) {
            const lift = 0.018 + layer * 0.018
            tempDirection.current.set(
              positions[i3] - interactionPoint.x,
              positions[i3 + 1] - interactionPoint.y,
              positions[i3 + 2] - interactionPoint.z,
            )

            const distance = tempDirection.current.length()

            if (distance < interactionRadius) {
              const falloff = 1 - distance / interactionRadius
              const softness = Math.pow(clamp(falloff, 0, 1), 1.7)
              tempDirection.current.normalize()

              const swirl = Math.sin(seed * 31.4 + elapsedTime * 0.45) * 0.008
              const drift = Math.cos(seed * 18.2 + elapsedTime * 0.32) * 0.004
              velocity[i3] += (tempDirection.current.x + swirl) * softness * interactionPower
              velocity[i3 + 1] +=
                (tempDirection.current.y + lift + drift) * softness * interactionPower * 0.88
              velocity[i3 + 2] += (tempDirection.current.z + swirl * 0.6) * softness * interactionPower * 0.8
            }
          }

          const damping = 1 - Math.min(dt * (5.8 - layer * 0.95), 0.34)
          velocity[i3] *= damping
          velocity[i3 + 1] *= damping
          velocity[i3 + 2] *= 1 - Math.min(dt * (5.2 - layer * 0.82), 0.31)

          positionsRef.current[i3] += velocity[i3]
          positionsRef.current[i3 + 1] += velocity[i3 + 1]
          positionsRef.current[i3 + 2] += velocity[i3 + 2]
        }
      },
    }),
    [count, morphProgress, targetLayers, targetSeeds],
  )

  return api
}

export default useParticleSimulation
