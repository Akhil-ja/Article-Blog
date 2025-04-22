import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Image,
  UploadImageData,
  UpdateImageData,
  ImageState,
  RearrangedImageOrder,
} from "../Types/imageTypes";
import api from "../api/apiConfig";

export const uploadImages = createAsyncThunk<
  { images: Image[] },
  UploadImageData,
  { rejectValue: string }
>("images/upload", async (imageData, { rejectWithValue }) => {
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
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Upload failed");
  }
});

export const fetchUserImages = createAsyncThunk<
  { images: Image[] },
  void,
  { rejectValue: string }
>("images/fetchUserImages", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/images");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to fetch images");
  }
});

export const updateImage = createAsyncThunk<
  { image: Image },
  UpdateImageData,
  { rejectValue: string }
>("images/update", async ({ id, imageData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`api/images/${id}`, imageData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Update failed");
  }
});

export const deleteImage = createAsyncThunk<
  { _id: string },
  string,
  { rejectValue: string }
>("images/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`api/images/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Delete failed");
  }
});

export const rearrangeImages = createAsyncThunk<
  { images: Image[] },
  RearrangedImageOrder["imageOrders"],
  { rejectValue: string }
>("images/rearrange", async (imageOrders, { rejectWithValue }) => {
  try {
    const response = await api.post("api/images/rearrange", { imageOrders });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Rearrange failed");
  }
});

const initialState: ImageState = {
  images: [],
  loading: false,
  error: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
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
        state.error = action.payload || "Upload failed";
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
        state.error = action.payload || "Fetch failed";
      })
      .addCase(updateImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.images.findIndex(
          (img) => img._id === action.payload.image._id
        );
        if (index !== -1) {
          state.images[index] = action.payload.image;
        }
      })
      .addCase(updateImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update failed";
      })
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter(
          (img) => img._id !== action.payload._id
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
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
        state.error = action.payload || "Rearrange failed";
      });
  },
});

export const { clearImages } = imageSlice.actions;
export default imageSlice.reducer;
