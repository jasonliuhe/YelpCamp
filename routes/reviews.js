const express = require('express');
// if not set mergeParams to true, then we cannot get parameter req.body.review
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Reviews = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Reviews(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Create new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Reviews.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Success delete review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
