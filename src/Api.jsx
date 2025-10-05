const API_BASE_URL = "http://127.0.0.1:5555";

export const getPlayers = async () => {
  const res = await fetch(`${API_BASE_URL}/players`);
  return res.json();
};

export const movePlayer = async (playerId, steps) => {
  const res = await fetch(`${API_BASE_URL}/move_player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, steps }),
  });
  return res.json();
};

export const buyProperty = async (playerId, propertyName) => {
  const res = await fetch(`${API_BASE_URL}/buy_property`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, property_name: propertyName }),
  });
  return res.json();
};

export const payRent = async (playerId, propertyName) => {
  const res = await fetch(`${API_BASE_URL}/pay_rent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, property_name: propertyName }),
  });
  return res.json();
};
