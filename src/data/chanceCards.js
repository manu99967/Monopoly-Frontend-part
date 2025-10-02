const chanceCards = [
  {
    text: "Advance to GO. Collect $200.",
    action: ({ addLog }, player) => {
      player.position = 0
      player.money += 200
      addLog(`${player.name} advanced to GO and collected $200`)
    },
  },
  {
    text: "Go to Jail. Do not pass GO, do not collect $200.",
    action: ({ addLog }, player) => {
      player.position = 10
      player.inJail = true
      addLog(`${player.name} went to Jail`)
    },
  },
  {
    text: "Bank pays you dividend of $50.",
    action: ({ addLog }, player) => {
      player.money += 50
      addLog(`${player.name} received $50 dividend`)
    },
  },
  {
    text: "Pay poor tax of $15.",
    action: ({ addLog }, player) => {
      player.money -= 15
      addLog(`${player.name} paid poor tax of $15`)
    },
  },
  {
    text: "Your building loan matures. Collect $150.",
    action: ({ addLog }, player) => {
      player.money += 150
      addLog(`${player.name} collected $150 from loan maturity`)
    },
  },
]

export default chanceCards
