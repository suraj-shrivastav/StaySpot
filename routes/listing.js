const express = require('express'); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");



const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};


router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

//new
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));


//Create Listing
router.post("/",validateListing, wrapAsync(async (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        throw (new ExpressError(400, error));
    }

    const { title, description, price, location, country, image } = req.body;
    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: { // Assuming you have an image field in your schema
            filename: "listingimage",
            url: req.body.image // Use the provided image URL
        }
    });
    await newListing.save();
    res.redirect("/listings");
}));


router.get("/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

router.put("/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

router.delete("/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

module.exports = router;