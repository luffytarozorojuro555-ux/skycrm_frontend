import { useState, useEffect } from "react";
import api from "../services/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const AddTeamModal = ({ open, onClose, onTeamAdded, team = null }) => {
  const [name, setName] = useState(team?.name || "");
  const [selectedMembers, setSelectedMembers] = useState(
    team?.members.map((m) => m._id.toString()) || []
  );
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const qc = useQueryClient();

  useEffect(() => {
    if (team) {
      setName(team.name || "");
      setSelectedMembers(team.members.map((m) => m._id.toString()));
    } else {
      setName("");
      setSelectedMembers([]);
    }
  }, [team, open]);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const teamsRes = await api.get("/team");
        const usersRes = await api.get("/users");

        const teamsData = teamsRes.data;
        const usersData = usersRes.data;

        const membersInAllTeams = teamsData.flatMap((team) =>
          team.members.map((m) => m._id.toString())
        );

        const availableUsers = usersData.filter((user) => {
          const isInCurrentTeam = team?.members.some((m) => m._id === user._id);
          const isUnassigned =
            !membersInAllTeams.includes(user._id) &&
            user.roleName === "Sales Representatives" &&
            user.status !== "inactive";
          return isInCurrentTeam || isUnassigned;
        });

        setLeads(availableUsers);
      } catch (err) {
        setLeads([]);
      }
    };

    fetchUsers();
  }, [open, team]);

  const teamMutation = useMutation({
    mutationFn: async () => {
      if (team) {
        return await api.put(`/team/${team._id}`, {
          name,
          memberIds: selectedMembers,
        });
      } else {
        return await api.post("/team", { name, memberIds: selectedMembers });
      }
    },
    onSuccess: () => {
      setLoading(false);
      onTeamAdded();
      onClose();
      setName("");
      setSelectedMembers([]);
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (err) => {
      console.log(err);
      setLoading(false);
      if (err.response) {
        setError(err.response.data?.error || `Error ${err.response.status}`);
      } else {
        setError("Network error, please try again");
      }
    },
  });

  const handleMemberToggle = (id) => {
    setSelectedMembers((members) =>
      members.includes(id) ? members.filter((m) => m !== id) : [...members, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    teamMutation.mutate();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          {team ? "Edit Team" : "Add Team"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Team Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Team Members
            </label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {leads.length === 0 && (
                <div className="text-gray-500 text-sm">
                  No available members
                </div>
              )}
              {leads.map((lead) => (
                <label
                  key={lead._id}
                  className="flex items-center gap-2 mb-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(lead._id.toString())}
                    onChange={() => handleMemberToggle(lead._id.toString())}
                  />
                  <span className="text-sm">
                    {lead.name} ({lead.email})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setError("");
                onClose();
              }}
              className="px-3 py-1 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              {loading
                ? team
                  ? "Saving..."
                  : "Adding..."
                : team
                ? "Save"
                : "Add Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
