export default function LimitDropdown({ value, onChange }) {
  const limits = [10, 20, 30, 50, 100];

  return (
    <div className="mb-4">
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="block w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {limits.map((num) => (
          <option key={num} value={num}>
            Show {num}
          </option>
        ))}
      </select>
    </div>
  );
}
