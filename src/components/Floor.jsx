// ─────────────────────────────────────────────
//  A simple flat floor so we have ground reference
// ─────────────────────────────────────────────


export default function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
  )
}
