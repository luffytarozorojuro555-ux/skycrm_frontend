import React, { useState } from "react";
const AddTeamLeadModal = ({open, members, onClose, onTeamLeadSet }) => {
  if (!open) {
    return null;
  }
  const [selectedLead, setSelectedLead] = useState(null);
  const handleSave = () => {
    if (selectedLead) {
      onTeamLeadSet(selectedLead);
      onClose();
    } else {
      alert("Please select a team lead!");
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Select Team Lead</h2>
        <div className="space-y-2">
          {members?.map((member) => (
            <label key={member._id} className="flex items-center space-x-2">
              <input
                type="radio"
                name="teamLead"
                value={member._id}
                checked={selectedLead === member._id}
                onChange={() => setSelectedLead(member._id)}
              />
              <span>{member.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddTeamLeadModal;
