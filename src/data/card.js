export const chanceCards = [
  {
    id: 1,
    text: "Advance to Go (Collect $200)",
    action: (player) => ({ ...player, position: 0, money: player.money + 200 }),
  },
  {
    id: 2,
    text: "Go to Jail",
    action: (player) => ({ ...player, position: 10, inJail: true }),
  },
  // add more Chance cards here
];

export const communityChestCards = [
  {
    id: 1,
    text: "Bank error in your favor, collect $200",
    action: (player) => ({ ...player, money: player.money + 200 }),
  },
  {
    id: 2,
    text: "Pay hospital fees of $100",
    action: (player) => ({ ...player, money: player.money - 100 }),
  },
  // add more Community Chest cards here
];
