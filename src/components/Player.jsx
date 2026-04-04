import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"

function Player({ sendState }) {

  const meshRef = useRef()
  const keys = useRef({})
  const lastSentTime = useRef(0)   // tracks when we last sent

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

    // but we only SEND to server 10 times per second
    const now = state.clock.elapsedTime   // seconds since app started

    if (now - lastSentTime.current > 0.1) {     // 0.1 sec = 10 per second
      sendState(mesh.position.x, mesh.position.z)
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