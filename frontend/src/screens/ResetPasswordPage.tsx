import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearAuthState } from "../slices/authSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { RootState } from "../store";

type ResetFormData = {
  otp: string;
  password: string;
  confirmPassword: string;
};

type ResetFormErrors = Partial<Record<keyof ResetFormData, string>>;

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState<ResetFormData>({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<ResetFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const { email } = location.state || {};

  useEffect(() => {
    if (success && success.includes("password") && success.includes("reset")) {
      toast.success(
        "Password reset successful! Please login with your new password."
      );
      setTimeout(() => {
        navigate("/login", { replace: true });
        dispatch(clearAuthState());
      }, 1000);
    }

    if (error) {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof ResetFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors: ResetFormErrors = {};
    let isValid = true;

    if (!formData.otp.trim()) {
      errors.otp = "OTP is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.trim().length < 8) {
      errors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password.trim() !== formData.confirmPassword.trim()) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const trimmedFormData = {
      otp: formData.otp.trim(),
      password: formData.password.trim(),
    };

    dispatch(
      resetPassword({
        email,
        otp: trimmedFormData.otp,
        password: trimmedFormData.password,
      }) as any
    ).then((result: any) => {
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
          <h2 className="title w-full text-center">Reset Password</h2>
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
            <Label htmlFor="otp" className={undefined}>
              OTP
            </Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              className={formErrors.otp ? "border-red-500" : ""}
              disabled={loading}
            />
            {formErrors.otp && (
              <p className="text-sm text-red-500 mt-1">{formErrors.otp}</p>
            )}
          </div>

          <div className="input-group">
            <Label htmlFor="password" className={undefined}>
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? "border-red-500" : ""}
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
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="input-group">
            <Label htmlFor="confirmPassword" className={undefined}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? "border-red-500" : ""}
              disabled={loading}
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
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
