import { useRef, useEffect, useState, } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { GhostUser } from "../assets/GhostUser"

// ── blocked zones from your Ghost-empty positions ──────────────
// each zone = center x,z and half-size halfW, halfD
// player cannot enter these areas
const BLOCKED_ZONES = [
  { x: 0,        z: -10.5,   halfW: 3.0,  halfD: 3.5  }, // crypt
  { x: -8.074,   z: -13.078, halfW: 1.0,  halfD: 1.0  }, // tree
  { x: -7.969,   z: -10.952, halfW: 0.8,  halfD: 0.8  }, // tree
  { x: -11.684,  z: -12.192, halfW: 1.0,  halfD: 1.0  }, // tree
  { x: -11.822,  z: -8.674,  halfW: 1.0,  halfD: 1.0  }, // tree
  { x: -9.492,   z: -9.108,  halfW: 0.8,  halfD: 0.8  }, // tree
  { x: -6.002,   z: -9.969,  halfW: 1.2,  halfD: 1.2  }, // tree
  { x: 6.038,    z: -10.016, halfW: 1.0,  halfD: 1.0  }, // tree
  { x: 5.133,    z: -13.976, halfW: 0.8,  halfD: 0.8  }, // tree
  { x: -3.794,   z: -15.983, halfW: 2.5,  halfD: 0.3  }, // gate wall
  { x: -5.175,   z: 3.969,   halfW: 5.0,  halfD: 0.3  }, // fence
  { x: 5.768,    z: 3.996,   halfW: 4.0,  halfD: 0.3  }, // fence
  { x: -9.949,   z: -2.145,  halfW: 0.3,  halfD: 6.0  }, // side fence
]



// returns true if position x,z is inside any blocked zone
function isBlocked(x, z) {
  const playerRadius = 0.4  // how wide the player is
  return BLOCKED_ZONES.some(zone =>
    x > zone.x - zone.halfW - playerRadius &&
    x < zone.x + zone.halfW + playerRadius &&
    z > zone.z - zone.halfD - playerRadius &&
    z < zone.z + zone.halfD + playerRadius
  )
}

function Player({ sendState, playerRef }) {

  const meshRef = useRef()
  const keys = useRef({})
  const boneRef = useRef()
  const isSwinging  = useRef(false)
  const swingAngle  = useRef(0) 

  const lastSentTime = useRef(0)
  const lastSent = useRef({ x: 0, z: 0, rotation: 0 })
  // const [hit, setHit] = useState(false)
  const { camera } = useThree()

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.key] = true }
    const onKeyUp   = (e) => { keys.current[e.key] = false }
  
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup",   onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup",   onKeyUp)
    }
  }, [])

  // add this useEffect for click detection
  useEffect(() => {
    const onClick = () => {
      isSwinging.current = true
      swingAngle.current = 0
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    
    const speed = 4

    // share mesh with FollowCamera via playerRef
    if (playerRef) playerRef.current = mesh

    // ── get forward and right from CAMERA direction ──────────
    // camera looks where mouse points (PointerLockControls does this)
    // so we just extract forward/right from the camera

    // forward = where camera is looking, flattened to XZ plane
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0         // flatten — we don't want to fly up/down
    forward.normalize()

    // right = 90 degrees from forward
    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

   
    
//  // ── movement relative to camera direction ─────────────────
//     if (keys.current["w"] || keys.current["ArrowUp"]) {
//       mesh.position.x += forward.x * speed * delta
//       mesh.position.z += forward.z * speed * delta
//     }
//     if (keys.current["s"] || keys.current["ArrowDown"]) {
//       mesh.position.x -= forward.x * speed * delta
//       mesh.position.z -= forward.z * speed * delta
//     }
//     if (keys.current["d"] || keys.current["ArrowRight"]) {
//       mesh.position.x += right.x * speed * delta
//       mesh.position.z += right.z * speed * delta
//     }
//     if (keys.current["a"] || keys.current["ArrowLeft"]) {
//       mesh.position.x -= right.x * speed * delta
//       mesh.position.z -= right.z * speed * delta
//     }
    // ── calculate where player WANTS to go ───────────────────
    let newX = mesh.position.x
    let newZ = mesh.position.z
 
    if (keys.current["w"] || keys.current["ArrowUp"]) {
      newX += forward.x * speed * delta
      newZ += forward.z * speed * delta
    }
    if (keys.current["s"] || keys.current["ArrowDown"]) {
      newX -= forward.x * speed * delta
      newZ -= forward.z * speed * delta
    }
    if (keys.current["d"] || keys.current["ArrowRight"]) {
      newX += right.x * speed * delta
      newZ += right.z * speed * delta
    }
    if (keys.current["a"] || keys.current["ArrowLeft"]) {
      newX -= right.x * speed * delta
      newZ -= right.z * speed * delta
    }

        // ── collision check before moving ────────────────────────
    if (!isBlocked(newX, newZ)) {
      // fully clear — move normally
      mesh.position.x = newX
      mesh.position.z = newZ
    } else if (!isBlocked(newX, mesh.position.z)) {
      // blocked on Z — slide along X only
      mesh.position.x = newX
    } else if (!isBlocked(mesh.position.x, newZ)) {
      // blocked on X — slide along Z only
      mesh.position.z = newZ
    }
    // fully blocked — don't move at all

    // ── boundary ──────────────────────────────────────────────
    if (mesh.position.x > 15) mesh.position.x = 15
    if (mesh.position.x < -15) mesh.position.x = -15
    if (mesh.position.z > 12) mesh.position.z = 12
    if (mesh.position.z < -18) mesh.position.z = -18

    // swing animation
    if (isSwinging.current && boneRef.current) {

      // increase angle over time
      swingAngle.current += delta * 5

      // convert 60 degrees to radians = 1.047
      const maxAngle = THREE.MathUtils.degToRad(90)

      // rotate forward then back using sin wave
      boneRef.current.rotation.x = Math.sin(swingAngle.current) * maxAngle
   
      // stop when full swing is done
      if (swingAngle.current > Math.PI) {
        isSwinging.current = false
        swingAngle.current = 0
        boneRef.current.rotation.x = 0  // reset
      }
    }


    // rotate cube mesh to match camera horizontal rotation
    mesh.rotation.y = Math.atan2(forward.x, forward.z)

    // ── send to server ────────────────────────────────────────
    const x        = parseFloat(mesh.position.x.toFixed(2))
    const z        = parseFloat(mesh.position.z.toFixed(2))
    const rotation = parseFloat(mesh.rotation.y.toFixed(2))

    const now = state.clock.elapsedTime
    const changed = x !== lastSent.current.x
                 || z !== lastSent.current.z
                 || rotation !== lastSent.current.rotation

    if (changed && now - lastSentTime.current > 0.1) {
      sendState(x, z, rotation)
      lastSent.current = { x, z, rotation }
      lastSentTime.current = now
    }
  })

  return (

      <group ref={meshRef} name="player" position={[0, 0, 0]}>
          <group ref={boneRef} position={[0, 0.2, 0]}>
              <GhostUser position={[0, 0, 0]} />
          </group>
      </group>
    
  

  )
}

export default Player