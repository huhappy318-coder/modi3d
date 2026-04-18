import { useEffect, useMemo, useRef } from 'react'

function normalizeCoordinate(value, size) {
  if (!size) {
    return 0
  }

  return (value / size) * 2 - 1
}

function useInteractionPoint() {
  const screenRef = useRef({ x: 0, y: 0 })
  const forcePointRef = useRef({ x: 0, y: 0, z: 0 })
  const isActiveRef = useRef(false)
  const strengthRef = useRef(0)
  const setForcePoint = (x, y, z = 0, active = true, strength = 1) => {
    const point = { x, y, z }
    screenRef.current = { x, y }
    forcePointRef.current = point
    isActiveRef.current = active
    strengthRef.current = strength
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      const x = normalizeCoordinate(event.clientX, window.innerWidth)
      const y = -normalizeCoordinate(event.clientY, window.innerHeight)

      setForcePoint(x, y)
    }

    const handlePointerLeave = () => {
      setForcePoint(forcePointRef.current.x, forcePointRef.current.y, forcePointRef.current.z, false, 0)
    }

    const handleBlur = () => {
      setForcePoint(forcePointRef.current.x, forcePointRef.current.y, forcePointRef.current.z, false, 0)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return useMemo(
    () => ({
      setForcePoint,
      forcePointRef,
      screenRef,
      isActiveRef,
      strengthRef,
    }),
    [],
  )
}

export default useInteractionPoint
