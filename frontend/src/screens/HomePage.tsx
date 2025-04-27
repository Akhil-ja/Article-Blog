/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
// @ts-nocheck
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import React from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserImages,
  deleteImage,
  updateImage,
  rearrangeImages,
  uploadImages,
} from "../slices/imageSlice";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Container,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { RootState } from "../store";

const EditImageDialog = React.memo(
  ({ open, handleClose, image, handleSaveEdit }) => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (image) {
        setTitle(image.title || "");
        setPreviewUrl(image.imageUrl || "");
      }
    }, [image]);
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    };

    const handleSubmit = () => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        toast.error("Title cannot be empty");
        return;
      }

      const imageData = new FormData();
      imageData.append("title", trimmedTitle);
      if (file) {
        imageData.append("image", file);
      }
      handleSaveEdit(image._id, imageData);
      handleClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 1 }}>
            <TextField
              label="Image Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
            />

            <Box sx={{ textAlign: "center", my: 2 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "contain",
                  marginBottom: "16px",
                }}
              />

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Choose New Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

const DraggableImageItem = React.memo(
  ({ image, index, moveImage, handleEdit, handleDelete }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
      type: "IMAGE_ITEM",
      item: { id: image._id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "IMAGE_ITEM",
      hover: (item) => {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        moveImage(dragIndex, hoverIndex);

        item.index = hoverIndex;
      },
    });

    drag(drop(ref));

    const onEdit = useCallback(() => handleEdit(image), [handleEdit, image]);
    const onDelete = useCallback(
      () => handleDelete(image._id),
      [handleDelete, image._id]
    );

    return (
      <Card
        ref={ref}
        elevation={2}
        sx={{
          display: "flex",
          margin: "16px 0",
          opacity: isDragging ? 0.5 : 1,
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50px",
            backgroundColor: "#f5f5f5",
            cursor: "move",
          }}
        >
          <DragHandleIcon />
        </Box>

        <CardMedia
          component="img"
          sx={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
          }}
          image={image.imageUrl}
          alt={image.title}
        />

        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <CardContent sx={{ flex: "1 0 auto", pb: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, wordBreak: "break-word" }}>
              {image.title}
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
            >
              Delete
            </Button>
          </CardActions>
        </Box>
      </Card>
    );
  }
);

