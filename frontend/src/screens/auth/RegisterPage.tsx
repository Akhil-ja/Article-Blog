import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthState } from "../../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { RootState } from "../../store";
import { ChangeEventHandler, SubmitEventHandler } from "../../Types/eventTypes";
import { getAllCategories } from "../../slices/userSlice";
import { Margin } from "@mui/icons-material";
import { Checkbox, FormControlLabel } from "@mui/material";

export const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    preferences: [] as string[],
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading: authLoading,
    error,
    user,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const result = await dispatch(getAllCategories() as any);
        if (result.payload?.data?.categories) {
          setCategories(result.payload.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load preferences categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [dispatch]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (error) {
      dispatch(clearAuthState());
    }
  };

  const handlePreferenceChange = (category: string) => {
    setForm((prevForm) => {
      const updatedPreferences = prevForm.preferences.includes(category)
        ? prevForm.preferences.filter((pref) => pref !== category)
        : [...prevForm.preferences, category];

      return { ...prevForm, preferences: updatedPreferences };
    });
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
      preferences: form.preferences,
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
            <Label className={undefined} htmlFor="fullName">
              Full Name
            </Label>
            <Input
              className={undefined}
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter Full Name"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <Label className={undefined} htmlFor="email">
              Email
            </Label>
            <Input
              className={undefined}
              id="email"
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <Label className={undefined} htmlFor="phoneNumber">
              Phone Number
            </Label>
            <Input
              className={undefined}
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <Label htmlFor="password" className={undefined}>
              Password
            </Label>
            <Input
              className={undefined}
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="input-group mt-4">
            <Label className={undefined}>Preferences</Label>
            <div className="preferences-container mt-2 flex flex-wrap gap-4">
              {loading ? (
                <p>Loading preferences...</p>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={form.preferences.includes(category)}
                        onChange={() => handlePreferenceChange(category)}
                        color="primary"
                      />
                    }
                    label={category}
                  />
                ))
              ) : (
                <p>No preferences available</p>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={authLoading}>
            {authLoading ? (
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
