import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/apiConfig";

interface Article {
  _id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  createdBy:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
      };
  likes: number;
  dislikes: number;
  block: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackResponse {
  likes: number;
  dislikes: number;
}

interface ArticleState {
  articles: Article[];
  userArticles: Article[];
  preferredArticles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: any;
  success: string | null;
  feedback: FeedbackResponse | null;
  processingFeedback: { [key: string]: boolean };
  feedbackType: string;
}

export const createArticle = createAsyncThunk<
  any,
  FormData,
  { rejectValue: any }
>("articles/create", async (articleData, { rejectWithValue }) => {
  try {
    const response = await api.post("api/article", articleData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getAllArticles = createAsyncThunk<any, void, { rejectValue: any }>(
  "articles/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/article");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getPreferredArticles = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>("articles/getPreferred", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/article/preferences");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getUserArticles = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>("articles/getUserArticles", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("api/article/my-articles");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const getArticle = createAsyncThunk<any, string, { rejectValue: any }>(
  "articles/getOne",
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/article/${articleId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateArticle = createAsyncThunk<
  any,
  { id: string; data: FormData },
  { rejectValue: any }
>("articles/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`api/article/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteArticle = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>("articles/delete", async (articleId, { rejectWithValue }) => {
  try {
    await api.delete(`api/article/${articleId}`);
    return articleId;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const likeArticle = createAsyncThunk<
  any,
  string,
  { rejectValue: any; state: { articles: ArticleState } }
>("articles/like", async (articleId, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const currentArticle = state.articles.currentArticle;

    const response = await api.post(`api/article/${articleId}/like`);
    return { id: articleId, ...response.data };
  } catch (error: any) {
    return rejectWithValue({ id: articleId, error: error.response.data });
  }
});

export const dislikeArticle = createAsyncThunk<
  any,
  string,
  { rejectValue: any; state: { articles: ArticleState } }
>("articles/dislike", async (articleId, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const currentArticle = state.articles.currentArticle;

    const response = await api.post(`api/article/${articleId}/dislike`);
    return { id: articleId, ...response.data };
  } catch (error: any) {
    return rejectWithValue({ id: articleId, error: error.response.data });
  }
});

export const blockArticle = createAsyncThunk<
  any,
  string,
  { rejectValue: any; state: { articles: ArticleState } }
>("articles/block", async (articleId, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const currentArticle = state.articles.currentArticle;

    const response = await api.post(`api/article/${articleId}/block`);
    return { id: articleId, ...response.data };
  } catch (error: any) {
    return rejectWithValue({ id: articleId, error: error.response.data });
  }
});

export const getArticleStats = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>("articles/stats", async (articleId, { rejectWithValue }) => {
  try {
    const response = await api.get(`api/article/${articleId}/stats`);
    return { id: articleId, ...response.data };
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

const initialState: ArticleState = {
  articles: [],
  userArticles: [],
  preferredArticles: [],
  currentArticle: null,
  loading: false,
  error: null,
  success: null,
  feedback: null,
  processingFeedback: {},
  feedbackType: "",
};

const updateArticleFeedbackInState = (
  state: ArticleState,
  articleId: string,
  feedbackData: FeedbackResponse
) => {
  const updateInList = (list: Article[]) => {
    return list.map((article) => {
      if (article._id === articleId) {
        return {
          ...article,
          likes: feedbackData.likes,
          dislikes: feedbackData.dislikes,
        };
      }
      return article;
    });
  };

  state.articles = updateInList(state.articles);
  state.userArticles = updateInList(state.userArticles);
  state.preferredArticles = updateInList(state.preferredArticles);

  if (state.currentArticle && state.currentArticle._id === articleId) {
    state.currentArticle = {
      ...state.currentArticle,
      likes: feedbackData.likes,
      dislikes: feedbackData.dislikes,
    };
  }
};

const articleSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearArticleState: (state) => {
      state.error = null;
      state.success = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Article created successfully";
        state.userArticles.unshift(action.payload.data.article);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.data.articles;
      })
      .addCase(getAllArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPreferredArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPreferredArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.preferredArticles = action.payload.data.articles;
      })
      .addCase(getPreferredArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.userArticles = action.payload.data.articles;
      })
      .addCase(getUserArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload.data.article;
      })
      .addCase(getArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Article updated successfully";
        state.currentArticle = action.payload.data.article;

        const updatedArticle = action.payload.data.article;
        state.articles = state.articles.map((article) =>
          article._id === updatedArticle._id ? updatedArticle : article
        );
        state.userArticles = state.userArticles.map((article) =>
          article._id === updatedArticle._id ? updatedArticle : article
        );
        state.preferredArticles = state.preferredArticles.map((article) =>
          article._id === updatedArticle._id ? updatedArticle : article
        );
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Article deleted successfully";

        const articleId = action.payload;
        state.articles = state.articles.filter(
          (article) => article._id !== articleId
        );
        state.userArticles = state.userArticles.filter(
          (article) => article._id !== articleId
        );
        state.preferredArticles = state.preferredArticles.filter(
          (article) => article._id !== articleId
        );

        if (state.currentArticle && state.currentArticle._id === articleId) {
          state.currentArticle = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(likeArticle.pending, (state, action) => {
        state.error = null;
      })
      .addCase(likeArticle.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        updateArticleFeedbackInState(state, id, data);
        state.feedbackType = "like";
      })
      .addCase(likeArticle.rejected, (state, action: any) => {
        if (action.payload && action.payload.id) {
          delete state.processingFeedback[action.payload.id];
        }

        state.error = action.payload?.error || action.error;

        if (action.payload && action.payload.id) {
        }
      })

      .addCase(dislikeArticle.pending, (state, action) => {
        state.error = null;
      })
      .addCase(dislikeArticle.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        updateArticleFeedbackInState(state, id, data);
        state.feedbackType = "dislike";
      })
      .addCase(dislikeArticle.rejected, (state, action: any) => {
        if (action.payload && action.payload.id) {
          delete state.processingFeedback[action.payload.id];
        }

        state.error = action.payload?.error || action.error;
      })

      .addCase(blockArticle.pending, (state) => {
        state.error = null;
      })

      .addCase(blockArticle.fulfilled, (state, action) => {
        state.error = null;

        const { id, data } = action.payload;

        const index = state.articles.findIndex((article) => article._id === id);
        if (index !== -1) {
          state.articles[index].block = data.block;
        }

        const userIndex = state.userArticles.findIndex(
          (article) => article._id === id
        );
        if (userIndex !== -1) {
          state.userArticles[userIndex].block = data.block;
        }

        if (state.currentArticle && state.currentArticle._id === id) {
          state.currentArticle.block = data.block;
        }

        state.success = data.block
          ? "Article blocked successfully"
          : "Article unblocked successfully";
      })

      .addCase(blockArticle.rejected, (state, action: any) => {
        state.error = action.payload?.error || action.error;
      })

      .addCase(getArticleStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleStats.fulfilled, (state, action) => {
        state.loading = false;
        state.feedback = action.payload.data;

        const { id, data } = action.payload;
        if (state.currentArticle && state.currentArticle._id === id) {
          state.currentArticle = {
            ...state.currentArticle,
            likes: data.likes,
            dislikes: data.dislikes,
          };
        }
      })
      .addCase(getArticleStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearArticleState, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;
