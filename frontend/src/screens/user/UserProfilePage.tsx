import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateProfile,
  changePassword,
  getUserPreferences,
  updatePreferences,
  getAllCategories,
  clearUserState,
} from "../../slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Tab,
  Tabs,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  FormGroup,
} from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, preferences, categories, loading, error, success } =
    useSelector((state: RootState) => state.user);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [passwordError, setPasswordError] = useState("");
  const [profileError, setProfileError] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(getUserPreferences());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      const nameParts = profile.name.split(" ");
      setProfileForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phoneNumber: profile.phoneNumber || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setSelectedPreferences(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value.trim(),
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value.trim(),
    });
  };

  const handlePreferenceChange = (category: string) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(category)) {
        return prev.filter((p) => p !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePasswordSubmit = () => {
    setPasswordError("");

    const trimmedCurrentPassword = passwordForm.currentPassword.trim();
    const trimmedNewPassword = passwordForm.newPassword.trim();
    const trimmedConfirmPassword = passwordForm.confirmPassword.trim();

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (trimmedNewPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    dispatch(
      changePassword({
        currentPassword: trimmedCurrentPassword,
        newPassword: trimmedNewPassword,
      })
    );

    if (!error) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
    }
  };

  const handleProfileSubmit = () => {
    setProfileError("");

    const trimmedFirstName = profileForm.firstName.trim();
    const trimmedLastName = profileForm.lastName.trim();
    const trimmedPhoneNumber = profileForm.phoneNumber.trim();

    if (!trimmedFirstName) {
      setProfileError("First name is required");
      return;
    }

    dispatch(
      updateProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phoneNumber: trimmedPhoneNumber,
      })
    );

    if (!error) {
      setIsProfileDialogOpen(false);
    }
  };

  const handlePreferencesSubmit = () => {
    // Ensure all preference strings are trimmed
    const trimmedPreferences = selectedPreferences.map((pref) => pref.trim());

    dispatch(updatePreferences({ preferences: trimmedPreferences }));

    if (!error) {
      setIsPreferencesDialogOpen(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "Something went wrong"}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1">
              User Profile
            </Typography>
          }
          subheader="Manage your personal information and preferences"
        />
        <Divider />

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
            >
              <Tab label="Personal Info" />
              <Tab label="Security" />
              <Tab label="Preferences" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Name
                </Typography>
                <Typography variant="body1">{profile?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Email
                </Typography>
                <Typography variant="body1">{profile?.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {profile?.phoneNumber || "Not set"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsProfileDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              Account Security
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Manage your password and account security settings.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Content Preferences
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Current preferences:{" "}
              {preferences.length > 0 ? preferences.join(", ") : "None set"}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsPreferencesDialogOpen(true)}
            >
              Edit Preferences
            </Button>
          </TabPanel>
        </Box>
      </Paper>

      <Dialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your current password and choose a new one.
          </DialogContentText>

          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          <TextField
            margin="dense"
            id="currentPassword"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsPasswordDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update your personal information.
          </DialogContentText>

          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}

          <TextField
            margin="dense"
            id="firstName"
            name="firstName"
            label="First Name"
            fullWidth
            variant="outlined"
            value={profileForm.firstName}
            onChange={handleProfileChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="lastName"
            name="lastName"
            label="Last Name"
            fullWidth
            variant="outlined"
            value={profileForm.lastName}
            onChange={handleProfileChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={profileForm.phoneNumber}
            onChange={handleProfileChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsProfileDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleProfileSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPreferencesDialogOpen}
        onClose={() => setIsPreferencesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Content Preferences</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Choose categories of content you're interested in.
          </DialogContentText>

          <FormGroup sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={6} key={category}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPreferences.includes(category)}
                        onChange={() => handlePreferenceChange(category)}
                        name={category}
                      />
                    }
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsPreferencesDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePreferencesSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfilePage;
