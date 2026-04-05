import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

import useWebSocket from "../hooks/useWebSocket"
import Player from "./Player"
import OtherPlayer from "./OtherPlayer"
import Floor from "./Floor"

// ─────────────────────────────────────────────
// Camera that sticks to the player
// PointerLockControls handles mouse look
// we just move camera position every frame
// ─────────────────────────────────────────────

// function FollowCamera({ playerRef }) {
//   const { camera } = useThree()

//   useFrame(() => {
//     if (!playerRef.current) return

//     const player = playerRef.current

//     // place camera AT the player position + a little above (eye level)
//     camera.position.x = player.position.x
//     camera.position.y = player.position.y + 1.6  // eye height
//     camera.position.z = player.position.z + 2.1 // slight offset to prevent z-fighting with floor
//   })

//   return null
// }

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
      const distance = 3    // how far behind
      const height   = 2    // how high above
  
      camera.position.x = player.position.x - forward.x * distance
      camera.position.y = player.position.y + height
      camera.position.z = player.position.z - forward.z * distance
  
      // camera always looks AT the player head
      const lookTarget = new THREE.Vector3(
        player.position.x,
        player.position.y + 1,
        player.position.z
      )
      camera.lookAt(lookTarget)
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
        top: "50%", left: "50%",
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
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* 
          PointerLockControls — click to lock mouse
          mouse look is handled automatically
          we just move camera position in FollowCamera
        */}
        <PointerLockControls />

        {/* camera follows the player mesh */}
        <FollowCamera playerRef={playerRef} />

        <Floor />

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