import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import { RecoveryContext } from "../App";

export default function OTPInput() {
  const { email, otp, setPage } = useContext(RecoveryContext);
  const [timerCount, setTimer] = useState(60);
  const [OTPinput, setOTPinput] = useState(["", "", "", ""]);
  const [disable, setDisable] = useState(true);
  const inputRefs = useRef([]);

  function resendOTP() {
    if (disable) return;
    axios
      .post(`${import.meta.env.VITE_API_URL}/auth/send_recovery_email`, {
        OTP: otp,
        recipient_email: email,
      })
      .then(() => {
        setDisable(true);
        alert("A new OTP has been sent to your email.");
        setTimer(60);
      })
      .catch((err) => console.log(err));
  }

  function verifyOTP() {
    const enteredOTP = OTPinput.join("");
    if (enteredOTP.length < 4) {
      alert("Please enter the complete 4-digit OTP.");
      return;
    }

    if (parseInt(enteredOTP) === otp) {
      setPage("reset");
    } else {
      alert("The OTP you entered is incorrect. Try again or resend the code.");
    }
  }

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDisable(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const handleChange = (e, i) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const arr = [...OTPinput];
    arr[i] = value;
    setOTPinput(arr);

    if (value && i < inputRefs.current.length - 1) {
      inputRefs.current[i + 1].focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !OTPinput[i] && i > 0) {
      inputRefs.current[i - 1].focus();
    }
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
      <div className="bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We’ve sent a code to your email: {email}</p>
            </div>
          </div>

          <div>
            <form>
              <div className="flex flex-col space-y-16">
                {/* OTP Inputs */}
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  {OTPinput.map((v, i) => (
                    <div className="w-16 h-16" key={i}>
                      <input
                        ref={(el) => (inputRefs.current[i] = el)}
                        maxLength="1"
                        className="w-full h-full flex items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-300 text-lg bg-white focus:bg-gray-50 focus:ring-2 ring-blue-700"
                        type="text"
                        value={v}
                        onChange={(e) => handleChange(e, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                      />
                    </div>
                  ))}
                </div>

                {/* Verify Button */}
                <div className="flex flex-col space-y-5">
                  <button
                    type="button"
                    onClick={verifyOTP}
                    className="w-full py-4 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition"
                  >
                    Verify Account
                  </button>

                  {/* Resend Section */}
                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn’t receive code?</p>
                    <button
                      type="button"
                      disabled={disable}
                      onClick={resendOTP}
                      className="text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed underline"
                    >
                      {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
