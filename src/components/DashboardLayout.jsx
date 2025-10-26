import { useState } from "react";
import Header from "../components/Header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        className="fixed top-0 left-0 h-full z-20"
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-4 px-4 overflow-auto`}
        style={{ marginLeft: sidebarOpen ? "15rem" : "5rem", maxHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
