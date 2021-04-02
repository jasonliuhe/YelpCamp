const express = require('express');
// if not set mergeParams to true, then we cannot get parameter req.body.review
const router = express.Router({mergeParams: true});
const {reviewSchema} = require('../schemas');
const Campground = require('../models/campground');
const Reviews = require('../models/review');
const ExpressError = require('../utils/ExpressError');

const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Reviews(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Create new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Reviews.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Success delete review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
