import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import useShapeSource from '../hooks/useShapeSource'
import useParticleSimulation from '../hooks/useParticleSimulation'
import { createParticlePalette, createParticleShape } from '../utils/particle'

const PARTICLE_COUNT = 14000

function ParticleField({ interactionRef, interactionState }) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)
  const { gl } = useThree()
  const shapeSource = useShapeSource(PARTICLE_COUNT)

  const fallbackShape = useMemo(() => createParticleShape(PARTICLE_COUNT), [])
  const colors = useMemo(
    () => createParticlePalette(PARTICLE_COUNT, shapeSource.targetLayers),
    [shapeSource.targetLayers],
  )
  const simulation = useParticleSimulation({
    count: PARTICLE_COUNT,
    targetPositions: shapeSource.targetPositions ?? fallbackShape.positions,
    targetLayers: shapeSource.targetLayers ?? fallbackShape.layers ?? new Float32Array(PARTICLE_COUNT),
    targetSeeds: shapeSource.targetSeeds ?? fallbackShape.seeds,
    morphProgress: shapeSource.transitionProgress,
  })

  useFrame((state, delta) => {
    simulation.step({
      delta,
      elapsedTime: state.clock.getElapsedTime(),
      interactionPoint: interactionRef.current,
      interactionStrength: interactionState.isActiveRef.current
        ? interactionState.strengthRef.current
        : 0,
    })

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.geometry.attributes.aLayer.needsUpdate = true
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.08
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.04
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.8)
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMorph.value = shapeSource.transitionProgress
    }
  })

  return (
    <group position={[0, 0.05, 0]}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={simulation.positions.length / 3}
            array={simulation.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aLayer"
            count={shapeSource.targetLayers.length}
            array={shapeSource.targetLayers}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aSeed"
            count={shapeSource.targetSeeds.length}
            array={shapeSource.targetSeeds}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          blending={THREE.NormalBlending}
          depthWrite={false}
          transparent
          uniforms={{
            uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.8) },
            uTime: { value: 0 },
            uMorph: { value: shapeSource.transitionProgress },
          }}
          vertexShader={`
            uniform float uPixelRatio;
            uniform float uTime;
            uniform float uMorph;
            attribute float aLayer;
            attribute float aSeed;
            varying vec3 vColor;
            varying float vDepth;
            varying float vLayer;
            varying float vSeed;

            void main() {
              vColor = color;
              vLayer = aLayer;
              vSeed = aSeed;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vDepth = clamp(1.2 - (-mvPosition.z * 0.12), 0.25, 1.0);
              float breathe = 0.96 + sin(uTime * 0.18 + aSeed * 6.2831) * 0.035;
              gl_PointSize = mix(1.7, 4.0, aLayer) * (0.84 + aSeed * 0.42) * uPixelRatio * vDepth * breathe * mix(0.96, 1.05, uMorph);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uMorph;
            varying vec3 vColor;
            varying float vDepth;
            varying float vLayer;
            varying float vSeed;

            void main() {
              vec2 centered = gl_PointCoord - 0.5;
              float dist = length(centered);
              float alpha = smoothstep(0.5, 0.05, dist);
              alpha *= smoothstep(0.18, 1.0, vDepth);
              alpha *= mix(0.28, 0.78, vLayer);
              alpha *= 0.86 + vSeed * 0.16;
              alpha *= 0.94 + sin(uTime * 0.24 + vSeed * 12.0) * 0.025;
              alpha *= mix(1.0, 0.92, uMorph);
              gl_FragColor = vec4(vColor, alpha);
            }
          `}
          vertexColors
        />
      </points>
    </group>
  )
}

export default ParticleField
