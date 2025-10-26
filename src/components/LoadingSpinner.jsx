import react from "react";

const LoadingSpinner=({ size = 32, color = "border-blue-500" })=> {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: "4px",
      }}
      className={`border-t-transparent border-solid rounded-full animate-spin ${color}`}
    ></div>
  );
};
export default LoadingSpinner;
