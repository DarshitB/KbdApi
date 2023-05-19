const mongoose = require("mongoose");

const AccessoriesSchema = new mongoose.Schema({
  AccessoriesName: { type: String, required: true },
  AccessoriesCode: { type: String, required: true },
  AdditionPrice: { type: Number, required: true },
  BlindType: { type: String, required: true },
});

module.exports = mongoose.model("Accessories", AccessoriesSchema);
