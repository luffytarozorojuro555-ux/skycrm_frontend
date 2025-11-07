import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useState } from "react";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
const RegisterUser = () => {
  // State for form inputs
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleName: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: "", message: "" }); // clear after 2s
      }, 2000);

      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [status.message]);

  // Fetch roles excluding "Admin"
  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/roles");
      return response.data.filter((r) => r.name !== "Sales Team Lead");
    },
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "phone") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending form data:", formData);
      await api.post("/auth/register", formData);
      setShowSuccessModal(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        roleName: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Registration failed. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/"); // Navigate to home on close
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-800 bg-gray-50 transition-colors duration-300 px-4">
      {/* Back Button */}
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-sm font-medium
               text-gray-600 hover:text-purple-600 
               dark:text-gray-300 dark:hover:text-purple-400
               transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Registration Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6 
               border-2 border-gray-100 dark:border-gray-700 transition-all duration-300"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Register New User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Fill in the details below to create a new account.
          </p>
        </div>

        {/* First Row - Full Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user's full name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none 
                     transition-all duration-200"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter user's email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none 
                     transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Second Row - Phone + Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none 
                     transition-all duration-200"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Assign Role
            </label>
            <select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              disabled={rolesQuery.isLoading || rolesQuery.isError}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none 
                     transition-all duration-200"
              required
            >
              <option value="">
                {rolesQuery.isLoading
                  ? "Loading roles..."
                  : rolesQuery.isError
                  ? "Failed to load roles"
                  : "Select a role"}
              </option>
              {rolesQuery.data?.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {rolesQuery.isError && (
              <p className="text-red-500 text-sm mt-1">Error fetching roles.</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-lg
                 hover:bg-purple-700 active:bg-purple-800
                 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Register New User
        </button>

        {/* Status Message */}
        {status && (
          <p
            className={`text-center text-sm mt-2 ${
              status.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {status.message}
          </p>
        )}
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-green-600 mb-3">Success!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              User registered successfully.
            </p>
            <button
              onClick={handleCloseModal}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
