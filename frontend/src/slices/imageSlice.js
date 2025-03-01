import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/apiConfig";

export const uploadImages = createAsyncThunk(
  "images/upload",
  async (imageData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      imageData.files.forEach((file) => {
        formData.append("images", file);
      });

      imageData.titles.forEach((title) => {
        formData.append("titles[]", title);
      });

      const response = await api.post("api/images/upload", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserImages = createAsyncThunk(
  "images/fetchUserImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/images");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateImage = createAsyncThunk(
  "images/update",
  async ({ id, imageData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`api/images/${id}`, imageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteImage = createAsyncThunk(
  "images/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`api/images/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rearrangeImages = createAsyncThunk(
  "images/rearrange",
  async (imageOrders, { rejectWithValue }) => {
    try {
      const response = await api.post("api/images/rearrange", { imageOrders });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const imageSlice = createSlice({
  name: "image",
  initialState: {
    images: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearImages: (state) => {
      state.images = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images.push(...action.payload.images);
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload.images;
      })
      .addCase(fetchUserImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.images.findIndex(
          (image) => image._id === action.payload.image._id
        );
        if (index !== -1) {
          state.images[index] = action.payload.image;
        }
      })
      .addCase(updateImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter(
          (image) => image._id !== action.payload._id
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(rearrangeImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(rearrangeImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload.images;
      })
      .addCase(rearrangeImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearImages } = imageSlice.actions;
export default imageSlice.reducer;
