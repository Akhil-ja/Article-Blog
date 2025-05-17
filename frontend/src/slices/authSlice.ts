import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserData, AuthState } from "../Types/userType";
import api from "../api/apiConfig";

export const registerUser = createAsyncThunk<
  any,
  UserData,
  { rejectValue: any }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("api/auth/register", userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const loginUser = createAsyncThunk<any, UserData, { rejectValue: any }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("api/auth/login", credentials);
      localStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk<null, void, { rejectValue: any }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("api/auth/logout");
      localStorage.removeItem("authInfo");
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgotPassword = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await api.post("api/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const resetPassword = createAsyncThunk<any, any, { rejectValue: any }>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/auth/reset-password", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resendVerificationOTP = createAsyncThunk<
  any,
  { email: string },
  { rejectValue: any }
>("auth/resendOTP", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await api.post("api/auth/resend-verification", { email });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const verifyEmail = createAsyncThunk<any, any, { rejectValue: any }>(
  "auth/verifyEmail",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/auth/verify-email", data);
      localStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendVerificationOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(resendVerificationOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
