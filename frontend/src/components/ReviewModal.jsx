import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';
import { reviewService } from './ReviewService';
import './ReviewModal.css'

function ReviewModal({ show, onHide, booking, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Review comment must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData = {
        bookingId: booking.id,
        providerId: booking.providerId,
        rating: rating,
        comment: comment.trim()
      };

      console.log('Submitting review:', reviewData);

      const result = await reviewService.submitReview(reviewData);
      
      if (result.success) {
        console.log('✅ Review submitted successfully:', result.data);
        
        // Reset form
        setRating(0);
        setComment('');
        
        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        
        // Close modal
        onHide();
      } else {
        setError(result.error || 'Failed to submit review');
      }
      
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="me-1"
          style={{ cursor: 'pointer', fontSize: '2rem' }}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          {i <= (hoverRating || rating) ? (
            <StarFill className="text-warning" />
          ) : (
            <Star className="text-warning" />
          )}
        </span>
      );
    }
    return stars;
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    setHoverRating(0);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rate Your Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {booking && (
          <div className="mb-3">
            <h6>Service: {booking.serviceType}</h6>
            <p className="text-muted mb-0">Provider: {booking.providerName}</p>
            <p className="text-muted">Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3 text-center">
            <Form.Label className="fw-bold">How would you rate the service? *</Form.Label>
            <div className="my-3">
              {renderStars()}
            </div>
            <div className="text-muted">
              {rating > 0 && `Selected: ${rating} star${rating > 1 ? 's' : ''}`}
              {rating === 0 && 'Please select a rating'}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Review * (Minimum 10 characters)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Share your experience with this service provider..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              required
              isInvalid={comment.length > 0 && comment.length < 10}
            />
            <Form.Text className="text-muted">
              {comment.length}/500 characters {comment.length > 0 && comment.length < 10 && ' - Minimum 10 characters required'}
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading || rating === 0 || !comment.trim() || comment.trim().length < 10}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ReviewModal;