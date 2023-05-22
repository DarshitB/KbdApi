const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: Array, required: true },
    type: { type: Array, required: true },
    color: { type: Array },
    fabrics: { type: Array, required: false },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    stock: { type: Number },
    searchKeyword: { type: Array },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductsSchema);
