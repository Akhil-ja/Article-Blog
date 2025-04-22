import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearAuthState } from "../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { RootState } from "../store";
import { ChangeEventHandler, SubmitEventHandler } from "../Types/eventTypes";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
      dispatch(clearAuthState());
    }
  }, [error, dispatch]);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    const trimmedEmail = email.trim();
    dispatch(forgotPassword(trimmedEmail) as any).then((result: any) => {
      if (result.payload && !result.error) {
        navigate("/reset-password", { state: { email: trimmedEmail } });
        dispatch(clearAuthState());
      }
    });
  };

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container">
        <div className="card w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white ">
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="input-group" style={{ marginLeft: "55px" }}>
              <label
                htmlFor="email"
                className="text-gray-800 dark:text-gray-300"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={handleEmailChange} // Using typed event handler
                className={
                  emailError
                    ? "border-red-500 w-4/5 p-3 rounded-md"
                    : "w-4/5 p-3 border rounded-md text-gray-900 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                }
              />
              {emailError && (
                <p
                  className="text-sm text-red-500 mt-1"
                  style={{ color: "red" }}
                >
                  {emailError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={loading}
              style={{ marginLeft: "110px" }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
          <div
            className="text-center text-sm text-gray-600 dark:text-gray-400 "
            style={{ marginTop: "10px" }}
          >
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
