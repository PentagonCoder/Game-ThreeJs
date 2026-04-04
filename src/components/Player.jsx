import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"

function Player({ sendState }) {

  const meshRef = useRef()

  // track which keys are pressed
  const keys = useRef({})

  // store last sent position so we only send when something changed
  const lastSent = useRef({ x: 0, z: 0 })

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


  // runs every frame
  useFrame((state, delta) => {
    const mesh = meshRef.current
    const speed = 4

    // move cube with WASD
    if (keys.current["w"] || keys.current["ArrowUp"])    mesh.position.z -= speed * delta
    if (keys.current["s"] || keys.current["ArrowDown"])  mesh.position.z += speed * delta
    if (keys.current["a"] || keys.current["ArrowLeft"])  mesh.position.x -= speed * delta
    if (keys.current["d"] || keys.current["ArrowRight"]) mesh.position.x += speed * delta

    const x = parseFloat(mesh.position.x.toFixed(2))
    const z = parseFloat(mesh.position.z.toFixed(2))
    
    // only send if position changed
    if (x !== lastSent.current.x || z !== lastSent.current.z) {
      sendState(x, z)
      lastSent.current = { x, z }
    }

  })

  return (
    <mesh ref={meshRef} name="player" position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* blue cube = me */}
      <meshStandardMaterial color="skyblue" />
    </mesh>
  )
}

export default Player