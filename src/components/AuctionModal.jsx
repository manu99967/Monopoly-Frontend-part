// src/components/AuctionModal.jsx
export default function AuctionModal({ property, onClose, onBid }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Auction: {property?.name}</h2>
        <p className="mb-4">Start bidding for this property.</p>
        <div className="flex justify-between">
          <button 
            onClick={onBid}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Place Bid
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
