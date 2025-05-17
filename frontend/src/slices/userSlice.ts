import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  UserState,
  UserProfile,
  UserPreferences,
  FeedbackType,
} from "../Types/userType";
import api from "../api/apiConfig";

export const getUserProfile = createAsyncThunk<any, void, { rejectValue: any }>(
  "user/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/user/profile");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProfile = createAsyncThunk<
  any,
  Partial<UserProfile>,
  { rejectValue: any }
>("user/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put("api/user/profile", profileData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const changePassword = createAsyncThunk<
  any,
  { currentPassword: string; newPassword: string },
  { rejectValue: any }
>("user/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const response = await api.put("api/user/change-password", passwordData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getUserPreferences = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>("user/preferences", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/user/preferences");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const updatePreferences = createAsyncThunk<
  any,
  { preferences: string[] },
  { rejectValue: any }
>("user/updatePreferences", async (preferencesData, { rejectWithValue }) => {
  try {
    const response = await api.put("api/user/preferences", preferencesData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getAllCategories = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>("user/categories", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/user/categories");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getUserActivities = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>("user/activities", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/user/activities");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

const initialState: UserState = {
  profile: null,
  preferences: [],
  categories: [],
  activities: [],
  loading: false,
  error: null,
  success: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data.user;
        state.success = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload.data.preferences;
      })
      .addCase(getUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload.data.user.preferences;
        state.success = "Preferences updated successfully";
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data.categories;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.data.activities;
      })
      .addCase(getUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
