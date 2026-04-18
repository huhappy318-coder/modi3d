import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import { Preload } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import ParticleField from './ParticleField'
import useInteractionPoint from '../hooks/useInteractionPoint'

function PaperBackdrop({ materialRef }) {
  return (
    <mesh position={[0, 0, -7.5]} scale={[24, 14, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        transparent={false}
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
          }

          void main() {
            vec2 uv = vUv;
            float grain = noise(uv * 220.0 + uTime * 0.02);
            float soft = noise(uv * 6.0 + vec2(uTime * 0.01, -uTime * 0.008));
            float vignette = smoothstep(1.02, 0.28, distance(uv, vec2(0.5)));
            vec3 paper = vec3(0.078, 0.085, 0.08);
            vec3 warm = vec3(0.098, 0.098, 0.094);
            vec3 inkShadow = vec3(0.045, 0.05, 0.048);
            vec3 color = mix(paper, warm, uv.y * 0.55 + soft * 0.08);
            color = mix(color, inkShadow, smoothstep(0.74, 1.0, 1.0 - vignette));
            color += (grain - 0.5) * 0.025;
            color += soft * 0.01;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function SceneContent() {
  const { viewport } = useThree()
  const interaction = useInteractionPoint()
  const smoothedPoint = useRef(new THREE.Vector3(0, 0, 0))
  const targetPoint = useRef(new THREE.Vector3(0, 0, 0))
  const paperMaterialRef = useRef(null)

  const planeScale = useMemo(
    () => ({
      x: viewport.width * 0.28,
      y: viewport.height * 0.24,
    }),
    [viewport.height, viewport.width],
  )

  useFrame((_, delta) => {
    const target = interaction.isActiveRef.current
      ? targetPoint.current.set(
          interaction.forcePointRef.current.x * planeScale.x,
          interaction.forcePointRef.current.y * planeScale.y,
          0,
        )
      : targetPoint.current.set(0, 0, 0)

    smoothedPoint.current.lerp(
      target,
      1 - Math.exp(-delta * (interaction.isActiveRef.current ? 6 : 2.5)),
    )

    if (paperMaterialRef.current) {
      paperMaterialRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <>
      <color attach="background" args={['#0e100f']} />
      <fog attach="fog" args={['#0e100f', 5.8, 14]} />
      <ambientLight intensity={0.44} color="#d7d3ca" />
      <directionalLight position={[2, 3, 4]} intensity={0.2} color="#cad5d0" />
      <PaperBackdrop materialRef={paperMaterialRef} />
      <ParticleField interactionRef={smoothedPoint} interactionState={interaction} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.14} luminanceThreshold={0.78} luminanceSmoothing={0.9} mipmapBlur />
        <Noise opacity={0.014} />
        <Vignette offset={0.2} darkness={0.94} eskil={false} />
      </EffectComposer>
      <Preload all />
    </>
  )
}

function ParticleScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 48 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ParticleScene
