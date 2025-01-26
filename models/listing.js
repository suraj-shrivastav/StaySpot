const mongoose = require("mongoose");
const { listingSchema } = require("../schema");
const Review = require("./review");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: {
      filename: {
        type: String,
        default: "default-image",
      },
      url: {
        type: String,
        set: (v) =>
          v === "" || v === undefined
            ? "https://cdn.prod.website-files.com/5c6d6c45eaa55f57c6367749/65045f093c166fdddb4a94a5_x-65045f0266217.webp"
            : v,
        default:
          "https://cdn.prod.website-files.com/5c6d6c45eaa55f57c6367749/65045f093c166fdddb4a94a5_x-65045f0266217.webp",
      },
    },
    required: true,
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

ListingSchema.post("findOneAndDelete", async (deletedListing) => {
  if (deletedListing && deletedListing.reviews.length) {
    try {
      const res = await Review.deleteMany({
        _id: { $in: deletedListing.reviews },
      });
      console.log("Deleted reviews:", res);
    } catch (error) {
      console.error("Error deleting reviews:", error);
    }
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
