const mongoose = require("mongoose");

const PostalcodePriceSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    delivaryCost: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostalcodePrice", PostalcodePriceSchema);
