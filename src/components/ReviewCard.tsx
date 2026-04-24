'use client'

import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Menu, 
  MenuItem, 
  Rating, 
  Typography 
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ReviewCardProps {
  review: any;
  onUpdate?: () => void;
}

export default function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(review.rating || 0);
  const [comment, setComment] = useState(review.review || "");

  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditOpen = () => {
    setEditOpen(true);
    handleMenuClose();
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setRating(review.rating);
    setComment(review.review);
  };

  const handleSaveEdit = async () => {
    console.log("Saving review:", { rating, comment });
    setEditOpen(false);
    if (onUpdate) onUpdate();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <Typography variant="subtitle2" color="textSecondary" className="font-bold">
              Rating
            </Typography>
            <Rating value={review.rating} readOnly size="small" className="mb-2" />
          </div>

          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditOpen}>Edit Review</MenuItem>
            <MenuItem onClick={handleMenuClose} className="text-red-600">Delete</MenuItem>
          </Menu>
        </div>

        <div className="mt-2">
          <Typography variant="body1" className="text-gray-800">
            {review.review}
          </Typography>
          <Typography variant="caption" color="textSecondary" className="block mt-2">
            Reviewed on: {new Date(review.createdAt).toLocaleDateString('th-TH')}
          </Typography>
        </div>
      </div>

      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold text-gray-800">
          Edit Your Review
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          <div>
            <Typography component="legend" className="font-bold text-gray-700 mb-1">Rating *</Typography>
            <Rating
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </div>
          
          <TextField
            label="Your Review"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this dentist..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleEditClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={!rating}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}