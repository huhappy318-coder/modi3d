import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

function pointInPolygon(point, polygon) {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

function getBounds(points) {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  }

  for (const point of points) {
    bounds.minX = Math.min(bounds.minX, point.x)
    bounds.minY = Math.min(bounds.minY, point.y)
    bounds.maxX = Math.max(bounds.maxX, point.x)
    bounds.maxY = Math.max(bounds.maxY, point.y)
  }

  return bounds
}

function normalizePoints(points, targetSize) {
  const bounds = getBounds(points)
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const longestSide = Math.max(width, height) || 1
  const scale = targetSize / longestSide
  const centerX = bounds.minX + width / 2
  const centerY = bounds.minY + height / 2

  return points.map((point) => ({
    x: (point.x - centerX) * scale,
    y: -(point.y - centerY) * scale,
  }))
}

function sampleContourPoints(contour, count) {
  const sampled = []

  if (contour.length === 0) {
    return sampled
  }

  for (let index = 0; index < count; index += 1) {
    const pointIndex = Math.floor((index / count) * contour.length) % contour.length
    const point = contour[pointIndex]
    sampled.push({
      x: point.x,
      y: point.y,
      layer: 1,
    })
  }

  return sampled
}

function sampleInteriorPoints(contour, count) {
  const bounds = getBounds(contour)
  const sampled = []
  const attemptsLimit = count * 80
  let attempts = 0

  while (sampled.length < count && attempts < attemptsLimit) {
    const candidate = {
      x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
    }

    if (pointInPolygon(candidate, contour)) {
      sampled.push({
        x: candidate.x,
        y: candidate.y,
        layer: 0,
      })
    }

    attempts += 1
  }

  return sampled
}

export function sampleSvgPointCloud(svgText, count, options = {}) {
  const { targetSize = 2.1, contourRatio = 0.34 } = options
  const loader = new SVGLoader()
  const data = loader.parse(svgText)
  const paths = data.paths.flatMap((path) => SVGLoader.createShapes(path))
  const normalizedPaths = paths
    .map((shape) => shape.getSpacedPoints(140))
    .filter((points) => points.length > 0)

  if (normalizedPaths.length === 0) {
    return {
      positions: new Float32Array(count * 3),
      layers: new Float32Array(count),
      seeds: new Float32Array(count),
    }
  }

  const baseContour = normalizedPaths[0]
  const contour = normalizePoints(baseContour, targetSize)
  const contourCount = Math.max(1, Math.floor(count * contourRatio))
  const interiorCount = Math.max(0, count - contourCount)
  const contourPoints = sampleContourPoints(contour, contourCount)
  const interiorPoints = sampleInteriorPoints(contour, interiorCount)
  const allPoints = [...contourPoints, ...interiorPoints]
  const positions = new Float32Array(count * 3)
  const layers = new Float32Array(count)
  const seeds = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const point = allPoints[index % allPoints.length]
    const i3 = index * 3
    const depthBias = (Math.random() - 0.5) * 0.14

    positions[i3] = point.x + (Math.random() - 0.5) * 0.02
    positions[i3 + 1] = point.y + (Math.random() - 0.5) * 0.02
    positions[i3 + 2] = depthBias
    layers[index] = point.layer
    seeds[index] = Math.random()
  }

  return {
    positions,
    layers,
    seeds,
  }
}

export function expandPointCloud(cloud, targetCount) {
  const sourceCount = Math.max(1, cloud.positions.length / 3)
  const positions = new Float32Array(targetCount * 3)
  const layers = new Float32Array(targetCount)
  const seeds = new Float32Array(targetCount)

  for (let index = 0; index < targetCount; index += 1) {
    const sourceIndex = (index * 37) % sourceCount
    const source3 = sourceIndex * 3
    const target3 = index * 3
    const jitter = (Math.random() - 0.5) * 0.018
    const layer = cloud.layers[sourceIndex] ?? 0

    positions[target3] = cloud.positions[source3] + jitter
    positions[target3 + 1] = cloud.positions[source3 + 1] + jitter * 0.8
    positions[target3 + 2] = cloud.positions[source3 + 2] + jitter * 0.35
    layers[index] = layer
    seeds[index] = cloud.seeds[sourceIndex] ?? Math.random()
  }

  return {
    positions,
    layers,
    seeds,
  }
}
