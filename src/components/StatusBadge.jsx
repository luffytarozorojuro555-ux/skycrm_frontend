const colors = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Contacted: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  Registered:
    "bg-indigo-300 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  Interested:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Call Back":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Follow-Up":
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "Not Interested":
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  Enrolled:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
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
