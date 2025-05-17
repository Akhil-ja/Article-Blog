import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserActivities } from "../../slices/userSlice";
import { AppDispatch, RootState } from "../../store";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import SortIcon from "@mui/icons-material/Sort";
import { format } from "date-fns";
import { Activity } from "../../Types/userType";

const UserActivityPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(getUserActivities());
  }, [dispatch]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as "newest" | "oldest");
  };

  const sortedActivities = [...(activities || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const displayedActivities = sortedActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error.message || "Failed to load activities"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Activity History
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          View articles you've liked or disliked
        </Typography>
      </Box>

      {/* Sort control */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel id="sort-order-label" style={{ paddingBottom: "10px" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SortIcon sx={{ mr: 1 }} fontSize="small" />
              Sort By
            </Box>
          </InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {displayedActivities.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 8 }}>
          <Typography variant="h6" color="text.secondary">
            You haven't liked or disliked any articles yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedActivities.map((activity: Activity) => (
            <Grid item xs={12} key={activity._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {activity.articleId.title}
                    </Typography>
                    <Chip
                      icon={
                        activity.type === "like" ? (
                          <ThumbUpIcon />
                        ) : (
                          <ThumbDownIcon />
                        )
                      }
                      color={activity.type === "like" ? "success" : "error"}
                      label={activity.type === "like" ? "Liked" : "Disliked"}
                      size="small"
                    />
                  </Box>

                  {activity.articleId.summary && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {activity.articleId.summary.length > 150
                        ? `${activity.articleId.summary.substring(0, 150)}...`
                        : activity.articleId.summary}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary">
                    {format(
                      new Date(activity.createdAt),
                      "MMMM d, yyyy • h:mm a"
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default UserActivityPage;
