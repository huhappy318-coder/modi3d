import { useEffect, useMemo, useRef, useState } from 'react'
import mountainSvg from '../assets/shapes/mountain.svg?raw'
import sealSvg from '../assets/shapes/seal.svg?raw'
import roofSvg from '../assets/shapes/roof.svg?raw'
import pineSvg from '../assets/shapes/pine.svg?raw'
import strokeSvg from '../assets/shapes/stroke.svg?raw'
import cloudSvg from '../assets/shapes/cloud.svg?raw'
import { smoothStep } from '../utils/math'
import { expandPointCloud, sampleSvgPointCloud } from '../utils/shapeSampling'

const SHAPE_SOURCES = [
  {
    id: 'mountain',
    name: '山岚',
    description: '远山呼吸般的轮廓。',
    svg: mountainSvg,
    sampleCount: 1600,
    targetSize: 2.25,
    contourRatio: 0.38,
  },
  {
    id: 'roof',
    name: '屋檐',
    description: '更安静的建筑边线。',
    svg: roofSvg,
    sampleCount: 1100,
    targetSize: 2.18,
    contourRatio: 0.42,
  },
  {
    id: 'pine',
    name: '古松',
    description: '枝干与层次缓缓交叠。',
    svg: pineSvg,
    sampleCount: 1400,
    targetSize: 2.28,
    contourRatio: 0.36,
  },
  {
    id: 'stroke',
    name: '墨痕',
    description: '一笔飞白与拖尾。',
    svg: strokeSvg,
    sampleCount: 800,
    targetSize: 2.3,
    contourRatio: 0.52,
  },
  {
    id: 'cloud',
    name: '云气',
    description: '更松的雾形过渡层。',
    svg: cloudSvg,
    sampleCount: 1000,
    targetSize: 2.22,
    contourRatio: 0.3,
  },
  {
    id: 'seal',
    name: '方印',
    description: '极简印章式收束。',
    svg: sealSvg,
    sampleCount: 600,
    targetSize: 2.0,
    contourRatio: 0.44,
  },
]

const DISPLAY_DURATION = 8000
const TRANSITION_DURATION = 2800

function blendArrays(fromArray, toArray, progress) {
  const blended = new Float32Array(fromArray.length)

  for (let index = 0; index < fromArray.length; index += 1) {
    blended[index] = fromArray[index] + (toArray[index] - fromArray[index]) * progress
  }

  return blended
}

function useShapeSource(particleCount) {
  const sources = useMemo(() => {
    return SHAPE_SOURCES.map((source) => {
      const sampled = sampleSvgPointCloud(source.svg, source.sampleCount, {
        targetSize: source.targetSize,
        contourRatio: source.contourRatio,
      })
      const cloud = expandPointCloud(sampled, particleCount)

      return {
        ...source,
        cloud,
      }
    })
  }, [particleCount])

  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const [transitionProgress, setTransitionProgress] = useState(1)
  const activeIndexRef = useRef(0)
  const transitionTokenRef = useRef(0)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const cycle = () => {
      const nextIndex = (activeIndexRef.current + 1) % sources.length
      setPreviousIndex(activeIndexRef.current)
      setActiveIndex(nextIndex)
      setTransitionProgress(0)
      transitionTokenRef.current += 1
    }

    const timer = window.setInterval(cycle, DISPLAY_DURATION)

    return () => {
      window.clearInterval(timer)
    }
  }, [sources.length])

  useEffect(() => {
    if (transitionProgress === 1 && activeIndex === previousIndex) {
      return undefined
    }

    const token = transitionTokenRef.current
    const start = performance.now()
    let raf = 0

    const animate = (now) => {
      const raw = (now - start) / TRANSITION_DURATION
      const eased = smoothStep(raw)
      setTransitionProgress(eased)

      if (eased < 1 && token === transitionTokenRef.current) {
        raf = window.requestAnimationFrame(animate)
      }
    }

    raf = window.requestAnimationFrame(animate)

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf)
      }
    }
  }, [activeIndex])

  const currentSource = sources[activeIndex]
  const previousSource = sources[previousIndex]
  const mix = smoothStep(transitionProgress)
  const blended = useMemo(() => {
    return {
      positions: blendArrays(previousSource.cloud.positions, currentSource.cloud.positions, mix),
      layers: blendArrays(previousSource.cloud.layers, currentSource.cloud.layers, mix),
      seeds: blendArrays(previousSource.cloud.seeds, currentSource.cloud.seeds, mix),
    }
  }, [currentSource.cloud, mix, previousSource.cloud])

  return {
    activeId: currentSource.id,
    activeName: currentSource.name,
    activeDescription: currentSource.description,
    activeIndex,
    transitionProgress: mix,
    sources,
    targetPositions: blended.positions,
    targetLayers: blended.layers,
    targetSeeds: blended.seeds,
  }
}

export default useShapeSource
