import { Tube } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"


function useWebSocket(username,) {

  // otherPlayers is an array like:
  // [ { username: "John", state: { x, z } }, { username: "Jane", state: { x, z } } ]
  const [otherPlayers, setOtherPlayers] = useState([])
  const [isDead, setIsDead] = useState(false)
  // useRef to store the WebSocket instance, not in state because we don't want re-renders when it changes
  const wsRef = useRef(null)
  const hitCount = useRef({})

//localhost:8080
// https://game-server-websocket.onrender.com
  useEffect(() => {
    // 1. Connect to server with username in URL
    const ws = new WebSocket(`wss://game-server-websocket.onrender.com?username=${username}`)
    wsRef.current = ws

    // 2. When server sends data (all players' positions)
    ws.onmessage = (event) => {
      // ✅ try/catch so plain string messages don't crash the app
      try {
        const data = JSON.parse(event.data)

        
        // server told us we died
        if (data.type === "you_died") {
          setIsDead(true)
          return
        }

        // normal position broadcast — array
        if (Array.isArray(data)){
          // filter out ourselves
          const others = data.filter(user => user.username !== username)
          setOtherPlayers(others)
        }


      } catch (e) {
        // server sent a plain string like "You are now connected!"
        // just log it and ignore
        console.log("Server says:", event.data)
      }
    }

    ws.onopen = () => {
      console.log("Connected to server!")
    }

    ws.onclose = (event) => {
      console.log("Disconnected from server")
    }

    ws.onerror = (err) => console.error("WS error:", err)
    return () => ws.close()
  }, [username])

    // Cleanup — close connection when component unmounts


  // This function is called by Player.jsx every frame
  // It sends our current position to the server
  function sendState(x, z ,rotation) {
    const ws = wsRef.current
    // Only send if connection is open (readyState 1 = OPEN)
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ x, z, rotation }))
    }
  }

  // called when bone hits another player
  function sendHit(targetUsername) {
    // send EVERY hit to server — don't count locally
    const ws = wsRef.current
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: "hit",
        target: targetUsername
      }))
      console.log(`Sent hit to ${targetUsername}`)
    }
  }

  return { otherPlayers, sendState, sendHit ,isDead}
}

export default useWebSocket