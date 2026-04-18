function fract(value) {
  return value - Math.floor(value)
}

function hash3(x, y, z, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453123
  return fract(n)
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function valueNoise3(x, y, z, seed = 0) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi

  const u = smoothstep(xf)
  const v = smoothstep(yf)
  const w = smoothstep(zf)

  const c000 = hash3(xi, yi, zi, seed)
  const c100 = hash3(xi + 1, yi, zi, seed)
  const c010 = hash3(xi, yi + 1, zi, seed)
  const c110 = hash3(xi + 1, yi + 1, zi, seed)
  const c001 = hash3(xi, yi, zi + 1, seed)
  const c101 = hash3(xi + 1, yi, zi + 1, seed)
  const c011 = hash3(xi, yi + 1, zi + 1, seed)
  const c111 = hash3(xi + 1, yi + 1, zi + 1, seed)

  const x00 = c000 + (c100 - c000) * u
  const x10 = c010 + (c110 - c010) * u
  const x01 = c001 + (c101 - c001) * u
  const x11 = c011 + (c111 - c011) * u
  const y0 = x00 + (x10 - x00) * v
  const y1 = x01 + (x11 - x01) * v

  return y0 + (y1 - y0) * w
}

export function curlLikeFlow(x, y, z, time, seed = 0) {
  const e = 0.08
  const n1 = (ax, ay, az) => valueNoise3(ax, ay, az + time * 0.3, seed + 13.1)
  const n2 = (ax, ay, az) => valueNoise3(ax + 17.3, ay - 9.2, az + time * 0.25, seed + 31.7)
  const n3 = (ax, ay, az) => valueNoise3(ax - 11.4, ay + 7.6, az + time * 0.2, seed + 52.9)

  const dx = n1(x, y + e, z) - n1(x, y - e, z)
  const dy = n1(x, y, z + e) - n1(x, y, z - e)
  const dz = n1(x + e, y, z) - n1(x - e, y, z)

  const ex = n2(x, y + e, z) - n2(x, y - e, z)
  const ey = n2(x, y, z + e) - n2(x, y, z - e)
  const ez = n2(x + e, y, z) - n2(x - e, y, z)

  const fx = n3(x, y + e, z) - n3(x, y - e, z)
  const fy = n3(x, y, z + e) - n3(x, y, z - e)
  const fz = n3(x + e, y, z) - n3(x - e, y, z)

  return {
    x: dy - dz + ex * 0.5 - fx * 0.35,
    y: dz - dx + ey * 0.5 - fy * 0.35,
    z: dx - dy + ez * 0.5 - fz * 0.35,
  }
}

