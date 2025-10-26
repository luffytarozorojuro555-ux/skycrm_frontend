import { useState } from 'react';

export default function TeamSelectionModal({ 
  isOpen, 
  onClose, 
  teams, 
  selectedLeadIds, 
  onAssignToTeam,
  isLoading = false 
}) {
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Please select a team');
      return;
    }
    onAssignToTeam(selectedTeamId);
  };

  const handleClose = () => {
    setSelectedTeamId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Leads to Team
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select a team to assign {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name} ({team.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          {selectedTeamId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Assignment Preview:</h4>
              {(() => {
                const selectedTeam = teams.find(t => t._id === selectedTeamId);
                const teamMembers = selectedTeam?.members || [];
                const leadCount = selectedLeadIds.length;
                const memberCount = teamMembers.length;
                
                if (memberCount === 0) {
                  return (
                    <p className="text-sm text-red-600">
                      This team has no members. Please add members to the team first.
                    </p>
                  );
                }
                
                const baseLeadsPerMember = Math.floor(leadCount / memberCount);
                const extraLeads = leadCount % memberCount;
                
                return (
                  <div className="text-sm text-blue-800">
                    <p>Leads will be distributed as follows:</p>
                    <ul className="mt-1 ml-4 list-disc">
                      {teamMembers.map((member, index) => {
                        const leadsForThisMember = baseLeadsPerMember + (index < extraLeads ? 1 : 0);
                        return (
                          <li key={member._id}>
                            {member.name}: {leadsForThisMember} lead{leadsForThisMember !== 1 ? 's' : ''}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedTeamId}
            >
              {isLoading ? 'Assigning...' : 'Assign Leads'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
