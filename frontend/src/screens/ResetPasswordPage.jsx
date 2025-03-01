import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearAuthState } from "../slices/authSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, success } = useSelector((state) => state.auth);

  const { email } = location.state || {};

  useEffect(() => {
    if (success) {
      if (success.includes("password") && success.includes("reset")) {
        toast.success(
          "Password reset successful! Please login with your new password."
        );
        setTimeout(() => {
          navigate("/login", { replace: true });
          dispatch(clearAuthState());
        }, 1000);
      }
    }

    if (error) {
      console.error("Reset password error:", error);
      toast.error(
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error
      );
      setTimeout(() => {
        dispatch(clearAuthState());
      }, 500);
    }
  }, [success, error, navigate, dispatch]);

  useEffect(() => {
    if (!email) {
      toast.error("Email information is missing");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    const { password, confirmPassword } = formData;

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.trim() === "") {
      toast.error("Please enter the verification code");
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    dispatch(
      resetPassword({
        email,
        otp: formData.otp,
        password: formData.password,
      })
    ).then((result) => {
      if (result.payload && !result.error) {
        navigate("/user/home");
        dispatch(clearAuthState());
      }
    });
  };

  if (!email) {
    return (
      <div className="container">
        <div className="card">
          <div className="text-center">
            Redirecting to forgot password page...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="absolute left-4"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="title w-full">Reset Password</h2>
        </div>

        <div className="alert-box" style={{ marginBlock: "8px" }}>
          Enter the OTP sent to <strong>{email}</strong> and new password
        </div>

        {error && (
          <div className="alert-box error">
            {typeof error === "object"
              ? error.message || JSON.stringify(error)
              : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="input-group">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {passwordError && (
              <p className="text-sm font-medium text-destructive">
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading ||
              !formData.otp ||
              !formData.password ||
              !formData.confirmPassword
            }
          >
            {loading ? (
              <>
                <Loader2 className="loader-icon" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        <p className="signup-text">
          Remember your password?{" "}
          <Link to="/login" className="signup-link">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
