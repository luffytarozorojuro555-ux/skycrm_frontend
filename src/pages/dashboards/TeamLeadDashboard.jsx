import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TeamMemberPerformance from "../../components/TeamMemberPerformance";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";
import CustomDateRange from "../../components/CustomDateRange";

export default function TeamLeadDashboard() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [filter, setFilter] = useState("");
  const [timeRange, setTimeRange] = useState("Week");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Fetch team data including leads assigned to the team and team members
  const leadsQuery = useQuery({
    queryKey: ["leads", filter],
    queryFn: async () =>
      (await api.get("/leads", { params: filter ? { status: filter } : {} }))
        .data,
  });
  //console.log("leadsQuery", leadsQuery.data);

  const myTeamQuery = useQuery({
    queryKey: ["myTeam"],
    queryFn: async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.roleName === "Admin";
        const endpoint = "/team/my-team" + (isAdmin ? "?viewAll=true" : "");
        const response = await api.get(endpoint);
        return response.data;
      } catch (error) {
        console.error("Error fetching team data:", error);
        throw new Error(
          error.response?.data?.message || "Failed to fetch team data"
        );
      }
    },
    retry: 1,
  });

  // Fetch statuses for lead status filter dropdown and display
  const statusesQuery = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });

  // States for leads displayed and filtered
  //const [teamLeads, setTeamLeads] = useState([]);
  const teamLeads = useMemo(() => {
  const allLeads = Array.isArray(leadsQuery.data)
    ? leadsQuery.data
    : [];

  if (!myTeamQuery.data?._id) return [];

  return allLeads.filter(
    (lead) => lead.teamId?._id === myTeamQuery.data._id
  );
}, [leadsQuery.data, myTeamQuery.data]);
  const [displayedLeads, setDisplayedLeads] = useState([]);

  // Synchronize teamLeads from myTeamQuery data whenever it changes
  console.log("myTeamQuery", myTeamQuery.data);
  // useEffect(() => {
  //   if (leadsQuery.data && myTeamQuery.data?._id) {
  //     // Filter leads belonging to this team only
  //     const filteredLeads = leadsQuery.data.filter(
  //       (lead) => lead.teamId?._id === myTeamQuery.data._id
  //     );
  //     setTeamLeads(filteredLeads);
  //   } else {
  //     setTeamLeads([]);
  //   }
  // }, [leadsQuery.data, myTeamQuery.data]);

  //console.log("teamLeads", teamLeads);

  //grouping leads by assignedTo member
  const leadsGroupedByMember = useMemo(() => {
    if (!teamLeads || teamLeads.length === 0) return {};

    return teamLeads.reduce((acc, lead) => {
      const memberId = lead.assignedTo?._id || "unassigned";
      if (!acc[memberId]) acc[memberId] = [];
      acc[memberId].push(lead);
      return acc;
    }, {});
  }, [teamLeads]);

  //console.log("Grouped Leads:", leadsGroupedByMember);
  // Compute displayedLeads any time teamLeads, filter, or date range change
  useEffect(() => {
    // Filter by status if filter set
    let filteredLeads = filter
      ? teamLeads.filter((lead) => lead.status?.name === filter)
      : [...teamLeads];

    // If custom time range is selected, filter leads by date range
    if (timeRange === "Custom" && startDate && endDate) {
      const normalizeDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      };

      const start = normalizeDate(startDate);
      const end = normalizeDate(endDate);

      filteredLeads = filteredLeads.filter((lead) => {
        const leadDate = normalizeDate(lead.createdAt);
        return leadDate >= start && leadDate <= end;
      });
    }

    setDisplayedLeads(filteredLeads);
  }, [teamLeads, filter, timeRange, startDate, endDate]);

  // Mutation for deleting a lead
  const deleteLead = useMutation({
    mutationFn: async (id) => await api.delete(`/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myTeam"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead.mutate(id);
    }
  };

  // Mutation for updating lead status
  const statusMutation = useMutation({
    mutationFn: async (payload) =>
      (
        await api.post(`/leads/${payload.id}/status`, {
          statusName: payload.statusName,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myTeam"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  const onOpen = (lead) => nav(`/leads/${lead._id}`);

  // Derived statistics for team analytics and info display
  const totalMembers = myTeamQuery.data?.members?.length || 0;
  const assignedLeadsCount = teamLeads.length;
  const closedCount = teamLeads.filter((l) => {
    const name = l.status?.name || "";
    return ["Enrolled", "Closed", "Won", "Converted"].includes(name);
  }).length;
  const performancePercent = assignedLeadsCount
    ? Math.round((closedCount / assignedLeadsCount) * 100)
    : 0;

  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const filteredTeamLeads = teamLeads.filter((lead) => {
    const leadDate = normalizeDate(lead.createdAt);
    if (!leadDate) return false;

    const now = new Date();
    let cutoff;

    if (timeRange === "Day") {
      cutoff = normalizeDate(now);
    } else if (timeRange === "Week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "Year") {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "Custom" && startDate) {
      cutoff = new Date(startDate);
    } else {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Month default
    }

    const normalizedCutoff = normalizeDate(cutoff);
    const normalizedEndDate =
      timeRange === "Custom" && endDate
        ? normalizeDate(new Date(endDate))
        : normalizeDate(now);

    return leadDate >= normalizedCutoff && leadDate <= normalizedEndDate;
  });
  // console.log("Filtered Leads:", filteredTeamLeads);
  const totalFilteredLeads = filteredTeamLeads.length;
  const enrolledCount = filteredTeamLeads.filter(
    (l) => l.status?.name === "Enrolled"
  ).length;
  const newCount = filteredTeamLeads.filter(
    (l) => l.status?.name === "New"
  ).length;
  const notInterestedCount = filteredTeamLeads.filter(
    (l) => l.status?.name === "Not Interested"
  ).length;
  const processingCount =
    totalFilteredLeads - (enrolledCount + newCount + notInterestedCount);
  const remainingPct =
    totalFilteredLeads > 0
      ? Math.round((newCount / totalFilteredLeads) * 100)
      : 0;

  const statItems = [
    {
      key: "total",
      label: "Total Leads",
      value: totalFilteredLeads,
      color: "#111827",
    },
    { key: "new", label: "New", value: newCount, color: "#6366F1" },
    {
      key: "processing",
      label: "Processing",
      value: processingCount,
      color: "#F59E0B",
    },
    {
      key: "enrolled",
      label: "Enrolled (Success)",
      value: enrolledCount,
      color: "#22C55E",
    },
    {
      key: "not_interested",
      label: "Not Interested (Failed)",
      value: notInterestedCount,
      color: "#EF4444",
    },
  ];

  const handleLogoutClick = () => handleLogout(nav);

  return (
    <div className="min-h-screen  w-full p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Team Lead Dashboard
      </h1>
      <h2 style={{ color: "gray", fontWeight: "normal", fontSize: "1.2rem" }}>
        Team Analytics
      </h2>
      <aside
        className="no-scrollbar"
        style={{
          width: "100%",
          borderBottom: "1px solid #eee",
          padding: "12px 16px",
          display: "flex",
          gap: 16,
          overflowX: "auto",
          alignItems: "center",
        }}
      >
        {[
          { tab: "home", label: "Home", color: "#2563eb" },
          { tab: "team", label: "Team Members", color: "#10b981" },
          { tab: "data", label: "Data Table", color: "#f59e0b" },
          { tab: "follow-up", label: "Follow Up List", color: "#4709abff" },
          { tab: "logout", label: "Logout", color: "#dc2626" },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() =>
              btn.tab === "logout" ? handleLogoutClick() : setActiveTab(btn.tab)
            }
            style={{
              flexShrink: 0,
              minWidth: 140,
              fontWeight: activeTab === btn.tab ? "600" : "normal",
              color: btn.color,
              background: activeTab === btn.tab ? "#e0e7ef" : "transparent",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 8,
              padding: "8px 20px",
              transition: "background 0.2s",
              boxShadow:
                activeTab === btn.tab ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e0e7ef")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                activeTab === btn.tab ? "#e0e7ef" : "transparent")
            }
          >
            {btn.label}
          </button>
        ))}
      </aside>

      {/* ===== Main Content ===== */}
      <main style={{ flex: 1, padding: "15px" }}>
        {activeTab === "home" && (
          <>
            <Card title="Team Analytics Overview" className="mt-6">
              <div className="p-5">
                {/* Header */}
                <div className="col-span-full mb-4">
                  <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
                    <h2 className="text-base font-semibold">Lead Stats</h2>

                    <div className="flex items-center gap-2">
                      {/* Remaining Progress */}
                      <div className="flex items-center gap-2 border border-gray-600 rounded-lg px-2 py-1">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          className="-rotate-90"
                          aria-hidden
                        >
                          {(() => {
                            const r = 8;
                            const c = 2 * Math.PI * r;
                            const off = c * (1 - remainingPct / 100);
                            return (
                              <>
                                <circle
                                  cx="12"
                                  cy="12"
                                  r={r}
                                  stroke="#4b5563"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r={r}
                                  stroke="#22c55e"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={c}
                                  strokeDashoffset={off}
                                  strokeLinecap="round"
                                  className="transition-[stroke-dashoffset] duration-400 ease-in-out"
                                />
                              </>
                            );
                          })()}
                        </svg>
                        <div className="text-xs text-gray-700 dark:text-gray-200">
                          Remaining:{" "}
                          <span className="text-gray-50 font-semibold">
                            {remainingPct}%
                          </span>
                        </div>
                      </div>

                      {/* Time Range Buttons */}
                      <div className="flex gap-2 dark:bg-gray-700 p-1 border border-gray-600 rounded-lg">
                        {["Day", "Week", "Month", "Year", "Custom"].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setTimeRange(r);
                              if (r === "Custom") setShowCustomDateRange(true);
                            }}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 ${
                              timeRange === r
                                ? "bg-indigo-500 text-white border border-indigo-500 shadow-md"
                                : "dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-transparent hover:bg-gray-200"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statItems.map((s) => (
                      <div
                        key={s.key}
                        className="dark:bg-slate-700  bg-gray-300 border-slate-600 rounded-xl p-4 flex flex-col gap-2"
                      >
                        <div className="text-sm dark:text-gray-200 text-gray-700">{s.label}</div>
                        <div
                          className="font-bold text-2xl"
                          style={{ color: s.color }}
                        >
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <TeamMemberPerformance
                leadsGroupedByMember={leadsGroupedByMember}
                users={myTeamQuery?.data?.members || []}
              />
            </Card>
          </>
        )}

        {activeTab === "team" && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-full max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
              {myTeamQuery?.isLoading && (
                <p className="text-gray-500 dark:text-gray-300">
                  Loading team member data...
                </p>
              )}

              {myTeamQuery?.isError && (
                <p className="text-red-600 dark:text-red-400">
                  Failed to load team data:{" "}
                  {myTeamQuery?.error?.response?.data?.message || "Server Error"}
                </p>
              )}

              {myTeamQuery?.data && (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {myTeamQuery?.data?.name} Dashboard
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Manager: {myTeamQuery?.data?.manager?.name || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {totalMembers}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Total Members
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {assignedLeadsCount}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Assigned Leads
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {performancePercent}%
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Performance
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                      Team: {myTeamQuery?.data?.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Manager:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {myTeamQuery?.data?.manager?.name}
                      </span>{" "}
                      ({myTeamQuery?.data?.manager?.email})
                    </p>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Team Lead (You):{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {myTeamQuery?.data?.lead?.name}
                      </span>{" "}
                      ({myTeamQuery?.data?.lead?.email})
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md sm:text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1 mb-3">
                      Sales Representatives ({myTeamQuery?.data?.members?.length})
                    </h4>
                    <ul className="flex flex-col gap-3 ">
                      {myTeamQuery?.data?.members?.map((member) => (
                        <li
                          key={member?._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-sm"
                        >
                          <div>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">
                              {member?.name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-300 text-sm">
                              {member?.email}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {!myTeamQuery?.data &&
                !myTeamQuery?.isLoading &&
                !myTeamQuery?.isError && (
                  <p className="text-gray-500 dark:text-gray-300">
                    No team information available for this user.
                  </p>
                )}
            </div>
          </Card>
        )}

        {activeTab === "follow-up" && (
          <Card
            title="Follow-Up list"
            style={{ marginLeft: 0, paddingLeft: 0 }}
          >
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div
                style={{
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  border: "1px solid #eee",
                }}
              >
                {myTeamQuery.isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <LeadTable
                    leads={teamLeads.filter(
                      (lead) => lead.status?.name === "Follow-Up"
                    )}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={statusesQuery.data}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "data" && (
          <Card
            title="My Team's Leads"
            style={{ marginLeft: 0, paddingLeft: 0 }}
          >
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <select
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  minWidth: 140,
                  fontSize: 15,
                }}
              >
                <option value="">All Statuses</option>
                {statusesQuery.data?.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                style={{
                  padding: "10px 18px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
                }}
                onClick={() => {
                  qc.invalidateQueries({ queryKey: ["leads"] });
                  qc.invalidateQueries({ queryKey: ["myTeam"] });
                }}
              >
                Refresh
              </button>
            </div>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <div
                style={{
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  border: "1px solid #eee",
                }}
              >
                {myTeamQuery.isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <LeadTable
                    leads={displayedLeads}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={statusesQuery.data}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>
          </Card>
        )}
      </main>

      <CustomDateRange
        open={showCustomDateRange}
        onClose={() => setShowCustomDateRange(false)}
        onCustomRangeFetch={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
    </div>
  );
}
