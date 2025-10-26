export default function LeadTable({ leads, onOpen, onDelete, hideAction, statuses, onStatusChange }) {

  const sortedLeads = [...(leads || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>City</th>
          <th>Source</th>
          <th>Status</th>
          {!hideAction && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {sortedLeads.map(lead => (
          <tr key={lead._id}>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.phone}</td>
            <td>{lead.city || '-'}</td>
            <td>{lead.source || '-'}</td>
            <td>
              {statuses ? (
                <select
                  className="border rounded px-2 py-1"
                  value={lead.status?.name || ''}
                  onChange={e => onStatusChange && onStatusChange(lead._id, e.target.value)}
                >
                  <option value="">Change status...</option>
                  {statuses.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                lead.status?.name || '-'
              )}
            </td>
            {!hideAction && (
              <td>
                <button className="text-blue-600 underline mr-2" onClick={() => onOpen(lead)}>Open</button>
                <button className="text-red-600 underline" onClick={() => onDelete(lead._id)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
