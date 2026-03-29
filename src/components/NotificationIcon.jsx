import { Bell } from "lucide-react"; // or heroicons

export default function NotificationIcon({ hasNotification}) {
  return (
    <div className="relative inline-block">
      <div
        className="p-3 rounded-full border border-gray-500 shadow-lg text-gray-800 
               hover:bg-gray-700 hover:text-white transition-all duration-200 
               flex items-center justify-center cursor-pointer"
      >
        <Bell className="w-5 h-5" />
      </div>

      {/* Notification Dot */}
      {hasNotification && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
      )}
    </div>
  );
}
