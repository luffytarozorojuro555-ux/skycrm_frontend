import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useState } from "react";
import { useEffect } from "react";

const RegisterUser = () => {
  // State for form inputs
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone:"",
    roleName: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

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
    if(name=="phone"){
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
    else{
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("Sending form data:", formData);
    await api.post("/auth/register", formData);
    setStatus({ type: "success", message: "User registered successfully" });
    setFormData({
      name: "",
      email: "",
      phone:"",
      roleName: "",
    });
    navigate('/')
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || "Registration failed. Please try again.";
    setStatus({ type: "error", message: errorMessage });
  }
};


  return (
    <div className="h-screen grid place-items-center bg-gray-50">
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
          <label className="text-sm font-medium">Set User's Mobile Number</label>
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
    </div>
  );
};

export default RegisterUser;
