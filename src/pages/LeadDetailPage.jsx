import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Link2,
  GraduationCap,
  Calendar,
  MessageCircle,
} from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Fetch lead data
  const { data } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => (await api.get(`/leads/${id}`)).data,
  });
  const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });

  const changeStatus = useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/leads/${id}/status`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const [editForm, setEditForm] = useState({
    name: data?.name || "",
    phone: data?.phone || "",
    email: data?.email || "",
    city: data?.city || "",
    source: data?.source || "",
    college: data?.college || "",
    yearOfPassout: data?.yearOfPassout || "",
  });

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setEditForm({
      name: data?.name || "",
      phone: data?.phone || "",
      email: data?.email || "",
      city: data?.city || "",
      source: data?.source || "",
      college: data?.college || "",
      yearOfPassout: data?.yearOfPassout || "",
    });
  }, [data]);

  const updateLead = useMutation({
    mutationFn: async (payload) =>
      (await api.put(`/leads/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      alert("Error updating lead: " + error.response?.data?.error);
    },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/leads/${id}/comments`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      setNewComment("");
    },
  });

  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(false);

  if (!data)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} color="border-purple-500" />
      </div>
    );

  const handleChange = (e) => {
    const newStatus = e.target.value;
    setLoading(true);
    changeStatus.mutate(
      { statusName: newStatus },
      {
        onSettled: () => setTimeout(() => setLoading(false), 1000),
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {data?.name.toUpperCase()}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Lead Information & History
          </p>
        </div>
        <StatusBadge name={data.status?.name} />
      </div>

      {/* Status & Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2"
          value={data?.status?.name}
          onChange={handleChange}
        >
          {statuses?.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-purple-600 px-4 py-2 text-white shadow hover:bg-purple-700 transition"
            onClick={() =>
              updateLead.mutate(editForm, {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: ["leads"] });
                  navigate("/");
                },
              })
            }
          >
            Save Changes
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <LoadingSpinner size={32} color="border-purple-500" />
        </div>
      )}

      {/* Card with Tabs */}
      <div className="dark:bg-gray-900 rounded-xl shadow p-6">
        <div className="flex gap-6 border-b border-gray-700">
          <button
            className={`pb-2 font-medium ${
              tab === "details"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-500"
            }`}
            onClick={() => setTab("details")}
          >
            Details
          </button>
          <button
            className={`pb-2 font-medium ${
              tab === "history"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-500"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {/* Details Tab */}
        {tab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <InputField
              label="Full Name"
              icon={<User size={16} />}
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <InputField
              label="Phone Number"
              icon={<Phone size={16} />}
              value={editForm.phone}
              onChange={(e) => {
                let value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setEditForm((f) => ({ ...f, phone: e.target.value }));
                }
              }}
            />
            <InputField
              label="Email Address"
              icon={<Mail size={16} />}
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <InputField
              label="City"
              icon={<MapPin size={16} />}
              value={editForm.city}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, city: e.target.value }))
              }
            />
            <InputField
              label="Source"
              icon={<Link2 size={16} />}
              value={editForm.source}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, source: e.target.value }))
              }
            />
            <InputField
              label="College"
              icon={<GraduationCap size={16} />}
              value={editForm.college}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, college: e.target.value }))
              }
            />
            <InputField
              type="date"
              label="Year of Passout"
              icon={<Calendar size={16} />}
              value={editForm.yearOfPassout}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, yearOfPassout: e.target.value }))
              }
            />
            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comments
              </label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-gray-100 outline-none"
                  />
                  <button
                    onClick={() => addComment.mutate({ text: newComment })}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Add Comment
                  </button>
                </div>
                {/* Existing comments */}
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {data.comments?.length > 0 ? (
                    data.comments
                      .slice()
                      .reverse()
                      .map((c, i) => (
                        <div
                          key={i}
                          className="border border-gray-700 rounded-lg p-2 text-sm dark:text-gray-200"
                        >
                          <p>{c.text}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            — {c.by?.name || "Unknown"} (
                            {new Date(c.at).toLocaleString()})
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="flow-root flex-col mt-6">
            <ul role="list" className="-mb-5 space-y-2">
              {data.history
                ?.slice()
                .reverse()
                .map((h, i, arr) => (
                  <li key={i}>
                    <div className="relative pb-8">
                      {i !== arr.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-5">
                        <div>
                          <span className="space-y-4 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircleIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm dark:text-gray-200 text-gray-800">
                              → {new Date(h.at).toLocaleString()} set to{" "}
                              <b>{h.status?.name || h.status}</b> by{" "}
                              <b>
                                {h.by?.name} - {h.by?.email}
                              </b>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, icon, value, onChange, type="text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-lg border border-gray-600 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-200">
        {icon}
        <input
          type={type}
          className="ml-2 flex-1 outline-none dark:bg-gray-900 dark:text-gray-100"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
