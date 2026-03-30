export default function LeadTable({
  leads,
  onOpen,
  onDelete,
  hideAction,
  statuses,
  onStatusChange,
  showDelete = false,
}) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeStatuses = Array.isArray(statuses) ? statuses : [];

  const sortedLeads = [...safeLeads].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <table className="min-w-[1000px] text-sm border-separate border-spacing-x-5 table-auto">
      <thead>
        <tr className="text-left">
          <th className="px-2 py-1">Name</th>
          <th className="px-2 py-1">Email</th>
          <th className="px-2 py-1">Phone</th>
          <th className="px-2 py-1">City</th>
          <th className="px-2 py-1">Source</th>
          <th className="px-2 py-1">Status</th>
          <th className="px-2 py-1">Assigned to</th>
          {!hideAction && <th className="px-2 py-1">Action</th>}
        </tr>
      </thead>

      <tbody>
        {sortedLeads.map((lead) => (
          <tr key={lead._id}>
            <td className="px-2 py-1">{lead.name}</td>
            <td className="px-2 py-1">{lead.email}</td>
            <td className="px-2 py-1">{lead.phone}</td>
            <td className="px-2 py-1">{lead.city || "-"}</td>
            <td className="px-2 py-1">{lead.source || "-"}</td>

            <td className="px-2 py-1">
              {safeStatuses.length > 0 ? (
                <select
                  className="border rounded px-2 py-1"
                  value={lead.status?.name || ""}
                  onChange={(e) =>
                    onStatusChange &&
                    onStatusChange(lead._id, e.target.value)
                  }
                >
                  <option value="">Change status...</option>
                  {safeStatuses.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                lead.status?.name || "-"
              )}
            </td>

            <td className="px-2 py-1">{lead?.assignedTo?.email ?? "Not assigned"}</td>

            {!hideAction && (
              <td className="whitespace-nowrap px-2 py-1">
                <button
                  className="text-blue-600 underline mr-2"
                  onClick={() =>
                    onOpen(lead, sortedLeads.map((l) => l._id))
                  }
                >
                  Open
                </button>

                {showDelete && (
                  <button
                    className="text-red-600 underline"
                    onClick={() => onDelete(lead._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
