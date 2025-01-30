const express = require('express'); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Middleware to validate review input
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

// Route to post a new review for a specific listing
router.post("/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    try {
        let { id } = req.params; // Get the listing ID from the URL parameters
        let listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).send("Listing not found");
        }

        let newReview = new Review(req.body.review);
        await newReview.save();
        
        listing.reviews.push(newReview._id); // Add the review ID to the listing's reviews array
        await listing.save();

        console.log("Saved review:", newReview);
        res.redirect(`/listings/${id}`); // Redirect to the listing page
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).send("Server error");
    }
}));

// Route to delete a specific review from a listing
router.delete("/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params; // Get both the listing ID and review ID from the URL parameters
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove review ID from the listing's reviews array
    await Review.findByIdAndDelete(reviewId); // Delete the review from the database
    res.redirect(`/listings/${id}`); // Redirect to the listing page
}));

module.exports = router;
