const express = require("express");
const app = express({mergeParams: true});//mergerParams is used to merge the params from the parent router
const mongoose = require("mongoose");
const Listing = require("../Airbnb/models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/reviews.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

app.use("/listings", listingRoutes);

app.use("/listings", reviewRoutes);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.listen(8000, () => {
    console.log("Server listening to 8000");
});

// Search Listings
app.get('/search', wrapAsync(async (req, res) => {
    const query = req.query.query;
    
    const results = await Listing.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } }
        ]
    });

    res.render('listings/searchResults', { results });
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!!" } = err;
    console.log(err);
    res.status(status).render("error.ejs", { message });
});
