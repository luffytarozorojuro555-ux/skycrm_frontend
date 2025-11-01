// import axios from "axios";
// import React, { useContext } from "react";
// import { RecoveryContext } from "../App";

// export default function Login() {
//   const { setEmail, setPage, email, setOTP } = useContext(RecoveryContext);

//   function nagigateToOtp() {
//     if (email) {
//       const OTP = Math.floor(Math.random() * 9000 + 1000);
//       setOTP(OTP);
//         axios
//           .post("http://localhost:8000/api/auth/send_recovery_email", {
//           OTP,
//           recipient_email: email,
//         })
//         .then(() => setPage("otp"))
//         .catch(console.log);
//       return;
//     }
//     return alert("Please enter your email");
//   }

//   return (
//     <div className="w-full max-w-md mx-auto bg-white p-8 rounded shadow">
//       <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
//       <input
//         onChange={(e) => setEmail(e.target.value)}
//         type="text"
//         className="w-full mb-4 px-4 py-2 border rounded"
//         placeholder="Email address"
//       />
//       <button
//         type="button"
//         className="w-full py-2 bg-blue-600 text-white rounded mb-4"
//         onClick={nagigateToOtp}
//       >
//         Send OTP
//       </button>
//     </div>
//   );
// }
import axios from "axios";
import React, { useContext } from "react";
import { RecoveryContext } from "../App";

export default function Login() {
  const { setEmail, setPage, email, setOTP } = useContext(RecoveryContext);

  function nagigateToOtp() {
    if (email) {
      const OTP = Math.floor(Math.random() * 9000 + 1000);
      setOTP(OTP);
        axios
          .post(`${import.meta.env.VITE_API_URL}/auth/send_recovery_email`, {
          OTP,
          recipient_email: email,
        })
        .then(() => setPage("otp"))
        .catch(console.log);
      return;
    }
    return alert("Please enter your email");
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        className="w-full mb-4 px-4 py-2 border rounded"
        placeholder="Email address"
        autoFocus
      />
      <button
        type="button"
        className="w-full py-2 bg-blue-600 text-white rounded mb-4"
        onClick={nagigateToOtp}
      >
        Send OTP
      </button>
    </div>
  );

}

