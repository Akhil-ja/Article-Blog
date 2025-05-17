import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllArticles,
  likeArticle,
  dislikeArticle,
  blockArticle,
  getArticle,
  getPreferredArticles,
} from "../../slices/articleSlice";
import { Separator } from "../../components/ui/separator";
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
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Person,
  LocalOffer,
  Close,
} from "@mui/icons-material";
import FloatingCreateButton from "../../components/FloatingCreateButton";
import { AppDispatch, RootState } from "../../store";

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const articlesState = useSelector((state: RootState) => state.articles);
  console.log(articlesState);

  const articles = articlesState?.preferredArticles || [];
  const loading = articlesState?.loading || false;
  const currentArticle = articlesState?.currentArticle || null;

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(getPreferredArticles());
  }, [dispatch]);

  const handleCardClick = (articleId: string) => {
    dispatch(getArticle(articleId));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLike = (
    event: React.MouseEvent<HTMLElement>,
    articleId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const articleToUpdate = articles.find(
      (article) => article._id === articleId
    );
    if (!articleToUpdate) return;

    dispatch(likeArticle(articleId));
  };

  const handleDislike = (
    event: React.MouseEvent<HTMLElement>,
    articleId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const articleToUpdate = articles.find(
      (article) => article._id === articleId
    );
    if (!articleToUpdate) return;

    dispatch(dislikeArticle(articleId));
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
    if (typeof createdBy === "string") {
      return "Unknown Author";
    }
    return `${createdBy.name}`;
  };

  const renderArticleDialog = () => {
    if (!currentArticle) return null;

    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">{currentArticle.title}</Typography>
            <Button
              style={{
                marginLeft: "650px",
                marginBottom: "10px",
              }}
              size="small"
              onClick={handleCloseDialog}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentArticle.images && currentArticle.images.length > 0 && (
            <CardMedia
              component="img"
              height="300"
              image={currentArticle.images[0]}
              alt={currentArticle.title}
              sx={{ borderRadius: 1, mb: 2 }}
            />
          )}

          <Box mb={2}>
            <Typography variant="body1" paragraph>
              {currentArticle.description}
            </Typography>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center">
              <Person fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {typeof currentArticle.createdBy === "object"
                  ? `${currentArticle.createdBy.name}`
                  : "Unknown Author"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatDate(currentArticle.createdAt)}
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {currentArticle.tags &&
              currentArticle.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
          </Box>

          <Box display="flex" alignItems="center">
            <LocalOffer fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {currentArticle.category}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
            px={2}
            py={1}
          >
            <Box>
              <Button
                onClick={(e) => handleLike(e, currentArticle._id)}
                color="primary"
              >
                <ThumbUp />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {currentArticle.likes}
                </Typography>
              </Button>
              <Button
                onClick={(e) => handleDislike(e, currentArticle._id)}
                color="error"
              >
                <ThumbDown />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {currentArticle.dislikes}
                </Typography>
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate(`/user/article/${currentArticle._id}`)}
            >
              View Full Article
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading && articles.length === 0) {
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
      <Typography variant="h4" component="h1" gutterBottom>
        Latest Articles
      </Typography>

      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea onClick={() => handleCardClick(article._id)}>
                {article.images && article.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.images[0]}
                    alt={article.title}
                  />
                ) : (
                  <Box
                    height={140}
                    bgcolor="grey.300"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography color="text.secondary">No Image</Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {article.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {article.description}
                  </Typography>

                  <Box
                    mt={2}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center">
                      <Person
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {getAuthorName(article.createdBy)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.createdAt)}
                    </Typography>
                  </Box>

                  {article.tags && article.tags.length > 0 && (
                    <Box mt={1} sx={{ overflow: "hidden" }}>
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                          variant="outlined"
                        />
                      ))}
                      {article.tags.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{article.tags.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>

              {/* <CardActions sx={{ p: 2, pt: 0 }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleLike(e, article._id)}
                  color="primary"
                >
                  <ThumbUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {article.likes}
                  </Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleDislike(e, article._id)}
                  color="error"
                >
                  <ThumbDown fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {article.dislikes}
                  </Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleBlock(e, article._id)}
                  color="warning"
                >
                  <Block fontSize="small" />
                </IconButton>
              </CardActions> */}
            </Card>
          </Grid>
        ))}
      </Grid>

      {articles.length === 0 && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h6" color="text.secondary">
            No articles found
          </Typography>
        </Box>
      )}

      {renderArticleDialog()}
      <FloatingCreateButton />
    </Container>
  );
};

export default HomePage;
