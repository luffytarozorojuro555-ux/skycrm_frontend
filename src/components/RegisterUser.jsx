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
    <div className="h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-4xl flex justify-start mb-2 px-4">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg 
                     text-sm font-medium text-gray-700 bg-gray-100 
                     hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 
                     dark:hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow w-[360px] space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Register New User</h1>

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium">User's Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter user's full name"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">User's Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter user's email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/*Mobile Number*/}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Set User's Mobile Number
          </label>
          <input
            type="tel"
            name="phone"
            pattern="[0-9]{10}"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10 digit mobile number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Assign Role</label>
          <select
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            disabled={rolesQuery.isLoading || rolesQuery.isError}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">
              {rolesQuery.isLoading
                ? "Loading roles..."
                : rolesQuery.isError
                ? "Failed to load roles"
                : "Select role"}
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

        {/* Submit */}
        <button
          style={{ paddingTop: "10px" }}
          type="submit"
          className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          Register New User
        </button>
        {status && (
          <p
            className={
              status.type === "success" ? "text-green-600" : "text-red-600"
            }
          >
            {status.message}
          </p>
        )}
      </form>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
            <p className="text-gray-700 mb-6">User registered successfully.</p>
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
