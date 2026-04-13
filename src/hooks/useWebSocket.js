import { useEffect, useRef, useState } from "react"


function useWebSocket(username) {

  // otherPlayers is an array like:
  // [ { username: "John", state: { x, z } }, { username: "Jane", state: { x, z } } ]
  const [otherPlayers, setOtherPlayers] = useState([])

  // useRef to store the WebSocket instance, not in state because we don't want re-renders when it changes
  const wsRef = useRef(null)

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
        const allUsers = JSON.parse(event.data)

        // filter out ourselves
        const others = allUsers.filter(user => user.username !== username)
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

    ws.onclose = () => {
      console.log("Disconnected from server")
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err)
    }

    // Cleanup — close connection when component unmounts
    return () => {
      ws.close()
    }

  }, [username])


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

  return { otherPlayers, sendState }
}

export default useWebSocket