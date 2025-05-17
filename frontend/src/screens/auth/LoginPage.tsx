import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthState } from "../../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Button } from "@mui/material";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { RootState } from "../../store";
import { ChangeEventHandler, SubmitEventHandler } from "../../Types/eventTypes";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }

    if (error) {
      dispatch(clearAuthState());
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!form.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!form.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const trimmedForm = {
      email: form.email.trim(),
      password: form.password.trim(),
    };

    dispatch(loginUser(trimmedForm) as any);
  };

  useEffect(() => {
    if (user) {
      navigate("/user/home");
    }
    if (error) {
      toast.error(error.message);
    }
  }, [user, error, navigate]);

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Login</h2>
        <p className="description">
          Enter your credentials to access your account
        </p>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={handleChange}
              value={form.email}
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-sm mt-1" style={{ color: "red" }}>
                {formErrors.email}
              </p>
            )}
          </div>
          <div className="input-group">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link to="/forgot-password">
                <Button className="p-0">Forgot Password?</Button>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              className={formErrors.password ? "border-red-500" : ""}
            />
            {formErrors.password && (
              <p className="text-sm mt-1" style={{ color: "red" }}>
                {formErrors.password}
              </p>
            )}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loader-icon" />
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <p className="signup-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
