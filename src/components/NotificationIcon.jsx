import { Bell, X } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationIcon({ hasNotification, notifications }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // ✅ Only unread (you can change this later if needed)
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleClick = () => {
    setOpen((prev) => !prev); // ❌ no API call here anymore
  };

  const handleClose = async () => {
    try {
      await api.patch("/notifications/mark-all-read");

      // ✅ update cache
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
    } catch (e) {
      console.error("Failed to mark notifications as read", e);
    }

    setOpen(false); // close AFTER clearing
  };

  return (
    <div className="relative inline-block">
      {/* Bell */}
      <div
        onClick={handleClick}
        className="p-3 rounded-full border border-gray-500 shadow-lg text-gray-800 
        hover:bg-yellow-300 transition-all duration-200 
        flex items-center justify-center cursor-pointer"
      >
        <Bell className="w-5 h-5" />
      </div>

      {/* Red dot */}
      {hasNotification && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
      )}

      {/* Dropdown */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-3 z-50"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <p className="font-semibold text-gray-700">Notifications</p>

            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-gray-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-60 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-3">
                No notifications
              </p>
            ) : (
              unreadNotifications.map((n) => (
                <div
                  key={n._id || `${n.message}-${Math.random()}`}
                  className="text-sm p-2 border-b last:border-none hover:bg-gray-100 rounded"
                >
                  {n.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}