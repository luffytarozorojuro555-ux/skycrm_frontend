import {
  Activity,
  ClipboardList,
  AlertTriangle,
  FileText,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import socket from "../socket";
import api from "../services/api";
import useLoadMore from "../hooks/useLoadMore";

const logIcons = {
  info: Activity,
  warn: AlertTriangle,
  error: FileText,
};

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Fetch initial logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/auth/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, []);

  // Listen for new logs
  useEffect(() => {
    const handleNewLog = (log) => {
      setLogs((prev) => [log, ...prev]);
    };
    socket.on("newLog", handleNewLog);
    return () => {
      socket.off("newLog", handleNewLog);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const keyword = searchTerm.toLowerCase();
    const matchesSearch =
      log.message?.toLowerCase().includes(keyword) ||
      log.user?.toLowerCase().includes(keyword) ||
      log.target?.toLowerCase().includes(keyword);

    const matchesRole = roleFilter ? log?.role === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  const { visibleData, handleLoadMore, hasMore } = useLoadMore(
    filteredLogs || [],
    10,
    10
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
        Activity Logs
      </h2>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative mb-4 w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm 
                     focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        <div className="relative mb-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Sales Team Lead">Sales Team Lead</option>
            <option value="Sales Representatives">Sales Representatives</option>
          </select>
        </div>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {visibleData.map((log, index) => {
          const Icon = logIcons[log.level] || Activity;
          return (
            <li key={index} className="py-4 flex items-start">
              <div
                className={`p-2 rounded-full mr-3 flex items-center justify-center 
                  ${
                    log.level === "info"
                      ? "bg-blue-100 text-blue-600"
                      : log.level === "warn"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {log.message}
                </p>
                {log.user && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Done by: {log.user + "  " + "(" + log.role + ")"} •{" "}
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                )}
                {log.target && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target: {log.target}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            className="text-gary-400 font-medium "
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
