// import { useState, useEffect } from "react";
// import UserDetails from "./UserDetails";
// import socket from "../socket";
// import api from "../services/api";

// export default function UsersTable({ usersData }) {
//   const [userInfo, setUserInfo] = useState(null);
//   const [showUserDetails, setShowUserDetails] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(10); // show 10 initially

//   // Sync local tableData with usersData prop
//   useEffect(() => {
//     setTableData(usersData);
//   }, [usersData]);

//   // Socket listener for real-time updates
//   useEffect(() => {
//     const handleStatusChange = (updatedUser) => {
//       setTableData((prev) =>
//         prev.map((u) =>
//           u._id === updatedUser._id ? { ...u, ...updatedUser } : u
//         )
//       );
//     };
//     socket.on("userStatusChange", handleStatusChange);
//     return () => {
//       socket.off("userStatusChange", handleStatusChange);
//     };
//   }, []);

//   const handleUserDetails = (user) => {
//     setUserInfo(user);
//     setShowUserDetails(true);
//   };

//   const handleUserUpdated = (updatedUser) => {
//     setTableData((prev) =>
//       prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
//     );
//   };

//   const handleUserDeleted = (deletedUser) => {
//     setTableData((prev) => prev.filter((u) => u._id !== deletedUser._id));
//   };

//   // Load more handler
//   const handleLoadMore = () => {
//     setVisibleCount((prev) => prev + 10);
//   };

//   const visibleUsers = tableData.slice(0, visibleCount);

//   return (
//     <>
//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Email</th>
//               <th className="px-4 py-2 border">Role</th>
//               <th className="px-4 py-2 border">Action</th>
//               <th className="px-4 py-2 border">Status</th>
//               <th className="px-5 py-2 border">Session</th>
//             </tr>
//           </thead>
//           <tbody>
//             {visibleUsers.map((user) => (
//               <tr
//                 key={user._id}
//                 className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <td className="px-4 py-2 border">{user.name}</td>
//                 <td className="px-4 py-2 border">{user.email}</td>
//                 <td className="px-4 py-2 border">{user.roleName}</td>
//                 <td className="px-4 py-2 border text-center">
//                   <button
//                     className="underline text-blue-600 hover:text-blue-800"
//                     onClick={() => handleUserDetails(user)}
//                   >
//                     View Details
//                   </button>
//                 </td>
//                 <td className="px-4 py-2 border text-center">
//                   <div
//                     className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
//                       user.status === "active"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {user.status}
//                   </div>
//                 </td>
//                 <td className="px-5 py-2 border">
//                   <div className="flex items-center gap-2">
//                     <span
//                       className={`h-3 w-3 rounded-full ${
//                         user.lastLogin && user.lastLogout == null
//                           ? "bg-green-500"
//                           : "bg-red-500"
//                       }`}
//                     ></span>

//                     {user.lastLogin && user.lastLogout == null ? (
//                       <span className="text-gray-700 text-sm">Online</span>
//                     ) : (
//                       <span className="text-gray-500 text-sm">
//                         Offline (Last:{" "}
//                         {user.lastLogout
//                           ? new Date(user.lastLogout).toLocaleString()
//                           : "-"}
//                         )
//                       </span>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ---- Load More Button ---- */}
//         {visibleCount < tableData.length && (
//           <div className="flex justify-center my-4">
//             <button
//               onClick={handleLoadMore}
//               className=" text-gary-400 font-medium"
//             >
//               Load More
//             </button>
//           </div>
//         )}
//       </div>

//       <UserDetails
//         open={showUserDetails}
//         user={userInfo}
//         onClose={() => setShowUserDetails(false)}
//         onUserUpdated={handleUserUpdated}
//         onUserDeleted={handleUserDeleted}
//       />
//     </>
//   );
// }
import { useState, useEffect } from "react";
import UserDetails from "./UserDetails";
import socket from "../socket";


export default function UsersTable({ usersData }) {
  const [userInfo, setUserInfo] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // show 10 initially

  // Sync local tableData with usersData prop
  useEffect(() => {
    setTableData(usersData);
  }, [usersData]);

  // Socket listener for real-time updates
  useEffect(() => {
    const handleStatusChange = (updatedUser) => {
      setTableData((prev) =>
        prev.map((u) =>
          u._id === updatedUser._id ? { ...u, ...updatedUser } : u
        )
      );
    };
    socket.on("userStatusChange", handleStatusChange);
    return () => {
      socket.off("userStatusChange", handleStatusChange);
    };
  }, []);

  const handleUserDetails = (user) => {
    setUserInfo(user);
    setShowUserDetails(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setTableData((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  const handleUserDeleted = (deletedUser) => {
    setTableData((prev) => prev.filter((u) => u._id !== deletedUser._id));
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-5 py-2 border">Session</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.roleName}</td>
                <td className="px-4 py-2 border text-center">
                  <button
                    className="underline text-blue-600 hover:text-blue-800"
                    onClick={() => handleUserDetails(user)}
                  >
                    View Details
                  </button>
                </td>
                <td className="px-4 py-2 border text-center">
                  <div
                    className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </div>
                </td>
                <td className="px-5 py-2 border">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        user.lastLogin && user.lastLogout == null
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>

                    {user.lastLogin && user.lastLogout == null ? (
                      <span className="text-gray-700 text-sm">Online</span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Offline (Last:{" "}
                        {user.lastLogout
                          ? new Date(user.lastLogout).toLocaleString()
                          : "-"}
                        )
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDetails
        open={showUserDetails}
        user={userInfo}
        onClose={() => setShowUserDetails(false)}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />
    </>
  );
}
