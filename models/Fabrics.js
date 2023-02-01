const mongoose = require("mongoose");

const FabricsSchema = new mongoose.Schema({
  uniquId: { type: String, required: true, unique: true },
  fabric: { type: String, required: true },
  fabricName: { type: String, required: true },
  fabImg: { type: String, required: true },
  img: { type: Array, required: true },
  band: { type: String, required: true },
});

module.exports = mongoose.model("Fabrics", FabricsSchema);
