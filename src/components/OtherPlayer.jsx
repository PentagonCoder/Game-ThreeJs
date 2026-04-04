import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"

function OtherPlayer({ username, state }) {

  const groupRef = useRef()

  // move the whole group (cube + text) every frame based on server state
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.x += (state.x - groupRef.current.position.x) * 0.05
    groupRef.current.position.z += (state.z - groupRef.current.position.z) * 0.05
  })

  return (
    // moving the group moves both cube AND text together
    <group ref={groupRef} position={[state.x, 0, state.z]}>

      {/* orange cube = other player */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={state.color || "orange"} />
      </mesh>

      {/* username above — position [0,1.2,0] is LOCAL to the group */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
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