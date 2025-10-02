// src/components/LogPanel.jsx
export default function LogPanel({ logs }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-48 overflow-y-auto">
      <h2 className="text-lg font-bold mb-2">Game Log</h2>
      <ul className="space-y-1 text-sm">
        {logs && logs.length > 0 ? (
          logs.map((log, i) => <li key={i}>• {log}</li>)
        ) : (
          <li className="text-gray-500">No actions yet...</li>
        )}
      </ul>
    </div>
  );
}
