🏠 Monopoly Game

A modern web-based version of the classic Monopoly board game built with React (frontend) and Flask (backend).
This project simulates turn-based gameplay, allowing players to roll dice, move across tiles, buy properties, pay rent, and experience random events through Chance and Community Chest cards.

🧩 Table of Contents

Features

Tech Stack

Game Logic Overview

Installation

Running the App

Folder Structure

API Routes

Team Roles

Future Improvements

License

🎮 Features

✅ Turn-Based Gameplay – Players take turns rolling dice and moving around the board.
✅ Property Management – Players can buy, own, and pay rent on properties.
✅ Chance & Community Chest – Dynamic card effects like gaining or losing money, or going to jail.
✅ Jail & Skipped Turns – Players sent to jail must skip a turn before resuming.
✅ Bankruptcy Logic – Handles when a player runs out of money.
✅ Live Game Log – Real-time event updates displayed in the UI.
✅ Persistent State (Optional) – Game state can persist between refreshes.

🛠️ Tech Stack
Frontend

React.js

Context API for global game state management

Tailwind CSS for styling

Vite for development and bundling

Backend

Flask (Python)

SQLAlchemy ORM

Flask-CORS for frontend-backend communication

Database

SQLite (local database for storing game state, players, and tiles)

🧠 Game Logic Overview

The main game logic lives in the Flask backend, which handles:

Rolling dice (/roll-dice)

Moving the current player

Triggering tile actions (buy, rent, jail, chance, etc.)

Updating player balances

Switching turns

The React frontend displays all players, tiles, logs, dice rolls, and manages UI interactivity.

Turn alternation is synced between frontend and backend using the /game-state endpoint.

⚙️ Installation
1️⃣ Clone the Repository
git clone https://github.com/yourusername/monopoly-game.git
cd monopoly-game

2️⃣ Backend Setup
cd server
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
flask run

3️⃣ Frontend Setup
cd client
npm install
npm run dev


Your React app will now run on http://localhost:5173
,
and your Flask backend will run on http://localhost:5000
.

📁 Folder Structure
monopoly-game/
│
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameScreen.jsx
│   │   │   ├── PlayerCard.jsx
│   │   │   ├── Tile.jsx
│   │   │   ├── Dice.jsx
│   │   │   └── LogPanel.jsx
│   │   ├── context/
│   │   │   └── GameContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                   # Flask Backend
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── database.db
│   ├── __init__.py
│   └── requirements.txt
│
└── README.md

🔗 API Routes
Method	Endpoint	Description
GET	/game-state	Fetch current game state
POST	/start-game	Initialize a new game
POST	/roll-dice	Roll dice and move player
POST	/buy-property	Buy the current property
POST	/end-turn	End current player's turn
GET	/players	Get all player data
👥 Team Roles
Name	Role	Responsibilities
Maggie	🎯 Scrum Master / Game Logic Developer	Core game logic (turns, rent, jail, chance cards), backend state management
Julius	💻 Frontend Lead	UI components, layout, player display
Emmanuel	🧩 Backend Engineer	Flask API routes, database setup
🚀 Future Improvements

Add multiplayer mode (sockets or local hot-seat).

Animate player movement on the board.

Add full set of Chance & Community Chest cards.

Add trading between players.

Persistent save/load game feature.

📜 License

This project is licensed under the MIT License.
Feel free to use, modify, and share!
