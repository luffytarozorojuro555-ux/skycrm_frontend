import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TeamMemberPerformance from "../../components/TeamMemberPerformance";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";
import CustomDateRange from "../../components/CustomDateRange";
import NotificationIcon from "../../components/NotificationIcon";

export default function TeamLeadDashboard() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [filter, setFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [timeRange, setTimeRange] = useState("Week");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [dataScope, setDataScope] = useState("mine");
  
  // Advanced date filtering for table
  const [tableDateFilter, setTableDateFilter] = useState("all");
  const [tableDateField, setTableDateField] = useState("assignedDate");
  const [tableDateCustomStart, setTableDateCustomStart] = useState("");
  const [tableDateCustomEnd, setTableDateCustomEnd] = useState("");

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [displayedLeads, setDisplayedLeads] = useState([]);

  const leadsQuery = useQuery({
    queryKey: ["leads", filter, page, limit, dataScope],
    queryFn: async () => {
      const response = await api.get("/leads", {
        params: {
          status: filter,
          limit,
          page,
          scope: dataScope,
        },
      });

      return Array.isArray(response.data?.leads) ? response.data.leads : [];
    },
  });

  const teamLeadsQuery = useQuery({
    queryKey: ["team-leads", timeRange, startDate, endDate],
    queryFn: async () => {
      const response = await api.get("/leads", {
        params: {
          scope: "team", 
          limit: 1000, 
        },
      });

      return Array.isArray(response.data?.leads) ? response.data.leads : [];
    },
  });

  const myTeamQuery = useQuery({
    queryKey: ["myTeam"],
    queryFn: async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.roleName === "Admin";
        const endpoint = "/team/my-team" + (isAdmin ? "?viewAll=true" : "");
        const response = await api.get(endpoint);
        console.log("my team query:", response.data);
        return response.data || {};
      } catch (error) {
        console.error("Error fetching team data:", error);
        throw new Error(
          error.response?.data?.message || "Failed to fetch team data",
        );
      }
    },
    retry: 1,
  });

  console.log("LEADS:", leadsQuery.data);

  const statusesQuery = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const res = await api.get("/statuses");

      console.log("STATUS API:", res.data); // 🔥 ADD THIS

      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.statuses)) return res.data.statuses;
      if (Array.isArray(res.data.data)) return res.data.data;

      return [];
    },
  });

  // Helper: Normalize dates for comparison (midnight UTC)
  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Helper: Get assigned date from lead
  // Assigned date = first history entry (when lead first assigned) or createdAt
  const getAssignedDate = (lead) => {
    if (lead.history && lead.history.length > 0) {
      return lead.history[0].at;
    }
    return lead.createdAt;
  };

  // Helper: Get modified date from lead
  // Modified date = last history entry (most recent status change) or updatedAt
  const getModifiedDate = (lead) => {
    if (lead.history && lead.history.length > 0) {
      return lead.history[lead.history.length - 1].at;
    }
    return lead.updatedAt || lead.createdAt;
  };

  // Helper: Get date field from lead based on filter selection
  const getLeadDateField = (lead) => {
    if (tableDateField === "assignedDate") {
      return getAssignedDate(lead);
    } else if (tableDateField === "statusUpdatedDate") {
      return getModifiedDate(lead);
    }
    return lead.createdAt;
  };

  // Helper: Apply date filter for table
  const applyDateFilter = (lead) => {
    if (tableDateFilter === "all") return true;
    
    const leadDate = normalizeDate(getLeadDateField(lead));
    if (!leadDate) return false;
    
    const now = new Date();
    const normalizedNow = normalizeDate(now);
    
    switch (tableDateFilter) {
      case "today":
        return leadDate.getTime() === normalizedNow.getTime();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const normalizedWeekAgo = normalizeDate(weekAgo);
        return leadDate >= normalizedWeekAgo && leadDate <= normalizedNow;
      case "month":
        return leadDate.getMonth() === normalizedNow.getMonth() &&
               leadDate.getFullYear() === normalizedNow.getFullYear();
      case "year":
        return leadDate.getFullYear() === normalizedNow.getFullYear();
      case "custom":
        if (!tableDateCustomStart) return false;
        const customDate = normalizeDate(tableDateCustomStart);
        return leadDate.getTime() === customDate.getTime();
      case "between":
        if (!tableDateCustomStart || !tableDateCustomEnd) return false;
        const startD = normalizeDate(tableDateCustomStart);
        const endD = normalizeDate(tableDateCustomEnd);
        return leadDate >= startD && leadDate <= endD;
      default:
        return true;
    }
  };

  const leads = Array.isArray(leadsQuery.data) ? leadsQuery.data : [];
  const leadsGroupedByMember = useMemo(() => {
    if (!leads.length) return {};

    return leads.reduce((acc, lead) => {
      const memberId = lead.assignedTo?._id || "unassigned";
      if (!acc[memberId]) acc[memberId] = [];
      acc[memberId].push(lead);
      return acc;
    }, {});
  }, [leads]);

  //console.log("Grouped Leads:", leadsGroupedByMember);
  // Compute displayedLeads with date filtering and search for table view
  useEffect(() => {
    let filteredLeads = [...leads];
    
    // Apply date filter
    filteredLeads = filteredLeads.filter(applyDateFilter);
    
    // Apply search filter
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filteredLeads = filteredLeads.filter((l) => {
        const name = (l.name || l.title || "").toString().toLowerCase();
        const phone = (l.phone || "").toString().toLowerCase();
        const email = (l.email || "").toString().toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q);
      });
    }
    
    setDisplayedLeads(filteredLeads);
  }, [leads, tableDateFilter, tableDateField, tableDateCustomStart, tableDateCustomEnd, searchFilter]);

  const tableLeads = displayedLeads;
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
  const assignedLeadsCount = leads.length;

  const closedCount = leads.filter((l) => {
    const name = l.status?.name || "";
    return ["Enrolled", "Closed", "Won", "Converted"].includes(name);
  }).length;
  const performancePercent = assignedLeadsCount
    ? Math.round((closedCount / assignedLeadsCount) * 100)
    : 0;

  const totalLeads = Array.isArray(teamLeadsQuery.data)
  ? teamLeadsQuery.data
  : [];

  const filteredleads = totalLeads.filter((lead) => {
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
  // console.log("Filtered Leads:", filteredleads);
  const totalFilteredLeads = filteredleads.length;
  const enrolledCount = filteredleads.filter(
    (l) => l.status?.name === "Enrolled",
  ).length;
  const newCount = filteredleads.filter((l) => l.status?.name === "New").length;
  const notInterestedCount = filteredleads.filter(
    (l) => l.status?.name === "Not Interested",
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
                        <div className="text-sm dark:text-gray-200 text-gray-700">
                          {s.label}
                        </div>
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
                leadsGroupedByMember={leadsGroupedByMember || {}}
                users={
                  Array.isArray(myTeamQuery?.data?.members)
                    ? myTeamQuery.data.members
                    : []
                }
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
                  {myTeamQuery?.error?.response?.data?.message ||
                    "Server Error"}
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
                      Sales Representatives (
                      {myTeamQuery?.data?.members?.length})
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
                    leads={leads.filter(
                      (lead) => lead.status?.name === "Follow-Up",
                    )}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={
                      Array.isArray(statusesQuery.data)
                        ? statusesQuery.data
                        : []
                    }
                    onStatusChange={handleStatusChange}
                    showDelete={false}
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
            {/* Filters Section */}
            <div style={{ marginBottom: 24, padding: "0 20px" }}>
              {/* Row 1: Status & Date Field Filters */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {/* Status Filter */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                    Filter by Status
                  </label>
                  <select
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "2px solid #ddd",
                      minWidth: 150,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: filter ? "#eef2ff" : "#fff",
                      borderColor: filter ? "#6366f1" : "#ddd",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">All Statuses</option>
                    {(Array.isArray(statusesQuery.data)
                      ? statusesQuery.data
                      : []
                    ).map((s, i) => (
                      <option key={i} value={s.name || s.statusName}>
                        {s.name || s.statusName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Field Type Selector */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                    Filter by Which Date?
                  </label>
                  <select
                    onChange={(e) => setTableDateField(e.target.value)}
                    value={tableDateField}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "2px solid #ddd",
                      minWidth: 180,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: "#f0f9ff",
                      borderColor: "#0284c7",
                      cursor: "pointer",
                    }}
                  >
                    <option value="assignedDate">Assigned Date (First Assigned)</option>
                    <option value="statusUpdatedDate">Status Modified Date (Latest Change)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date Range Filters & Custom Inputs */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Date Range Buttons */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                    Date Range
                  </label>
                  <div style={{ display: "flex", gap: 6, background: "#f9fafb", padding: 6, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    {[
                      { value: "all", label: "All" },
                      { value: "today", label: "Today" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                      { value: "custom", label: "Custom" },
                      { value: "between", label: "Range" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTableDateFilter(opt.value)}
                        title={opt.value === "custom" ? "Pick a specific date" : opt.value === "between" ? "Pick a date range" : `Filter by ${opt.label}`}
                        style={{
                          padding: "6px 12px",
                          border: tableDateFilter === opt.value ? "2px solid #6366f1" : "1px solid #d1d5db",
                          background: tableDateFilter === opt.value ? "#6366f1" : "#ffffff",
                          color: tableDateFilter === opt.value ? "#ffffff" : "#374151",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: tableDateFilter === opt.value ? "600" : "500",
                          transition: "all 0.2s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Inputs */}
                {(tableDateFilter === "custom" || tableDateFilter === "between") && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                        {tableDateFilter === "between" ? "Start Date" : "Date"}
                      </label>
                      <input
                        type="date"
                        value={tableDateCustomStart}
                        onChange={(e) => setTableDateCustomStart(e.target.value)}
                        max={tableDateCustomEnd}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "2px solid #ddd",
                          fontSize: 14,
                          borderColor: tableDateCustomStart ? "#10b981" : "#ddd",
                        }}
                      />
                    </div>
                    {tableDateFilter === "between" && (
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={tableDateCustomEnd}
                          onChange={(e) => setTableDateCustomEnd(e.target.value)}
                          min={tableDateCustomStart}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "2px solid #ddd",
                            fontSize: 14,
                            borderColor: tableDateCustomEnd ? "#10b981" : "#ddd",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Search Input */}
                <div style={{ display: "flex", alignItems: "flex-end", flex: 1, minWidth: 200 }}>
                  <div style={{ width: "100%" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name, phone, email..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "2px solid #ddd",
                        width: "100%",
                        fontSize: 14,
                        borderColor: searchFilter ? "#3b82f6" : "#ddd",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(filter || tableDateFilter !== "all" || searchFilter) && (
                <div style={{ marginTop: 12, padding: 10, backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7", borderRadius: 4 }}>
                  <span style={{ fontSize: 13, color: "#0369a1" }}>
                    <strong>Active filters:</strong>{" "}
                    {filter && <span className="badge">Status: {filter}</span>}
                    {" "}
                    {tableDateFilter !== "all" && <span className="badge">Date: {tableDateFilter}</span>}
                    {" "}
                    {searchFilter && <span className="badge">Search: "{searchFilter}"</span>}
                  </span>
                </div>
              )}

              {/* Data Scope Toggle (My Data / All Data) */}
              <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
                  View:
                </label>
                <div
                  style={{
                    display: "flex",
                    border: "2px solid #ddd",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setDataScope("mine")}
                    style={{
                      padding: "6px 16px",
                      background:
                        dataScope === "mine" ? "#2563eb" : "transparent",
                      color: dataScope === "mine" ? "#fff" : "#333",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: dataScope === "mine" ? "600" : "500",
                      fontSize: 14,
                    }}
                  >
                    My Leads
                  </button>

                  <button
                    onClick={() => setDataScope("team")}
                    style={{
                      padding: "6px 16px",
                      background:
                        dataScope === "team" ? "#2563eb" : "transparent",
                      color: dataScope === "team" ? "#fff" : "#333",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: dataScope === "team" ? "600" : "500",
                      fontSize: 14,
                    }}
                  >
                    Team Leads
                  </button>
                </div>

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-2 border rounded-md"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
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
                    leads={Array.isArray(tableLeads) ? tableLeads : []}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={statusesQuery.data}
                    onStatusChange={handleStatusChange}
                    showDelete={false}
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
