import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getArticle,
  likeArticle,
  dislikeArticle,
} from "../../slices/articleSlice";

import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  AlertPropsColorOverrides,
} from "@mui/material";
import { AlertColor } from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  ArrowBack,
  Person,
  CalendarToday,
  LocalOffer,
  Category,
} from "@mui/icons-material";
import { AppDispatch, RootState } from "../../store";
import { ClickEventHandler } from "../../Types/eventTypes";

function ArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const articlesState = useSelector((state: RootState) => state.articles);
  const article = articlesState?.currentArticle;
  const loading = articlesState?.loading || false;
  const error = articlesState?.error;
  const success = articlesState?.success;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    if (articleId) {
      dispatch(getArticle(articleId));
    }
  }, [dispatch, articleId]);

  useEffect(() => {
    if (article?.userFeedback) {
      setLiked(article.userFeedback === "like");
      setDisliked(article.userFeedback === "dislike");
    } else {
      setLiked(false);
      setDisliked(false);
    }
  }, [article]);

  useEffect(() => {
    if (success) {
      setSnackbarMessage(success);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } else if (error) {
      setSnackbarMessage(error.message || "An error occurred");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [success, error]);

  const handleLike: ClickEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (articleId) {
      dispatch(likeArticle(articleId));
    }
  };

  const handleDislike: ClickEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (articleId) {
      dispatch(dislikeArticle(articleId));
    }
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getAuthorName = (createdBy: any) => {
    if (!createdBy) return "Unknown Author";
    if (typeof createdBy === "string") return "Unknown Author";
    return `${createdBy.name}`;
  };

  const handleNextImage = () => {
    if (article?.images && article.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === article.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (article?.images && article.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? article.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !article) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Article
          </Typography>
          <Typography variant="body1">
            {error.message || "Failed to load the article. Please try again."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/user/home")}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Article Not Found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/user/home")}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/user/home")}
        sx={{ mb: 3 }}
      >
        Back to Articles
      </Button>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {article.title}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Author: {getAuthorName(article.createdBy)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Published: {formatDate(article.createdAt)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <Category sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Category: {article.category || "Uncategorized"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <LocalOffer sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Tags:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} ml={1}>
                {article.tags && article.tags.length > 0 ? (
                  article.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tags
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {article.images && article.images.length > 0 && (
          <Box mb={4} position="relative">
            <Card>
              <CardMedia
                component="img"
                image={article.images[currentImageIndex]}
                alt={`${article.title} - image ${currentImageIndex + 1}`}
                sx={{
                  height: { xs: 250, sm: 350, md: 450 },
                  objectFit: "cover",
                }}
              />
            </Card>

            {article.images.length > 1 && (
              <Box
                position="absolute"
                bottom={10}
                right={10}
                display="flex"
                gap={1}
              >
                <Typography
                  variant="caption"
                  bgcolor="rgba(0,0,0,0.6)"
                  color="white"
                  p={0.5}
                  borderRadius={1}
                >
                  {currentImageIndex + 1} / {article.images.length}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handlePrevImage}
                  sx={{ minWidth: 30, p: 0.5 }}
                >
                  &lt;
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleNextImage}
                  sx={{ minWidth: 30, p: 0.5 }}
                >
                  &gt;
                </Button>
              </Box>
            )}
          </Box>
        )}

        <Typography variant="body1" paragraph>
          {article.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={liked ? "contained" : "outlined"}
                startIcon={<ThumbUp />}
                onClick={handleLike}
                color="primary"
              >
                Like ({article.likes})
              </Button>
              <Button
                variant={disliked ? "contained" : "outlined"}
                startIcon={<ThumbDown />}
                onClick={handleDislike}
                color="error"
              >
                Dislike ({article.dislikes})
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", sm: "flex-end" }}
            ></Stack>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ArticlePage;
