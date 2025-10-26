const PaginationControls = ({ totalPages, page, setPage }) => (
  <div className="flex justify-end mt-4 space-x-2">
    {Array.from({ length: totalPages || 1 }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setPage(i + 1)}
        className={`px-3 py-1 rounded text-sm transition ${
          page === i + 1
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
);
export default PaginationControls;
