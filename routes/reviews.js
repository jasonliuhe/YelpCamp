const express = require('express');
// if not set mergeParams to true, then we cannot get parameter req.body.review
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
