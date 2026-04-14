import { useState } from "react"
import Game from "./components/Game"

function App() {

  const [username, setUsername] = useState("")
  const [joined, setJoined] = useState(false)


  // when user clicks Join
  function handleJoin() {
    if (username.trim() === "") return  // don't allow empty username
    setJoined(true)
  }

  // if joined → show the game
  if (joined) {
    return (
      <Game username={username} />
    )
  }

  // otherwise → show username input screen
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      fontFamily: "monospace"
    }}>

      <h2 style={{ color: "white", marginBottom: 8 }}>Enter your username</h2>

      <input
        type="text"
        placeholder="e.g. John"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        // also allow pressing Enter to join
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        style={{
          padding: "10px 14px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          outline: "none",
          fontFamily: "monospace"
        }}
      />

      <button
        onClick={handleJoin}
        style={{
          padding: "10px 24px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          background: "#38bdf8",
          color: "#0f172a",
          fontFamily: "monospace",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Join Game
      </button>

    </div>
  )
}

export default App