import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"

function Player({ sendState }) {

  const meshRef = useRef()
  const keys = useRef({})
  const lastSentTime = useRef(0)   // tracks when we last sent
  const lastSent = useRef({ x: 0, z: 0 })   // tracks what we last sent

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

    // movement still runs every frame (60fps) — smooth on YOUR screen
    if (keys.current["w"] || keys.current["ArrowUp"])    mesh.position.z -= speed * delta
    if (keys.current["s"] || keys.current["ArrowDown"])  mesh.position.z += speed * delta
    if (keys.current["a"] || keys.current["ArrowLeft"])  mesh.position.x -= speed * delta
    if (keys.current["d"] || keys.current["ArrowRight"]) mesh.position.x += speed * delta

    const x = parseFloat(mesh.position.x.toFixed(2))
    const z = parseFloat(mesh.position.z.toFixed(2))
    // but we only SEND to server 10 times per second
    const now = state.clock.elapsedTime   // seconds since app started

    // only send if something actually changed AND 100ms has passed
    const positionChanged = x !== lastSent.current.x || z !== lastSent.current.z

    if (positionChanged && now - lastSentTime.current > 0.1) {     // 0.05 sec = 20 per second
      sendState(x, z)
      lastSentTime.current = now
      lastSent.current = { x, z }
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