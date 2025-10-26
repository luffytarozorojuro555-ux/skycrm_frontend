import { useState, useEffect } from 'react';

export default function LeadTableWithSelection({ 
  leads, 
  onOpen, 
  onDelete, 
  hideAction, 
  statuses, 
  onStatusChange,
  showSelection = false,
  selectedLeads = [],
  onSelectionChange,
  onSelectAll
}) {
  // Sort leads by createdAt descending (newest first)
  const sortedLeads = [...(leads || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const isAllSelected = sortedLeads.length > 0 && selectedLeads.length === sortedLeads.length;
  const isIndeterminate = selectedLeads.length > 0 && selectedLeads.length < sortedLeads.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(sortedLeads.map(lead => lead._id));
    }
  };

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
    } else {
      onSelectionChange([...selectedLeads, leadId]);
    }
  };

  return (
    <div className="w-full">
      {showSelection && (
        <div className="mb-4 p-3  border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 b border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedLeads.length} selected)
                </span>
              </label>
            </div>
            {selectedLeads.length > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      )}
      
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left ">
            {showSelection && <th className="w-12 px-4 py-3">Select</th>}
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assigned To</th>
            <th className="px-4 py-3">Team</th>
            {!hideAction && <th className="px-4 py-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map(lead => (
            <tr 
              key={lead._id} 
              className={`border-b hover:bg-gray-50 text-gray-700 hover:text-black dark:text-gray-200 dark:hover:bg-gray-800 transition ${selectedLeads.includes(lead._id) ? 'bg-blue-50' : ''}`}
            >
              {showSelection && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-4 py-3 font-medium">{lead.name}</td>
              <td className="px-4 py-3">{lead.email || '-'}</td>
              <td className="px-4 py-3">{lead.phone}</td>
              <td className="px-4 py-3">{lead.city || '-'}</td>
              <td className="px-4 py-3">{lead.source || '-'}</td>
              <td className="px-4 py-3">
                {statuses ? (
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={lead.status?.name || ''}
                    onChange={e => onStatusChange && onStatusChange(lead._id, e.target.value)}
                  >
                    <option value="">Change status...</option>
                    {statuses.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {lead.status?.name || '-'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {lead.assignedTo ? (
                  <span className="text-green-600 font-medium">
                    {lead.assignedTo.name}
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3">
                {lead.teamId ? (
                  <span className="text-blue-600 font-medium">
                    {lead.teamId.name}
                  </span>
                ) : (
                  <span className="text-gray-500">No Team</span>
                )}
              </td>
              {!hideAction && (
                <td className="px-4 py-3">
                  <button 
                    className="text-blue-600 hover:text-blue-800 underline mr-3 text-xs" 
                    onClick={() => onOpen(lead)}
                  >
                    Open
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 underline text-xs" 
                    onClick={() => onDelete(lead._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedLeads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No leads found
        </div>
      )}
    </div>
  );
}
