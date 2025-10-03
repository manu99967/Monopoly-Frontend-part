# 🎲 Monopoly Game Frontend

A fully interactive Monopoly board game built with React, featuring a complete game experience with property trading, chance cards, and multiplayer support.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Game Features

- **Interactive Board**: Classic Monopoly board with 40 tiles
- **2-Player Support**: Turn-based gameplay for two players
- **Property System**: Buy, own, and collect rent on properties
- **Chance & Community Chest**: Random event cards with various effects
- **Jail System**: Players can be sent to jail and skip turns
- **Bankruptcy Detection**: Automatic game over when players run out of money
- **Real-time Game Log**: Track all game events and transactions

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Navigation between screens
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Board.jsx       # Game board display
│   ├── Dice.jsx        # Dice rolling component
│   ├── PlayerInfo.jsx  # Player stats display
│   ├── BuyModal.jsx    # Property purchase modal
│   ├── CardModal.jsx   # Chance/Community Chest cards
│   └── WinModal.jsx    # Game over screen
├── screens/            # Main application screens
│   ├── HomeScreen.jsx  # Welcome/start screen
│   └── GameScreen.jsx  # Main game interface
├── context/            # React context for state management
│   └── GameContext.jsx # Global game state
├── data/               # Game data and configuration
│   ├── boardData.js    # Board tiles and properties
│   ├── chanceCards.js  # Chance card definitions
│   └── communityChestCards.js # Community Chest cards
└── assets/             # Images and static files
```

## 🎯 How to Play

1. **Start**: Click "Start Game" on the home screen
2. **Roll Dice**: Click the dice to move around the board
3. **Buy Properties**: Purchase unowned properties you land on
4. **Pay Rent**: Pay rent when landing on opponent's properties
5. **Draw Cards**: Follow instructions on Chance/Community Chest cards
6. **Win**: Last player with money wins!

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Game Components

- **Board**: 40-tile Monopoly board with properties, special tiles, and player tokens
- **Player Management**: Track money, properties, and position for each player
- **Property Trading**: Buy/sell system with rent collection
- **Event Cards**: Chance and Community Chest cards with various effects
- **Game Logic**: Turn management, bankruptcy detection, and win conditions