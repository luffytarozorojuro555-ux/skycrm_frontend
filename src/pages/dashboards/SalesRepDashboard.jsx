import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";
import NotificationIcon from "../../components/NotificationIcon";
import socket from "../../socket";
import CustomDateRange from "../../components/CustomDateRange";
import { getUserFromToken } from "../../utils/auth";

export default function SalesRepDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Advanced date filtering for table
  const [tableDateFilter, setTableDateFilter] = useState("all");
  const [tableDateField, setTableDateField] = useState("assignedDate");
  const [tableDateCustomStart, setTableDateCustomStart] = useState("");
  const [tableDateCustomEnd, setTableDateCustomEnd] = useState("");

  // State for analytics time range
  const [timeRange, setTimeRange] = useState("Week");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const dropdownRef = useRef(null);

  const user = getUserFromToken();

  const [liveNotifications, setLiveNotifications] = useState([]);

  const { data: dbNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
  });
  const allNotifications = [
    ...liveNotifications,
    ...(dbNotifications || []).filter(
      (db) => !liveNotifications.some((l) => l.message === db.message),
    ),
  ];

  useEffect(() => {
    const user = getUserFromToken();

    if (user?.userId) {
      socket.emit("register", user.userId);
    }
  }, []);

  useEffect(() => {
    const handler = (data) => {
      console.log("🔥 Incoming notification:", data);
      setLiveNotifications((prev) => [data, ...prev]);
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, []);

  // Fetch only my leads (assigned to current user)
  const myleads = useQuery({
    queryKey: ["leads", "assignedTo", user?.userId],
    queryFn: async () => {
      const res = await api.get("/leads?assignedTo=me");
      return res.data.leads;
    },
    enabled: !!user?.userId,
    refetchOnWindowFocus: true,
  });
  // (removed global leads query) - this dashboard uses only 'my leads'
  const statuses = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });
  const statusMutation = useMutation({
    mutationFn: async (payload) =>
      (
        await api.post(`/leads/${payload.id}/status`, {
          statusName: payload.statusName,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", "assignedTo", "me"] });
    },
  });
  const onOpen = (lead, leadIds) => {
    navigate(`/leads/${lead._id}`, {
      state: { leadIds },
    });
  };
  const handleDelete = () => {};
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

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

  // Helper: Apply date filter
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

  // derive displayed leads from the `myleads` query and all filters
  const displayedLeads = useMemo(() => {
    let allLeads = Array.isArray(myleads.data) ? myleads.data : [];
    
    // Apply text search filter
    if (filter) {
      const q = filter.toLowerCase();
      allLeads = allLeads.filter((l) => {
        const name = (l.name || l.title || "").toString().toLowerCase();
        return name.includes(q);
      });
    }
    
    // Apply date filter for table
    allLeads = allLeads.filter(applyDateFilter);
    
    return allLeads;
  }, [myleads.data, filter, tableDateFilter, tableDateField, tableDateCustomStart, tableDateCustomEnd]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredLeads = useMemo(() => {
    const allLeads = Array.isArray(myleads.data) ? myleads.data : [];
    return allLeads.filter((lead) => {
      const getLeadDate = (lead) => {
        return lead.updatedAt || lead.createdAt;
      };

      const leadDate = normalizeDate(getLeadDate(lead));
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
        // Default to Month
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const normalizedCutoff = normalizeDate(cutoff);
      const normalizedEndDate =
        timeRange === "Custom" && endDate
          ? normalizeDate(new Date(endDate))
          : normalizeDate(now);

      return leadDate >= normalizedCutoff && leadDate <= normalizedEndDate;
    });
  }, [myleads.data, timeRange, startDate, endDate]);

  // Analytics calculations based on filtered leads
  const totalFilteredLeads = filteredLeads.length;
  const enrolledCount = filteredLeads.filter(
    (l) => l.status?.name === "Enrolled",
  ).length;
  const newCount = filteredLeads.filter((l) => l.status?.name === "New").length;
  const notInterestedCount = filteredLeads.filter(
    (l) => l.status?.name === "Not Interested",
  ).length;
  const processingCount =
    totalFilteredLeads - (enrolledCount + newCount + notInterestedCount);
  const remainingPct =
    totalFilteredLeads > 0
      ? Math.round((newCount / totalFilteredLeads) * 100)
      : 0;

  const handleReportClick = (type) => {
    const now = new Date();
    let start, end;

    if (type === "today") {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date();
    } else if (type === "week") {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = new Date();
    } else if (type === "15days") {
      start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      end = new Date();
    } else if (type === "month") {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = new Date();
    } else if (type === "3month") {
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      end = new Date();
    } else if (type === "custom") {
      start = new Date(customDates.start);
      end = new Date(customDates.end);
    }

    setStartDate(start);
    setEndDate(end);
    setTimeRange("Custom");
    setShowOptions(false);
  };

  const statItems = [
    {
      key: "total",
      label: "Total Leads",
      value: totalFilteredLeads,
      color: "#f9fafb",
    },
    { key: "new", label: "New", value: newCount, color: "#818cf8" },
    {
      key: "processing",
      label: "Processing",
      value: processingCount,
      color: "#fcd34d",
    },
    {
      key: "enrolled",
      label: "Enrolled (Success)",
      value: enrolledCount,
      color: "#4ade80",
    },
    {
      key: "not_interested",
      label: "Not Interested (Failed)",
      value: notInterestedCount,
      color: "#f87171",
    },
  ];

  const hasUnread = dbNotifications?.some((n) => !n.isRead);

  return (
    <div className="min-h-screen w-full p-6 overflow-x-hidden bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Sales Representatives Dashboard
          </h1>
          <h2 className="text-gray-500 dark:text-gray-300 text-lg font-normal">
            Sales Representatives Analytics
          </h2>
        </div>
        <div className="px-16">
          <NotificationIcon
            hasNotification={hasUnread}
            notifications={allNotifications}
          />
        </div>
      </div>

      {/* ---- Horizontal tab buttons ---- */}
      <aside
        className="
      w-full border-b border-gray-200 dark:border-gray-600 px-2 sm:px-4 py-2
      flex gap-3 sm:gap-4 items-center overflow-x-auto no-scrollbar
    "
      >
        {[
          {
            tab: "home",
            label: "Home",
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            tab: "data",
            label: "Data",
            color: "text-yellow-500 dark:text-yellow-400",
          },
          // {
          //   tab: "logout",
          //   label: "Logout",
          //   color: "text-red-600 dark:text-red-400",
          // },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() =>
              btn.tab === "logout"
                ? handleLogout(navigate)
                : setActiveTab(btn.tab)
            }
            className={`
          text-xs sm:text-sm md:text-base
          px-3 sm:px-4 py-2
          rounded-md font-medium whitespace-nowrap min-w-[160px] sm:min-w-[220px]
          flex-shrink-0
          ${btn.color}
          ${
            activeTab === btn.tab
              ? "bg-gray-200 dark:bg-gray-600 font-semibold shadow"
              : "hover:bg-gray-100 dark:hover:bg-gray-500"
          }
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
        `}
          >
            {btn.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-0 mt-4">
        {activeTab === "home" && (
          <Card
            title="My Analytics Overview"
            className="mt-6  dark:bg-gray-800 text-white"
          >
            <div className="p-5">
              <div className="mb-4 col-span-full">
                {/* Header Row */}
                <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
                  <h2 className="text-lg font-semibold">Lead Stats</h2>

                  <div className="flex items-center gap-3">
                    {/* Remaining Progress */}
                    <div className="flex items-center gap-2 border border-gray-600 rounded-lg px-2 py-1.5">
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
                          return [
                            <circle
                              key="bg"
                              cx="12"
                              cy="12"
                              r={r}
                              stroke="#4b5563"
                              strokeWidth="4"
                              fill="none"
                            />,
                            <circle
                              key="progress"
                              cx="12"
                              cy="12"
                              r={r}
                              stroke="#22c55e"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={c}
                              strokeDashoffset={off}
                              strokeLinecap="round"
                              style={{
                                transition: "stroke-dashoffset 400ms ease",
                              }}
                            />,
                          ];
                        })()}
                      </svg>
                      <div className="text-xs text-gray-700 dark:text-gray-200">
                        Remaining:{" "}
                        <span className="text-gray-80 font-semibold">
                          {remainingPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Time Range Buttons */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowOptions((prev) => !prev)}
                      className="px-3 py-1.5 rounded-md text-white"
                    >
                      Data
                    </button>

                    {showOptions && (
                      <div className="absolute top-full right-0 bg-white border shadow-md p-2 z-50 w-48">
                        {[
                          ["today", "Today"],
                          ["week", "1 Week"],
                          ["15days", "15 Days"],
                          ["month", "1 Month"],
                          ["3month", "3 Months"],
                        ].map(([key, label]) => (
                          <div
                            key={key}
                            onClick={() => handleReportClick(key)}
                            className="cursor-pointer px-2 py-1 hover:bg-gray-100"
                          >
                            {label}
                          </div>
                        ))}

                        <div className="border-t mt-2 pt-2">
                          <input
                            type="date"
                            value={customDates.start}
                            onChange={(e) =>
                              setCustomDates((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                            className="w-full mb-1 border px-2 py-1"
                          />
                          <input
                            type="date"
                            value={customDates.end}
                            onChange={(e) =>
                              setCustomDates((prev) => ({
                                ...prev,
                                end: e.target.value,
                              }))
                            }
                            className="w-full mb-2 border px-2 py-1"
                          />

                          <button
                            onClick={() => handleReportClick("custom")}
                            className="w-full bg-green-600 text-white py-1"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statItems.map((s) => (
                      <div
                        key={s.key}
                        className="dark:bg-slate-700 border bg-gray-300 dark:text-white text-black border-slate-600 rounded-xl p-4 flex flex-col gap-2"
                      >
                        <div className="text-sm text-gray-800">{s.label}</div>
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
            </div>
          </Card>
        )}

        {activeTab === "data" && (
          <Card
            title="My Leads"
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            {/* Filters Section */}
            <div style={{ marginBottom: 24 }}>
              {/* Row 1: Status & Date Field Filters */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {/* Status Filter */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#666" }}>
                    Filter by Status
                  </label>
                  <select
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "2px solid #ddd",
                      minWidth: 150,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: statusFilter ? "#eef2ff" : "#fff",
                      borderColor: statusFilter ? "#6366f1" : "#ddd",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">All Statuses</option>
                    {Array.isArray(statuses.data) ? statuses.data.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    )) : null}
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
                      value={filter}
                      onChange={handleFilterChange}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "2px solid #ddd",
                        width: "100%",
                        fontSize: 14,
                        borderColor: filter ? "#3b82f6" : "#ddd",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(statusFilter || tableDateFilter !== "all" || filter) && (
                <div style={{ marginTop: 12, padding: 10, backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7", borderRadius: 4 }}>
                  <span style={{ fontSize: 13, color: "#0369a1" }}>
                    <strong>Active filters:</strong>{" "}
                    {statusFilter && <span className="badge">Status: {statusFilter}</span>}
                    {" "}
                    {tableDateFilter !== "all" && <span className="badge">Date: {tableDateFilter}</span>}
                    {" "}
                    {filter && <span className="badge">Search: "{filter}"</span>}
                  </span>
                </div>
              )}
            </div>

            {myleads.isLoading || statuses.isLoading ? (
              <p className="text-gray-700 dark:text-gray-300 p-5">Loading...</p>
            ) : (
              <LeadTable
                leads={filteredLeads.filter((l) => {
                  if (!filter) return true;
                  const q = filter.toLowerCase();
                  const name = (l.name || l.title || "").toLowerCase();
                  return name.includes(q);
                })}
                onOpen={onOpen}
                statuses={Array.isArray(statuses.data) ? statuses.data : []}
                onStatusChange={handleStatusChange}
                showDelete={false}
              />
            )}
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
