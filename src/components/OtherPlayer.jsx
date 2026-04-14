import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import {GhostPlayer} from "../assets/GhostPlayer"

function OtherPlayer({ username, state }) {

  const safeState = {
    x: Number.isFinite(state?.x) ? state.x : 0,
    z: Number.isFinite(state?.z) ? state.z : 0,
    rotation: Number.isFinite(state?.rotation) ? state.rotation : 0,
  }

  const groupRef = useRef()

  // move the whole group (cube + text) every frame based on server state
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.x += (safeState.x - groupRef.current.position.x) * 0.05
    groupRef.current.position.z += (safeState.z - groupRef.current.position.z) * 0.05
    groupRef.current.rotation.y += (safeState.rotation - groupRef.current.rotation.y) * 0.05
  })

  return (
    // moving the group moves both cube AND text together
    <group ref={groupRef} position={[safeState.x, 0, safeState.z]}>

      {/* orange cube = other player */}
      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={state.color || "orange"} />
      </mesh> */}

      {/* ghost model = other player */}
      <GhostPlayer position={[0, 0.3, 0]} />

      {/* username above — position [0,1.2,0] is LOCAL to the group */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {username}
      </Text>

    </group>
  )
}

export default OtherPlayer