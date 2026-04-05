import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function Player({ sendState, playerRef }) {

  const meshRef = useRef()
  const keys = useRef({})
  const lastSentTime = useRef(0)
  const lastSent = useRef({ x: 0, z: 0, rotation: 0 })

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

    // ── movement relative to camera direction ─────────────────
    if (keys.current["w"] || keys.current["ArrowUp"]) {
      mesh.position.x += forward.x * speed * delta
      mesh.position.z += forward.z * speed * delta
    }
    if (keys.current["s"] || keys.current["ArrowDown"]) {
      mesh.position.x -= forward.x * speed * delta
      mesh.position.z -= forward.z * speed * delta
    }
    if (keys.current["d"] || keys.current["ArrowRight"]) {
      mesh.position.x += right.x * speed * delta
      mesh.position.z += right.z * speed * delta
    }
    if (keys.current["a"] || keys.current["ArrowLeft"]) {
      mesh.position.x -= right.x * speed * delta
      mesh.position.z -= right.z * speed * delta
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
    <mesh ref={meshRef} name="player" position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="skyblue" />
    </mesh>
  )
}

export default Player