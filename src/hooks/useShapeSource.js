import { useEffect, useMemo, useRef, useState } from 'react'
import mountainSvg from '../assets/shapes/mountain.svg?raw'
import sealSvg from '../assets/shapes/seal.svg?raw'
import roofSvg from '../assets/shapes/roof.svg?raw'
import pineSvg from '../assets/shapes/pine.svg?raw'
import strokeSvg from '../assets/shapes/stroke.svg?raw'
import cloudSvg from '../assets/shapes/cloud.svg?raw'
import { smoothStep } from '../utils/math'
import { sampleSvgPointCloud } from '../utils/shapeSampling'

const SHAPE_SOURCES = [
  {
    id: 'mountain',
    name: '山岚',
    description: '像远山的呼吸，作为当前默认轮廓。',
    svg: mountainSvg,
  },
  {
    id: 'roof',
    name: '屋檐',
    description: '更安静的建筑边线，适合作为古画的留白骨架。',
    svg: roofSvg,
  },
  {
    id: 'pine',
    name: '古松',
    description: '枝干与层次轻轻交叠，形成更有气韵的轮廓。',
    svg: pineSvg,
  },
  {
    id: 'stroke',
    name: '墨痕',
    description: '一笔横向的飞白与拖尾，适合散开与回收。',
    svg: strokeSvg,
  },
  {
    id: 'cloud',
    name: '云气',
    description: '一团更松的雾形，作为过渡时的呼吸层。',
    svg: cloudSvg,
  },
  {
    id: 'seal',
    name: '方印',
    description: '极简印章轮廓，用作收束与落点。',
    svg: sealSvg,
  },
]

const SHAPE_CYCLE_INTERVAL = 18000
const SHAPE_MORPH_DURATION = 5200

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
      const cloud = sampleSvgPointCloud(source.svg, particleCount, {
        targetSize: source.id === 'seal' ? 2.0 : 2.25,
        contourRatio:
          source.id === 'stroke' ? 0.52 : source.id === 'cloud' ? 0.28 : 0.36,
      })

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

    const timer = window.setInterval(cycle, SHAPE_CYCLE_INTERVAL)

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
      const raw = (now - start) / SHAPE_MORPH_DURATION
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
