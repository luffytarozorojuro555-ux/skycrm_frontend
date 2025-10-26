import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useState, useEffect } from "react";
import UsersTable from "../components/UsersTable";

const ManageUsers = () => {
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [usersData, setUsersData] = useState([]);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await api.get("/roles")).data,
  });

  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchUsers = async () => {
      try {
        const res = await api.post("/users/usersByRole", {
          roleId: selectedRoleId,
        });
        setUsersData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [selectedRoleId]);

  useEffect(() => {
    if (rolesQuery.data && rolesQuery.data.length > 0 && !selectedRoleId) {
      const adminRole = rolesQuery.data.find((r) => r.name === "Admin");
      setSelectedRoleId(adminRole?._id || rolesQuery.data[0]._id);
    }
  }, [rolesQuery.data]);

  return (
    <div className="flex flex-col items-center  py-12 space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <div className=" p-4 rounded-2xl  w-full max-w-3xl">
        <nav className="flex space-x-4 justify-center">
          {rolesQuery.data?.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedRoleId(r._id)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                selectedRoleId === r._id
                  ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              {r.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full max-w-4xl">
        <UsersTable usersData={usersData} />
      </div>
    </div>
  );
};

export default ManageUsers;
