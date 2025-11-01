const colors = {
  New: "bg-orange-300 text-gray-800",
  Contacted: "bg-blue-300 text-blue-800",
  Registered: "bg-indigo-300 text-indigo-800",
  Interested: "bg-amber-300 text-amber-800",
  "Call Back": "bg-yellow-300 text-yellow-800",
  "Follow-Up": "bg-purple-300 text-purple-800",
  "Not Interested": "bg-red-300 text-red-800",
  Enrolled: "bg-green-300 text-green-800",
};

export default function StatusBadge({ name }) {
  return (
    <span
      className={`
        ${colors[name] || "bg-gray-100 text-gray-800"}
        inline-flex 
        items-center 
        justify-center 
        text-xs 
        rounded-md 
        w-20 
        h-6
      `}
    >
      {name}
    </span>
  );
}
