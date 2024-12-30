const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../Airbnb/models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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



app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.listen(8000, () => {
    console.log("Server listening to 8080");
});

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

//new
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
}));

// app.post("/listings", async (req,res)=>{
//     let listing = req.body;
//     let newListing = new Listing(listing);
//     await newListing.save();
//     console.log(listing);
// });

//Create Listing
app.post("/listings", wrapAsync(async (req, res, next) => {
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

app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

// search-feature
// app.put("/listings/search", async(req,res)=>{
//     let {data} = req.body;
//     console.log(data);
// });

// Search Listings
app.get('/search', wrapAsync(async (req, res) => {
    const query = req.query.query;
    
    // Perform a case-insensitive search in the database
    const results = await Listing.find({
        $or: [
            { title: { $regex: query, $options: 'i' } }, // Search by title
            { description: { $regex: query, $options: 'i' } }, // Search by description
            { location: { $regex: query, $options: 'i' } }, // Search by location
            { country: { $regex: query, $options: 'i' } } // Search by country
        ]
    });

    // Render search results page with the results
    res.render('listings/searchResults', { results });
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!!" } = err;
    // res.status(status).send(message);
    console.log(err);
    res.status(status).render("error.ejs", { message });
});