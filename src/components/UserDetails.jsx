import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FaWhatsapp } from "react-icons/fa";

<<<<<<< HEAD
export default function UserDetails({
  open,
  user,
  onClose,
  onUserUpdated,
  onUserDeleted,
}) {
  const [userDetails, setUserDetails] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
=======
export default function UserDetails({ open, user, onClose, onUserUpdated, onUserDeleted }) {
  const [userDetails, setUserDetails] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
>>>>>>> c4fbf1a242e26ed4913c23b5d9f20b11455a3c29
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await api.post("/users/getUserDetails", { user });
        setUserDetails(res.data.user);
      } catch (err) {
        console.error(err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [open, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (
      !(
        user.name === userDetails.name &&
        user.email === userDetails.email &&
        user.status === userDetails.status &&
        user.phone === userDetails.phone
      )
    ) {
      try {
        const res = await api.put("/users/updateUser", { user: userDetails });
        onUserUpdated(res.data); // update table immediately
<<<<<<< HEAD
        setEditable(false);
        setUpdateError(null);
        onClose();
        setUserDetails(null);
      } catch (err) {
        setUpdateError(err.response?.data?.error);
      }
    } else {
      setEditable(false);
      setUpdateError(null);
      onClose();
      setUserDetails(null);
    }
  };

  const handleClose = () => {
    setUpdateError(null);
=======
      } catch (err) {
        console.error(err);
      }
    }
    setEditable(false);
    onClose();
    setUserDetails(null);
  };

  const handleClose = () => {
>>>>>>> c4fbf1a242e26ed4913c23b5d9f20b11455a3c29
    setEditable(false);
    setUserDetails(null);
    onClose();
  };

  const handleDeleteUser = async () => {
    try {
      const res = await api.delete("/users/deleteUser", {
        data: { user: userDetails },
      });
      onUserDeleted(res.data.deletedUser); // update table immediately
    } catch (err) {
      console.error(err);
    }
    onClose();
    setUserDetails(null);
  };

  if (!open) return null;
  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!userDetails) return null;

  const role = userDetails.roleName;

  let formattedPhone, message;
  formattedPhone = message = null;
  if (userDetails.phone) {
    formattedPhone = `+91${userDetails.phone.replace(/\D/g, "").slice(-10)}`;
    message = encodeURIComponent("Hello from SKY-CRM!");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl h-auto max-h-[90vh] p-8 overflow-y-auto relative rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">User Details</h2>
          <div>
            <button
              onClick={() => setEditable(true)}
              className={`underline transition-colors duration-200 ${
                editable
                  ? "text-green-600 hover:text-green-800"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              Edit
            </button>
            <button
              disabled={userDetails.status === "active"}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                userDetails.status === "active"
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-red-500 hover:text-red-700"
              }`}
              onClick={handleDeleteUser}
            >
              Delete
            </button>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="space-y-6 text-lg">
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 font-medium text-gray-700">
                Name:
              </label>
              <input
                type="text"
                name="name"
                readOnly={!editable}
                value={userDetails.name}
                onChange={handleChange}
                className="ml-0 md:ml-4 mt-2 md:mt-0 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 font-medium text-gray-700">
                Email:
              </label>
              <input
                type="email"
                name="email"
                readOnly={!editable}
                value={userDetails.email}
                onChange={handleChange}
                className="ml-0 md:ml-4 mt-2 md:mt-0 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex flex-col md:flex-row md:items-center flex-1">
                <label className="w-full md:w-1/3 font-medium text-gray-700">
                  Mobile Number:
                </label>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="phone"
                    pattern="[0-9]{10}"
                    placeholder="Enter 10 digit mobile number"
                    readOnly={!editable}
                    value={userDetails.phone}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 pr-10" // space for icon
                  />
                  {userDetails.phone && (
                    <a
                      href={`https://wa.me/${formattedPhone}?text=${message}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors duration-200"
                      title="Message on WhatsApp"
                    >
                      <FaWhatsapp size={22} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 font-medium text-gray-700">
                Status:
              </label>
              <select
                name="status"
                disabled={!editable}
                value={userDetails.status}
                onChange={handleChange}
                className="ml-0 md:ml-4 mt-2 md:mt-0 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-2/3 bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {role && (
              <div className="flex flex-col md:flex-row md:items-center">
                <label className="w-full md:w-1/3 font-medium text-gray-700">
                  Role:
                </label>
                <input
                  type="text"
                  value={role}
                  readOnly
                  className="ml-0 md:ml-4 mt-2 md:mt-0 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-2/3 bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

            {role === "Sales Manager" && (
              <div>
                <p className="font-semibold text-gray-800 mb-3">
                  Teams under Manager:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {userDetails.teams?.map((team) => (
                    <div
                      key={team._id}
                      className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-all"
                    >
                      <p className="text-lg font-medium text-blue-700">
                        {team.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Lead:</strong> {team.lead?.name || "-"} (
                        {team.lead?.email || "—"})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === "Sales Team Lead" && (
              <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-all">
                <p className="text-lg font-medium text-blue-700">
                  Team: {userDetails.teams[0]?.name}
                </p>
                <p className="text-gray-700">
                  <strong>Manager:</strong>{" "}
                  {userDetails.teams[0]?.manager?.name || "-"} (
                  {userDetails.teams[0]?.manager?.email || "-"})
                </p>
              </div>
            )}

            {role === "Sales Representatives" && (
              <div>
                {userDetails.teams?.length > 0 ? (
                  <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-all">
                    <p className="text-lg font-medium text-blue-700">
                      Team: {userDetails.teams[0]?.name}
                    </p>
                    <p className="text-gray-700">
                      <strong>Team Lead:</strong>{" "}
                      {userDetails.teams[0].lead?.name || "-"} (
                      {userDetails.teams[0].lead?.email || "—"})
                    </p>
                    <p className="text-gray-700">
                      <strong>Manager:</strong>{" "}
                      {userDetails.teams[0].manager?.name || "-"} (
                      {userDetails.teams[0].manager?.email || "—"})
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No team assigned</p>
                )}
              </div>
            )}
<<<<<<< HEAD
            {updateError && (
              <p className="text-red-600 text-sm mt-1">{updateError}</p>
            )}
=======
>>>>>>> c4fbf1a242e26ed4913c23b5d9f20b11455a3c29
          </div>

          <div className="flex justify-end mt-8 gap-4">
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
