import { useEffect, useRef, useState } from "react"
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080"

function useWebSocket(username, onDisconnect) {

  // otherPlayers is an array like:
  // [ { username: "John", state: { x, z } }, { username: "Jane", state: { x, z } } ]
  const [otherPlayers, setOtherPlayers] = useState([])

  // useRef to store the WebSocket instance, not in state because we don't want re-renders when it changes
  const wsRef = useRef(null)
  const isManualCloseRef = useRef(false)

//localhost:8080
// https://game-server-websocket.onrender.com
  useEffect(() => {
    isManualCloseRef.current = false

    // 1. Connect to server with username in URL
    const ws = new WebSocket(`${WS_URL}?username=${encodeURIComponent(username)}`)
    wsRef.current = ws

    // 2. When server sends data (all players' positions)
    ws.onmessage = (event) => {
      // ✅ try/catch so plain string messages don't crash the app
      try {
        const allUsers = JSON.parse(event.data)

        if (!Array.isArray(allUsers)) return

        // filter out ourselves
        const others = allUsers.filter(user => user && user.username && user.username !== username)
        setOtherPlayers(others)

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

      if (isManualCloseRef.current) return

      if (typeof onDisconnect === "function") {
        onDisconnect({
          code: event.code,
          reason: event.reason,
          message: event.code === 4001
            ? (event.reason || "You were eliminated")
            : "Connection lost. Please join again.",
        })
      }
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err)
    }

    // Cleanup — close connection when component unmounts
    return () => {
      isManualCloseRef.current = true
      ws.close()
    }

  }, [username, onDisconnect])


  // This function is called by Player.jsx every frame
  // It sends our current position to the server
  function sendState(x, z ,rotation) {
    const ws = wsRef.current

    // Only send if connection is open (readyState 1 = OPEN)
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(
        { 
          x, 
          z,
          rotation,
        }
      ))
    }
  }

  function sendHit(target) {
  const ws = wsRef.current

  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({
      type: "hit",
      target
    }))
  }
}

  return { otherPlayers, sendState, sendHit }
}

export default useWebSocket