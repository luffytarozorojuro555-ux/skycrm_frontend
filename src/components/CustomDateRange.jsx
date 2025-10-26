import React, { useState } from "react";
const CustomDateRange = ({open, onClose, onCustomRangeFetch }) => {
  if (!open) {
    return null;
  }
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    setLoading(true);
    onCustomRangeFetch(startDate, endDate);
    onClose();
  };
  const handleCancel = async () => {
    onClose();
    setStartDate(null);
    setEndDate(null);
    onCustomRangeFetch(startDate, endDate);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Select Custom Dates</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex flex-col">
            <label className="mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              className="border rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={today}
              disabled={!startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            style={{ backgroundColor: "#6366f1" }}
            className="text-white px-4 py-2 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            onClick={handleFetch}
            style={{ backgroundColor: "#6366f1" }}
            className="text-white px-4 py-2 rounded"
          >
            {loading ? "Fetching..." : "Fetch Data"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CustomDateRange;
