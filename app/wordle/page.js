"use client"
import { useState, useEffect } from "react"

const words = ["APPLE", "MANGO", "GRAPE", "PEACH"]

const getDailyWord = () => {
  const index = new Date().getDate() % words.length
  return words[index]
}

export default function Wordle() {
  const WORD = getDailyWord()

  const [guess, setGuess] = useState("")
  const [history, setHistory] = useState([])
  const [gameOver, setGameOver] = useState(false)

  // NEW FEATURES
  const [time, setTime] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [keyColors, setKeyColors] = useState({})

  // ⏱️ TIMER
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [gameOver])

  // 💾 LOAD DATA
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wordle-data"))
    if (data) {
      setHistory(data.history || [])
      setScore(data.score || 0)
      setStreak(data.streak || 0)
      setTime(data.time || 0)
      setKeyColors(data.keyColors || {})
    }
  }, [])

  // 💾 SAVE DATA
  useEffect(() => {
    localStorage.setItem("wordle-data", JSON.stringify({
      history,
      score,
      streak,
      time,
      keyColors
    }))
  }, [history, score, streak, time, keyColors])

  // ⌨️ KEYBOARD INPUT
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return

      if (e.key === "Enter") handleSubmit()
      else if (e.key === "Backspace") setGuess(g => g.slice(0, -1))
      else if (/^[a-zA-Z]$/.test(e.key) && guess.length < 5) {
        setGuess(g => (g + e.key).toUpperCase())
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [guess, gameOver])

  const handleSubmit = () => {
    if (guess.length !== 5 || gameOver) return

    const result = guess.split("").map((letter, i) => {
      if (letter === WORD[i]) return "green"
      if (WORD.includes(letter)) return "yellow"
      return "gray"
    })

    const newHistory = [...history, { guess, result }]
    setHistory(newHistory)
    setGuess("")

    // 🎯 UPDATE KEY COLORS
    let updatedKeys = { ...keyColors }
    guess.split("").forEach((letter, i) => {
      if (letter === WORD[i]) updatedKeys[letter] = "green"
      else if (WORD.includes(letter)) updatedKeys[letter] = "yellow"
      else updatedKeys[letter] = "gray"
    })
    setKeyColors(updatedKeys)

    // 🏆 WIN
    if (guess === WORD) {
      setScore(s => s + 10)
      setStreak(s => s + 1)
      setGameOver(true)
      setTimeout(() => alert("You Win 🎉"), 300)
    }

    // ❌ LOSE
    if (newHistory.length === 6 && guess !== WORD) {
      setStreak(0)
      setGameOver(true)
      setTimeout(() => alert("Game Over 😢 Word was " + WORD), 300)
    }
  }

  const shareResult = () => {
    let text = history.map(row =>
      row.result.map(c =>
        c === "green" ? "🟩" :
        c === "yellow" ? "🟨" : "⬛"
      ).join("")
    ).join("\n")

    navigator.clipboard.writeText(text)
    alert("Copied!")
  }

  const addLetter = (l) => {
    if (guess.length < 5 && !gameOver) {
      setGuess(guess + l)
    }
  }

  const removeLetter = () => setGuess(guess.slice(0, -1))

  const keys = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]

  return (
    <div style={container}>
      <h1 style={{ color: "white" }}>🎮 Wordle</h1>

      {/* STATS */}
      <div style={{ color: "white" }}>
        ⏱️ {time}s | 🏆 {score} | 🔥 {streak}
      </div>

      {/* GRID */}
      <div>
        {[...Array(6)].map((_, i) => {
          const row = history[i]
          const current = i === history.length

          return (
            <div key={i} style={rowStyle}>
              {[...Array(5)].map((_, j) => {
                let letter = ""
                let color = "#222"

                if (row) {
                  letter = row.guess[j]
                  color = row.result[j]
                } else if (current) {
                  letter = guess[j] || ""
                }

                return (
                  <div key={j} style={{
                    ...tile,
                    background: color,
                    transform: letter ? "scale(1.05)" : "scale(1)",
                    transition: "0.2s"
                  }}>
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* KEYBOARD */}
      <div style={{ marginTop: "20px" }}>
        {keys.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center" }}>
            {row.split("").map((k) => (
              <button key={k}
                onClick={() => addLetter(k)}
                style={{ ...keyBtn, background: keyColors[k] || "#333" }}>
                {k}
              </button>
            ))}
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={handleSubmit} style={keyBtn}>ENTER</button>
          <button onClick={removeLetter} style={keyBtn}>⌫</button>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => window.location.reload()} style={btn}>
          Restart
        </button>
        <button onClick={shareResult} style={btn}>
          Share
        </button>
      </div>
    </div>
  )
}

// 🎨 STYLES
const container = {
  textAlign: "center",
  marginTop: "30px",
  background: "#121213",
  minHeight: "100vh",
  padding: "20px"
}

const rowStyle = {
  display: "flex",
  justifyContent: "center"
}

const tile = {
  width: "60px",
  height: "60px",
  margin: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  fontWeight: "bold",
  color: "white",
  borderRadius: "6px"
}

const keyBtn = {
  margin: "4px",
  padding: "10px",
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
}

const btn = {
  margin: "10px",
  padding: "10px 15px",
  background: "#555",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
}