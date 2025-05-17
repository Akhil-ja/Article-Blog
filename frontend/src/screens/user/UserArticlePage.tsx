import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getUserArticles,
  deleteArticle,
  blockArticle,
  getArticle,
  clearArticleState,
  getArticleStats,
} from "../../slices/articleSlice";

import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
  Chip,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  DialogContentText,
} from "@mui/material";

import {
  ThumbUp,
  ThumbDown,
  Block,
  Edit,
  Delete,
  Close,
  Add,
  LockOpen,
} from "@mui/icons-material";
import { AppDispatch, RootState } from "../../store";

const UserArticlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const articlesState = useSelector((state: RootState) => state.articles);

  const userArticles = articlesState?.userArticles || [];
  const loading = articlesState?.loading || false;
  const error = articlesState?.error || null;
  const success = articlesState?.success || null;
  const currentArticle = articlesState?.currentArticle || null;

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [blockSnackbar, setBlockSnackbar] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    dispatch(getUserArticles());

    return () => {
      dispatch(clearArticleState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearArticleState());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleCardClick = (articleId: string) => {
    dispatch(getArticle(articleId));
    setOpenDialog(true);
  };

  const handleEditArticle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    articleId: string
  ) => {
    event.stopPropagation();
    navigate(`/user/edit-article/${articleId}`);
  };

  const confirmDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    articleId: any
  ) => {
    event.stopPropagation();
    setSelectedArticleId(articleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteArticle = () => {
    if (selectedArticleId) {
      dispatch(deleteArticle(selectedArticleId));
      setDeleteDialogOpen(false);
      setSelectedArticleId(null);
    }
  };

  const handleBlockToggle = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    articleId: any
  ) => {
    event.stopPropagation();

    const article = userArticles.find((a) => a._id === articleId);
    const message = article?.block ? "Article Unblocked" : "Article Blocked";

    dispatch(blockArticle(articleId));
    dispatch(getUserArticles());

    setBlockSnackbar({
      open: true,
      message,
    });
  };

  const handleCloseBlockSnackbar = () => {
    setBlockSnackbar({
      ...blockSnackbar,
      open: false,
    });
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

  if (loading && userArticles.length === 0) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Your Articles
        </Typography>

        <button
          onClick={() => navigate("/user/create-article")}
          style={{
            backgroundColor: "#1976d2",
            width: "130px",
            height: "30px",
            color: "white",
            border: "none",
            padding: "6px 12px",
            fontSize: "0.875rem",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Add style={{ marginRight: "3px" }} />
          Create New
        </button>
      </Box>

      {success && (
        <Snackbar
          open={!!success}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={3000}
          onClose={() => dispatch(clearArticleState())}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "An error occurred"}
        </Alert>
      )}

      <Snackbar
        open={blockSnackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseBlockSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={blockSnackbar.message}
        action={
          <Button
            size="small"
            color="inherit"
            onClick={handleCloseBlockSnackbar}
          >
            <Close fontSize="small" />
          </Button>
        }
      />

      {userArticles.length === 0 && !loading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.paper"
          p={4}
          borderRadius={1}
          minHeight="50vh"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any articles yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/user/create-article")}
            sx={{ mt: 2 }}
          >
            Create Your First Article
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {userArticles.map((article) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={article._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.2s",
                  opacity: article.block ? 0.8 : 1,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(`/user/article/${article._id}`)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    borderRadius: "8px",
                    padding: "2px 6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    zIndex: 1,
                  }}
                >
                  <ThumbUp sx={{ fontSize: 16, color: "green" }} />
                  <Typography variant="caption">{article.likes}</Typography>
                  <ThumbDown sx={{ fontSize: 16, color: "red" }} />
                  <Typography variant="caption">{article.dislikes}</Typography>
                </Box>

                <CardActionArea onClick={() => handleCardClick(article._id)}>
                  {article.images && article.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={article.images[0]}
                      alt={article.title}
                    />
                  ) : (
                    <Box
                      height={100}
                      bgcolor="grey.300"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="text.secondary" variant="body2">
                        No Image
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box position="relative">
                      {article.block && (
                        <Chip
                          label="Blocked"
                          size="small"
                          color="error"
                          sx={{ position: "absolute", top: -40, right: 0 }}
                        />
                      )}
                      <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="div"
                        noWrap
                      >
                        {article.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        mb: 1,
                        height: 40,
                      }}
                    >
                      {article.description}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.createdAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>

                <CardActions
                  sx={{
                    p: 1,
                    pt: 0,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    alignItems="center"
                  >
                    <Box display="flex">
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditArticle(e, article._id)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleBlockToggle(e, article._id)}
                        color={article.block ? "success" : "warning"}
                        aria-label={
                          article.block ? "Unblock article" : "Block article"
                        }
                      >
                        {article.block ? (
                          <LockOpen fontSize="small" />
                        ) : (
                          <Block fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => confirmDelete(e, article._id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this article? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteArticle}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserArticlePage;
