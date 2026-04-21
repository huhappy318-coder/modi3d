import ParticleScene from './components/ParticleScene'
import OverlayUI from './components/OverlayUI'

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0f14] text-cloud">
      <div className="atmosphere-layer atmosphere-layer-top" />
      <div className="atmosphere-layer atmosphere-layer-bottom" />
      <div className="noise-layer" />

      <ParticleScene />
      <OverlayUI />
    </main>
  )
}

export default App