function HomePage() {
  const dispatch = useDispatch();
  const { images, loading, error } = useSelector(
    (state: RootState) => state.image
  );
  const [uploadQueue, setUploadQueue] = useState([]);
  const [imageTitles, setImageTitles] = useState([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [localImages, setLocalImages] = useState([]);
  const fileInputRef = useRef(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditImage, setCurrentEditImage] = useState(null);

  useEffect(() => {
    dispatch(fetchUserImages() as any);
  }, [dispatch]);

  useEffect(() => {
    if (images && images.length > 0) {
      setLocalImages(images);
    }
  }, [images]);

  const handleDelete = useCallback(
    (id) => {
      dispatch(deleteImage(id) as any).then(() => {
        dispatch(fetchUserImages() as any);
      });
    },
    [dispatch]
  );

  const handleEdit = useCallback((image) => {
    setCurrentEditImage(image);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(
    (id, imageData) => {
      dispatch(updateImage({ id, imageData }) as any).then(() => {
        dispatch(fetchUserImages() as any);
        setEditDialogOpen(false);
        setCurrentEditImage(null);
      });
    },
    [dispatch]
  );

  const handleFileSelection = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setUploadQueue(files);
      setImageTitles(files.map(() => ""));
    }
  }, []);

  const handleUploadTitleChange = useCallback((index, value) => {
    setImageTitles((prevTitles) => {
      const newTitles = [...prevTitles];
      newTitles[index] = value;
      return newTitles;
    });
  }, []);

  const handleUploadImages = useCallback(() => {
    if (uploadQueue.length === 0) return;

    const imageData = {
      files: uploadQueue,
      titles: imageTitles,
    };

    dispatch(uploadImages(imageData) as any).then(() => {
      setUploadQueue([]);
      setImageTitles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    });
  }, [dispatch, uploadQueue, imageTitles]);

  const arraysHaveSameOrder = useCallback((arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item._id === arr2[index]._id);
  }, []);

  const moveImage = useCallback(
    (dragIndex, hoverIndex) => {
      setLocalImages((prevImages) => {
        const updatedImages = [...prevImages];
        const [movedImage] = updatedImages.splice(dragIndex, 1);
        updatedImages.splice(hoverIndex, 0, movedImage);

        const orderChanged = !arraysHaveSameOrder(images, updatedImages);
        setHasOrderChanged(orderChanged);

        return updatedImages;
      });
    },
    [images, arraysHaveSameOrder]
  );

  const saveOrderChanges = useCallback(() => {
    const imageOrders = localImages.map((image, index) => ({
      id: image._id,
      order: index,
    }));

    dispatch(rearrangeImages(imageOrders) as any).then(() => {
      setHasOrderChanged(false);
    });
  }, [dispatch, localImages]);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setCurrentEditImage(null);
  }, []);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setUploadQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue.splice(index, 1);
      return newQueue;
    });

    setImageTitles((prevTitles) => {
      const newTitles = [...prevTitles];
      newTitles.splice(index, 1);
      return newTitles;
    });
  }, []);

  const uploadQueueSection = useMemo(() => {
    if (uploadQueue.length === 0) return null;

    return (
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Images to upload:
        </Typography>
        <Grid container spacing={2}>
          {uploadQueue.map((file, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card elevation={2}>
                <Box sx={{ display: "flex" }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                    image={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      p: 2,
                    }}
                  >
                    <TextField
                      variant="outlined"
                      label="Image Title"
                      fullWidth
                      value={imageTitles[index]}
                      onChange={(e) =>
                        handleUploadTitleChange(index, e.target.value)
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveFromQueue(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          onClick={handleUploadImages}
          disabled={uploadQueue.some((_, i) => !imageTitles[i])}
          sx={{ mt: 2 }}
          startIcon={<CloudUploadIcon />}
        >
          Upload All Images
        </Button>
      </Box>
    );
  }, [
    uploadQueue,
    imageTitles,
    handleUploadTitleChange,
    handleRemoveFromQueue,
    handleUploadImages,
  ]);

  const isUploadDisabled = useMemo(() => {
    return uploadQueue.some((_, i) => !imageTitles[i]);
  }, [uploadQueue, imageTitles]);

  const renderLoadingSkeletons = () => (
    <Box sx={{ mt: 4 }}>
      {[1, 2, 3].map((i) => (
        <Card key={i} sx={{ display: "flex", mb: 2, height: "150px" }}>
          <Skeleton variant="rectangular" width={50} height="100%" />
          <Skeleton variant="rectangular" width={150} height="100%" />
          <Box sx={{ flex: 1, p: 2 }}>
            <Skeleton variant="text" width="80%" height={40} />
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}
            >
              <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                sx={{ mr: 1 }}
              />
              <Skeleton variant="rectangular" width={80} height={36} />
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );

  const pageContent = (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        Image Gallery
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload New Images
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Select Images
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelection}
            ref={fileInputRef}
          />
        </Button>
        {uploadQueueSection}
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Your Images</Typography>

          {hasOrderChanged && (
            <Button
              variant="contained"
              color="primary"
              onClick={saveOrderChanges}
              sx={{ fontWeight: "bold" }}
            >
              Save Order Changes
            </Button>
          )}
        </Box>

        {loading ? (
          renderLoadingSkeletons()
        ) : error ? (
          <Paper sx={{ p: 3, bgcolor: "#ffebee" }}>
            <Typography color="error" variant="h6">
              Error loading images
            </Typography>
            <Typography color="error">
              {error.message || JSON.stringify(error)}
            </Typography>
          </Paper>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <Box>
              {localImages.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography sx={{ color: "#666" }}>
                    No images yet. Upload some!
                  </Typography>
                </Paper>
              ) : (
                localImages.map((image, index) => (
                  <DraggableImageItem
                    key={image._id}
                    image={image}
                    index={index}
                    moveImage={moveImage}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                  />
                ))
              )}
            </Box>
          </DndProvider>
        )}
      </Box>

      {/* Edit Dialog */}
      <EditImageDialog
        open={editDialogOpen}
        handleClose={handleCloseEditDialog}
        image={currentEditImage}
        handleSaveEdit={handleSaveEdit}
      />
    </Container>
  );

  const loadingOverlay = loading && (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );

  return (
    <>
      {loadingOverlay}
      {pageContent}
    </>
  );
}

export default HomePage;
