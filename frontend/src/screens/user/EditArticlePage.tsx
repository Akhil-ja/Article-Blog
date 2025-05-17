import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Chip,
  IconButton,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import {
  getArticle,
  updateArticle,
  clearArticleState,
  clearCurrentArticle,
} from "../../slices/articleSlice";
import { getAllCategories } from "../../slices/userSlice";
import { RootState, AppDispatch } from "../../store";

const MAX_TAGS = 3;
const MAX_IMAGES = 5;
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;

interface ArticleForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: File[];
  imagePreviewUrls: string[];
  existingImages: string[];
  imagesToRemove: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  tags?: string;
  images?: string;
}

const EditArticlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [categories, setCategories] = useState<string[]>([]);

  const { loading, error, success, currentArticle } = useSelector(
    (state: RootState) => state.articles
  );

  const [formData, setFormData] = useState<ArticleForm>({
    title: "",
    description: "",
    category: "",
    tags: [],
    images: [],
    imagePreviewUrls: [],
    existingImages: [],
    imagesToRemove: [],
  });

  const [newTag, setNewTag] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await dispatch(getAllCategories() as any);
        if (result.payload?.data?.categories) {
          setCategories(result.payload.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [dispatch]);
  useEffect(() => {
    if (articleId) {
      dispatch(getArticle(articleId));
    }

    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [dispatch, articleId]);

  useEffect(() => {
    if (currentArticle) {
      setFormData({
        title: currentArticle.title || "",
        description: currentArticle.description || "",
        category: currentArticle.category || "",
        tags: currentArticle.tags || [],
        images: [],
        imagePreviewUrls: [],
        existingImages: currentArticle.images || [],
        imagesToRemove: [],
      });
      setIsLoading(false);
    }
  }, [currentArticle]);

  useEffect(() => {
    dispatch(clearArticleState());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/user/my-articles");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      if (errors[name as keyof FormErrors]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = () => {
    if (
      newTag.trim() &&
      formData.tags.length < MAX_TAGS &&
      !formData.tags.includes(newTag.trim())
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");

      if (errors.tags) {
        setErrors({
          ...errors,
          tags: undefined,
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToDelete),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      const newImageUrls: string[] = [];
      let hasError = false;

      if (
        formData.existingImages.length + formData.images.length + files.length >
        MAX_IMAGES
      ) {
        setErrors({
          ...errors,
          images: `You can upload a maximum of ${MAX_IMAGES} images.`,
        });
        return;
      }

      Array.from(files).forEach((file) => {
        if (file.size > IMAGE_SIZE_LIMIT) {
          setErrors({
            ...errors,
            images: `Image "${file.name}" exceeds the 10MB size limit.`,
          });
          hasError = true;
          return;
        }

        if (!file.type.startsWith("image/")) {
          setErrors({
            ...errors,
            images: `File "${file.name}" is not an image.`,
          });
          hasError = true;
          return;
        }

        newImages.push(file);
        newImageUrls.push(URL.createObjectURL(file));
      });

      if (!hasError) {
        setFormData({
          ...formData,
          images: [...formData.images, ...newImages],
          imagePreviewUrls: [...formData.imagePreviewUrls, ...newImageUrls],
        });

        if (errors.images) {
          setErrors({
            ...errors,
            images: undefined,
          });
        }
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    const newImageUrls = [...formData.imagePreviewUrls];

    URL.revokeObjectURL(newImageUrls[index]);

    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);

    setFormData({
      ...formData,
      images: newImages,
      imagePreviewUrls: newImageUrls,
    });
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages.filter((url) => url !== imageUrl),
      imagesToRemove: [...formData.imagesToRemove, imageUrl],
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (validateForm() && articleId) {
      const articleFormData = new FormData();
      articleFormData.append("title", formData.title);
      articleFormData.append("description", formData.description);
      articleFormData.append("category", formData.category);

      if (formData.tags.length > 0) {
        articleFormData.append("tags", JSON.stringify(formData.tags));
      }

      formData.images.forEach((image) => {
        articleFormData.append("images", image);
      });

      if (formData.imagesToRemove.length > 0) {
        articleFormData.append(
          "removeImages",
          JSON.stringify(formData.imagesToRemove)
        );
      }

      dispatch(updateArticle({ id: articleId, data: articleFormData }));
    }
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Article
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === "string"
              ? error
              : error?.message ||
                "An error occurred while updating the article"}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Article updated successfully! Redirecting to your articles...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Article Title"
                variant="outlined"
                fullWidth
                required
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                disabled={loading}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                  required
                  disabled={loading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12} sm={6}>
              <Box>
                <TextField
                  label="Add Tags (up to 3)"
                  variant="outlined"
                  fullWidth
                  value={newTag}
                  onChange={handleTagInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!errors.tags}
                  helperText={
                    errors.tags || `${formData.tags.length}/${MAX_TAGS} tags`
                  }
                  disabled={formData.tags.length >= MAX_TAGS || loading}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={handleAddTag}
                        disabled={
                          !newTag.trim() ||
                          formData.tags.length >= MAX_TAGS ||
                          loading
                        }
                        sx={{ ml: 1 }}
                      >
                        Add
                      </Button>
                    ),
                  }}
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      disabled={loading}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Article Description"
                variant="outlined"
                multiline
                rows={6}
                fullWidth
                required
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Images (Optional - Max 5 images, 10MB each)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  disabled={
                    formData.existingImages.length + formData.images.length >=
                      MAX_IMAGES || loading
                  }
                >
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                    disabled={
                      formData.existingImages.length + formData.images.length >=
                        MAX_IMAGES || loading
                    }
                  />
                </Button>
                {errors.images && (
                  <FormHelperText error>{errors.images}</FormHelperText>
                )}
              </Box>

              {/* Display Existing Images */}
              {formData.existingImages.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Existing Images
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {formData.existingImages.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`existing-${index}`}>
                        <Card>
                          <Box
                            sx={{
                              height: 140,
                              position: "relative",
                              backgroundImage: `url(${url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <Button
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                bgcolor: "rgba(255, 255, 255, 0.7)",
                                "&:hover": {
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                },
                              }}
                              onClick={() => handleRemoveExistingImage(url)}
                              disabled={loading}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Box>
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="caption" noWrap>
                              Existing Image
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {/* Display New Images */}
              {formData.imagePreviewUrls.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    New Images
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.imagePreviewUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
                        <Card>
                          <Box
                            sx={{
                              height: 140,
                              position: "relative",
                              backgroundImage: `url(${url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <Button
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                bgcolor: "rgba(255, 255, 255, 0.7)",
                                "&:hover": {
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                },
                              }}
                              onClick={() => handleRemoveImage(index)}
                              disabled={loading}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Box>
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="caption" noWrap>
                              {formData.images[index].name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Article"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditArticlePage;
