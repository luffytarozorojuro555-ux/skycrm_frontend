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
  const [isEditing, setIsEditing] = useState(false);
  const [customAssignments, setCustomAssignments] = useState({});
  const [savedCustomAssignments, setSavedCustomAssignments] = useState({});
  const [validationError, setValidationError] = useState('');

  // Get team members for selected team
  const getTeamMembers = () => {
    if (!selectedTeamId) return [];
    const team = teams.find(t => t._id === selectedTeamId);
    return team?.members || [];
  };

  // Calculate total from custom assignments
  const calculateTotal = (assignments) => {
    return Object.values(assignments).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
  };

  // Start editing custom distribution
  const handleEditDistribution = () => {
    const teamMembers = getTeamMembers();
    const leadCount = selectedLeadIds.length;
    const memberCount = teamMembers.length;

    // Initialize with equal distribution as default
    const initialAssignments = {};
    const baseLeadsPerMember = Math.floor(leadCount / memberCount);
    const extraLeads = leadCount % memberCount;

    teamMembers.forEach((member, index) => {
      const leadsForThisMember = baseLeadsPerMember + (index < extraLeads ? 1 : 0);
      initialAssignments[member._id] = leadsForThisMember;
    });

    setCustomAssignments(initialAssignments);
    setIsEditing(true);
    setValidationError('');
  };

  // Update single member assignment
  const handleAssignmentChange = (memberId, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return; // Prevent negative values

    setCustomAssignments(prev => ({
      ...prev,
      [memberId]: numValue
    }));
    setValidationError('');
  };

  // Save custom distribution
  const handleSaveDistribution = () => {
    const totalAssigned = calculateTotal(customAssignments);
    const totalLeads = selectedLeadIds.length;

    if (totalAssigned !== totalLeads) {
      setValidationError(
        `Total assigned leads (${totalAssigned}) must equal number of selected leads (${totalLeads})`
      );
      return;
    }

    console.log("Custom distribution saved", {
      selectedTeamId,
      totalLeads: selectedLeadIds.length,
      customAssignments,
      totalAssigned
    });

    // Save custom assignments for this team
    setSavedCustomAssignments(prev => ({
      ...prev,
      [selectedTeamId]: { ...customAssignments }
    }));

    setIsEditing(false);
    setValidationError('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setCustomAssignments({});
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Please select a team');
      return;
    }

    const teamMembers = getTeamMembers();

    // Check if custom distribution is saved for this team
    if (savedCustomAssignments[selectedTeamId]) {
      console.log("Using custom distribution", {
        selectedTeamId,
        customAssignments: savedCustomAssignments[selectedTeamId]
      });

      // Prepare assignments array with all members (including 0 counts)
      const assignments = teamMembers.map(member => ({
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        count: savedCustomAssignments[selectedTeamId][member._id] || 0
      }));

      onAssignToTeam(selectedTeamId, assignments);
    } else {
      console.log("Using equal distribution (no custom distribution saved)");
      // Use equal distribution (existing logic will handle it)
      onAssignToTeam(selectedTeamId);
    }
  };

  const handleClose = () => {
    setSelectedTeamId('');
    setIsEditing(false);
    setCustomAssignments({});
    setValidationError('');
    onClose();
  };

  if (!isOpen) return null;

  const teamMembers = getTeamMembers();
  const leadCount = selectedLeadIds.length;
  const totalAssigned = calculateTotal(customAssignments);
  const isDistributionValid = totalAssigned === leadCount;
  const hasCustomSaved = !!savedCustomAssignments[selectedTeamId];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Leads to Team
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select a team to assign {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''}
            {hasCustomSaved && <span className="ml-2 text-green-600 font-medium">✓ Custom distribution saved</span>}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setIsEditing(false);
                setCustomAssignments({});
                setValidationError('');
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isEditing}
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name} ({team.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          {selectedTeamId && teamMembers.length > 0 && !isEditing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                {hasCustomSaved ? 'Custom Distribution Saved:' : 'Equal Distribution Preview:'}
              </h4>
              {(() => {
                if (hasCustomSaved) {
                  // Show saved custom distribution
                  return (
                    <div className="text-sm text-blue-800">
                      <ul className="mt-1 ml-4 list-disc">
                        {teamMembers.map((member) => {
                          const count = savedCustomAssignments[selectedTeamId][member._id] || 0;
                          const percentage = ((count / leadCount) * 100).toFixed(1);
                          return (
                            <li key={member._id}>
                              {member.name}: {count} lead{count !== 1 ? 's' : ''} ({percentage}%)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                } else {
                  // Show equal distribution preview
                  const baseLeadsPerMember = Math.floor(leadCount / teamMembers.length);
                  const extraLeads = leadCount % teamMembers.length;

                  return (
                    <div className="text-sm text-blue-800">
                      <p>Leads will be distributed equally as follows:</p>
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
                }
              })()}
            </div>
          )}

          {selectedTeamId && teamMembers.length > 0 && isEditing && (
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Member Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Lead Count</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => {
                      const count = customAssignments[member._id] || 0;
                      const percentage = leadCount > 0 ? ((count / leadCount) * 100).toFixed(1) : 0;

                      return (
                        <tr key={member._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">{member.name}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{member.email}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={customAssignments[member._id] || 0}
                              onChange={(e) => handleAssignmentChange(member._id, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Row */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-4">
                <div className="text-sm font-medium text-gray-700">
                  Total: <span className={isDistributionValid ? 'text-green-600' : 'text-red-600'}>{totalAssigned}</span> / {leadCount}
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-600 font-medium">{validationError}</p>
                </div>
              )}
            </div>
          )}

          {selectedTeamId && teamMembers.length === 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              This team has no members. Please add members to the team first.
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading || isEditing}
            >
              Cancel
            </button>

            {selectedTeamId && teamMembers.length > 0 && !isEditing && (
              <button
                type="button"
                onClick={handleEditDistribution}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isLoading}
              >
                Edit Distribution
              </button>
            )}

            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isLoading}
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  onClick={handleSaveDistribution}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !isDistributionValid}
                >
                  {isDistributionValid ? 'Save Distribution' : `Save (${totalAssigned}/${leadCount})`}
                </button>
              </>
            )}

            {!isEditing && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !selectedTeamId || teamMembers.length === 0}
              >
                {isLoading ? 'Assigning...' : 'Assign Leads'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
