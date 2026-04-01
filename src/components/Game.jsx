import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import useWebSocket from "../hooks/useWebSocket"
import Player from "./Player"
import OtherPlayer from "./OtherPlayer"
import Floor from "./Floor"

// ─────────────────────────────────────────────
// Main Game component
// ─────────────────────────────────────────────
function Game({ username }) {

  // get sendState function and otherPlayers array from our hook
  const { sendState, otherPlayers } = useWebSocket(username)

  return (
    <div style={{ width: "100vw", height: "100vh" }}>

      <Canvas camera={{ position: [10, 10, 10], fov: 40 }}>

        {/* Lights */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* Floor */}
        <Floor />

        {/* My cube — pass sendState so Player can send position each frame */}
        {/* name="player" kept for future camera/logic usage */}
        <Player sendState={sendState} name="player" />

        {/* Other players — one cube per connected user */}
        {otherPlayers.map((player) => (
          <OtherPlayer
            key={player.username}        // React needs a unique key
            username={player.username}
            state={player.state}
          />
        ))}

        {/* Orbit camera controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={40}
          target={[0, 0, 0]}
        />
      </Canvas>

    </div>
  )
}

export default Game