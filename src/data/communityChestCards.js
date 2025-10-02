const communityChestCards = [
  {
    text: "Advance to GO. Collect $200.",
    community: true,
    action: ({ addLog }, player) => {
      player.position = 0
      player.money += 200
      addLog(`${player.name} advanced to GO and collected $200`)
    },
  },
  {
    text: "Bank error in your favor. Collect $200.",
    community: true,
    action: ({ addLog }, player) => {
      player.money += 200
      addLog(`${player.name} received $200 from bank error`)
    },
  },
  {
    text: "Doctor's fees. Pay $50.",
    community: true,
    action: ({ addLog }, player) => {
      player.money -= 50
      addLog(`${player.name} paid doctor’s fees of $50`)
    },
  },
  {
    text: "From sale of stock you get $50.",
    community: true,
    action: ({ addLog }, player) => {
      player.money += 50
      addLog(`${player.name} got $50 from stock sale`)
    },
  },
  {
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    community: true,
    action: ({ addLog }, player) => {
      player.position = 10
      player.inJail = true
      addLog(`${player.name} was sent to Jail`)
    },
  },
]

export default communityChestCards
