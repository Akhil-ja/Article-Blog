import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyEmail,
  clearAuthState,
  resendVerificationOTP,
} from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@mui/material";
import { Input } from "../components/ui/input";
import { RootState } from "../store";
import { SubmitEventHandler } from "../Types/eventTypes";

export const OTPVerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(10);
  const [canResend, setCanResend] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );
  const { email } = location.state || {};

  useEffect(() => {
    if (success === "OTP resent successfully") {
      toast.info("OTP resent! Please check your email.");
      dispatch(clearAuthState());
    }

    if (error) {
      toast.error(
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error
      );
      dispatch(clearAuthState());
    }
  }, [success, error, navigate, dispatch]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
      dispatch(clearAuthState());
    }
  }, [email, dispatch, navigate]);

  const validateOtp = () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return false;
    }
    return true;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    const trimmedOtp = otp.trim();
    dispatch(verifyEmail({ email, otp: trimmedOtp }) as any).then(
      (result: any) => {
        if (result.payload && !result.error) {
          navigate("/user/home");
          dispatch(clearAuthState());
        }
      }
    );
  };

  const handleResendOTP = () => {
    dispatch(clearAuthState());
    dispatch(resendVerificationOTP({ email }) as any);
    setTimer(10);
    setCanResend(false);
  };

  if (!email) {
    return (
      <div className="container">
        <div className="card">
          <div className="text-center">
            Missing email information. Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Verify Email</h2>
        <p className="description">Enter the OTP code sent to your email</p>
        <div className="flex items-center justify-center py-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="alert-box">
          Sent a OTP to: <strong>{email}</strong>
        </div>
        {error && (
          <div className="alert-box error">
            {typeof error === "object"
              ? error.message || JSON.stringify(error)
              : error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="form"
          style={{ marginTop: "20px" }}
        >
          <div className="input-group">
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e: any) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              className={otpError ? "border-red-500" : ""}
            />
            {otpError && (
              <p className="text-sm text-red-500 mt-1" style={{ color: "red" }}>
                {otpError}
              </p>
            )}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loader-icon" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
        <div className="signup-text">
          <Button onClick={handleResendOTP} disabled={!canResend || loading}>
            {!canResend ? `Resend code in ${timer}s` : "Resend OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
};
