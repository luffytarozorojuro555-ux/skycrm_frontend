import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import UsersTable from "../../components/UsersTable";
import LimitDropdown from "../../components/LimitDropDown";
import PaginationControls from "../../components/PaginationControls";
import {
  Users,
  Target,
  Briefcase,
  Clock,
  UserPlus,
  Activity,
} from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });
  const leads = useQuery({
    queryKey: ["leads"],
    queryFn: async () => (await api.get("/leads")).data,
  });
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await api.get("/team")).data,
  });

  const [pageLead, setPageLead] = useState(1);
  const [limitLead, setLimitLead] = useState(10);
  const [pageUser, setPageUser] = useState(1);
  const [limitUser, setLimitUser] = useState(10);

  const usersPagination = useQuery({
    queryKey: ["usersPagination", pageUser, limitUser],
    queryFn: async () =>
      (
        await api.get(
          `/users/paginationUsersList?page=${pageUser}&limit=${limitUser}`
        )
      ).data,
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const leadsPagination = useQuery({
    queryKey: ["leadsPagination", pageLead, limitLead],
    queryFn: async () =>
      (
        await api.get(
          `/leads/paginationLeadsList?page=${pageLead}&limit=${limitLead}`
        )
      ).data,
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
    setPage(1);
  };

  const handleUserLimitChange = (event) => {
    setLimitUser(parseInt(event.target.value));
    setPageUser(1);
  };

  const stats = [
    {
      title: "Total Users",
      value: users.data?.length || 0,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: "Total Leads",
      value: leads.data?.length || 0,
      icon: <Target className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Active Teams",
      value: teams.data?.length || 0,
      icon: <Briefcase className="w-6 h-6 text-yellow-600" />,
    },
    {
      title: "Pending Leads",
      value: leads.data?.filter((l) => l.status?.name === "New").length || 0,
      icon: <Clock className="w-6 h-6 text-red-600" />,
    },
  ];

  return (
    <div className="min-h-screen  w-full p-6 overflow-x-hidden">
      {/* Dashboard Header */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className=" text-gray-800 dark:text-gray-300">
              Overview of users, leads, and teams.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/activityLogs"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <Activity className="w-5 h-5 mr-2" />
              Activity Logs
            </Link>
            <Link
              to="/manageUsers"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Link>
            <Link
              to="/registerUser"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register New User
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-700 rounded-lg shadow p-5 flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {stat.value}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
              {stat.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Content Grids */}
      <section className="grid gap-6 lg:grid-cols-3 mb-10">
        {/* Users Table */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-700 p-5 rounded-lg shadow transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Users
            </h2>
            <LimitDropdown
              value={limitUser}
              onChange={(newLimit) => {
                setLimitUser(newLimit);
                setPageUser(1);
              }}
            />
          </div>
          {usersPagination.isLoading ? (
            <div className="flex justify-center items-center py-6 text-blue-600">
              <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading
            </div>
          ) : (
            <div>
              <UsersTable usersData={usersPagination?.data?.users || []} />
              <PaginationControls
                totalPages={usersPagination.data?.totalPages}
                page={pageUser}
                setPage={setPageUser}
              />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow transition-colors">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Teams
          </h2>

          <ul className="space-y-3">
            {teams.data?.map((team) => (
              <li
                key={team._id}
                className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded flex justify-between items-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">
                    {team.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lead: {team.lead?.name || "N/A"}
                  </p>
                </div>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded-full">
                  {team.members?.length || 0} Members
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* All Leads Table */}
      <section className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            All Leads
          </h2>
          <div>
            <LimitDropdown
              value={limitLead}
              onChange={(newLimit) => {
                setLimitLead(newLimit);
                setPageLead(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {leadsPagination.isLoading ? (
            <div className="flex justify-center items-center py-6 text-blue-600">
              <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading
            </div>
          ) : (
            <div>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {leadsPagination.data?.leads?.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                          {lead.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge name={lead.status?.name} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/leads/${lead._id}/edit`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                totalPages={leadsPagination?.data?.totalPages}
                page={pageLead}
                setPage={setPageLead}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
