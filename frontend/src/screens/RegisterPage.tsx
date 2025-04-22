import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthState } from "../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { RootState } from "../store";
import { ChangeEventHandler, SubmitEventHandler } from "../Types/eventTypes";

export const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (error) {
      dispatch(clearAuthState());
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!form.fullName.trim()) {
      toast.error("Full Name is required");
      isValid = false;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address");
      isValid = false;
    }

    if (!form.phoneNumber.trim()) {
      toast.error("Phone Number is required");
      isValid = false;
    } else if (
      !/^\d{10,15}$/.test(form.phoneNumber.trim().replace(/[-()\s]/g, ""))
    ) {
      toast.error("Please enter a valid phone number");
      isValid = false;
    }

    if (!form.password.trim()) {
      toast.error("Password is required");
      isValid = false;
    } else if (form.password.trim().length < 8) {
      toast.error("Password must be at least 8 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const trimmedForm = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password.trim(),
    };

    dispatch(registerUser(trimmedForm) as any).then((result: any) => {
      if (result.payload && !result.error) {
        navigate("/verify-otp", { state: { email: trimmedForm.email } });
        dispatch(clearAuthState());
      }
    });
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
      <div className="card" style={{ height: "80%", padding: "3.95%" }}>
        <h2 className="title">Create Account</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <Label htmlFor="fullName" className={undefined}>
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter Full Name"
              value={form.fullName}
              onChange={handleChange}
              className={undefined}
            />
          </div>
          <div className="input-group">
            <Label htmlFor="email" className={undefined}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              className={undefined}
            />
          </div>
          <div className="input-group">
            <Label htmlFor="phoneNumber" className={undefined}>
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className={undefined}
            />
          </div>
          <div className="input-group">
            <Label htmlFor="password" className={undefined}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={undefined}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loader-icon" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
