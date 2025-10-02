import React, { createContext, useContext, useState } from "react"
import { boardData } from "../data/boardData"; 
import chanceCards from "../data/chanceCards"
import communityChestCards from "../data/communityChestCards"

const GameContext = createContext()

export function GameProvider({ children }) {
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", color: "red", position: 0, money: 1500, properties: [], inJail: false },
    { id: 2, name: "Player 2", color: "blue", position: 0, money: 1500, properties: [], inJail: false },
  ])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [dice, setDice] = useState([1, 1])
  const [rolling, setRolling] = useState(false)
  const [log, setLog] = useState([])
  const [activeTile, setActiveTile] = useState(null)
  const [activeCard, setActiveCard] = useState(null)

  const addLog = (msg) => setLog((l) => [...l, msg])

  const rollDice = () => {
    if (rolling) return
    setRolling(true)
    setTimeout(() => {
      const d1 = Math.ceil(Math.random() * 6)
      const d2 = Math.ceil(Math.random() * 6)
      setDice([d1, d2])
      movePlayer(d1 + d2)
      setRolling(false)
    }, 1000)
  }

  const movePlayer = (steps) => {
    setPlayers((prev) => {
      const updated = [...prev]
      let player = { ...updated[currentPlayer] }
      let newPos = (player.position + steps) % 40

      if (newPos < player.position) {
        player.money += 200
        addLog(`${player.name} passed GO and collected $200`)
      }

      player.position = newPos
      updated[currentPlayer] = player
      handleTile(updated, player, newPos)
      return updated
    })
  }

  const handleTile = (updated, player, pos) => {
    const tile = boardData[pos]
    addLog(`${player.name} landed on ${tile.name}`)

    switch (tile.type) {
      case "property":
        if (!tile.owner) {
          setActiveTile(tile)
        } else if (tile.owner !== player.id) {
          payRent(updated, player, tile)
        }
        break
      case "tax":
        player.money -= tile.amount
        addLog(`${player.name} paid $${tile.amount} in taxes`)
        break
      case "chance":
        drawCard(chanceCards, player, updated)
        break
      case "community":
        drawCard(communityChestCards, player, updated)
        break
      case "corner":
        if (tile.name === "Go To Jail") {
          player.position = 10
          player.inJail = true
          addLog(`${player.name} was sent to Jail`)
        }
        if (tile.name === "Free Parking") {
          player.money += 100
          addLog(`${player.name} collected $100 on Free Parking`)
        }
        break
      default:
        break
    }
  }

  const drawCard = (deck, player, updated) => {
    const card = deck[Math.floor(Math.random() * deck.length)]
    setActiveCard(card)
    card.action({ addLog }, player)
    setPlayers([...updated])
  }

  const payRent = (updated, player, tile) => {
    const owner = updated.find((p) => p.id === tile.owner)
    const rent = tile.rent || 50
    player.money -= rent
    owner.money += rent
    addLog(`${player.name} paid $${rent} rent to ${owner.name}`)
    setPlayers([...updated])
  }

  const buyProperty = (tile) => {
    setPlayers((prev) => {
      const updated = [...prev]
      const player = updated[currentPlayer]
      if (player.money >= tile.price) {
        player.money -= tile.price
        player.properties.push(tile.id)
        tile.owner = player.id
        addLog(`${player.name} bought ${tile.name} for $${tile.price}`)
      }
      return updated
    })
    setActiveTile(null)
  }

  const endTurn = () => {
    setCurrentPlayer((c) => (c + 1) % players.length)
  }

  return (
    <GameContext.Provider
      value={{
        players,
        currentPlayer,
        dice,
        rolling,
        rollDice,
        log,
        activeTile,
        setActiveTile,
        buyProperty,
        activeCard,
        setActiveCard,
        addLog,
        endTurn,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
