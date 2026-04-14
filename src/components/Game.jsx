import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

import useWebSocket from "../hooks/useWebSocket"
import Player from "./Player"
import OtherPlayer from "./OtherPlayer"
import {Model} from "./GHOST-compressed"
// import { EmptyObject } from "./Ghost-empty"
// import Floor from "./Floor"

// ─────────────────────────────────────────────
// Camera that sticks to the player
// PointerLockControls handles mouse look
// we just move camera position every frame
// ─────────────────────────────────────────────


function FollowCamera({ playerRef }) {
  const { camera } = useThree()
    useFrame(() => {
      if (!playerRef.current) return
  
      const player = playerRef.current
  
      // get the direction the player is facing
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()
  
      // camera goes BEHIND the player
      // behind = opposite of forward
      // so we subtract forward from player position
      const distance = 2    // how far behind
      const height   = 1.5    // how high above

      // ── smooth follow with lerp ─────────────────────────────
      const targetX = player.position.x - forward.x * distance
      const targetY = player.position.y + height
      const targetZ = player.position.z - forward.z * distance
      // lerp camera position towards target — smooth follow, not instant snap
      camera.position.x += (targetX - camera.position.x) * 0.1
      camera.position.y += (targetY - camera.position.y) * 0.1
      camera.position.z += (targetZ - camera.position.z) * 0.1
  })

 
  return null
}
// ─────────────────────────────────────────────
// Main Game
// ─────────────────────────────────────────────
function Game({ username }) {
  const { sendState, otherPlayers } = useWebSocket(username)

  // shared ref — Player puts its mesh here, FollowCamera reads from it
  const playerRef = useRef()

  return (
    <div style={{ width: "100vw", height: "100vh" }}>

      {/* click to lock mouse */}
      <div style={{
        position: "absolute",
        top: "10%", left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontFamily: "monospace",
        fontSize: 16,
        background: "rgba(0,0,0,0.6)",
        padding: "12px 20px",
        borderRadius: 8,
        pointerEvents: "none",
        zIndex: 10
      }}>
        Click to play — Esc to unlock mouse
      </div>

      <Canvas camera={{ fov: 75 }}>

        {/* lights */}
        {/* <ambientLight intensity={0.8} /> */}
        <directionalLight position={[5, 10, 5]} intensity={0.3} />

        {/* dark purple halloween sky */}
        <color attach="background" args={["#1a0a2e"]} />

        
        {/* fog so far objects fade into darkness */}
        <fog attach="fog" args={["#1a0a2e", 10, 40]} />

        {/* brighter ambient so the scene is visible */}
        <ambientLight intensity={0.5} />

          {/* moonlight from above */}
        <directionalLight position={[5, 15, 5]} intensity={0.8} color="#c9d4ff" />

          {/* orange spooky point light near ground */}
        <pointLight position={[0, 2, 0]} color="#ff6600" intensity={1} distance={15} />
 

        {/* 
          PointerLockControls — click to lock mouse
          mouse look is handled automatically
          we just move camera position in FollowCamera
        */}
        <PointerLockControls />

        {/* camera follows the player mesh */}
        <FollowCamera playerRef={playerRef} />
        
          {/* <Floor /> */}
          <Model position={[0, -0.5, 0]} />
          {/* <EmptyObject position={[0, -0.5, 0]} /> */}

          {/* pass playerRef so Player can fill it with its mesh */}
          <Player sendState={sendState} playerRef={playerRef} />

          {otherPlayers.map((player) => (
            <OtherPlayer
              key={player.username}
              username={player.username}
              state={player.state}
            />
          ))}
      </Canvas>
    </div>
  )
}

export default Game