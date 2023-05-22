const mongoose = require("mongoose");

const ProductPriceSchema = new mongoose.Schema(
  {
    width: { type: Number, required: true },
    drop: { type: Number, required: true },
    band: { type: String, required: true },
    type: { type: String, required: true },
    trackFilter: { type: String },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductPrice", ProductPriceSchema);
