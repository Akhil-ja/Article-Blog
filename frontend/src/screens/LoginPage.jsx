import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthState } from "../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Button } from "@mui/material";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (error) {
      dispatch(clearAuthState());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
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
              required
            />
          </div>
          <div className="input-group">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link to="/forgot-password">
                <Button variant="link" className=" p-0">
                  Forgot Password?
                </Button>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
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
