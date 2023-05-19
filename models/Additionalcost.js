const mongoose = require("mongoose");

const AdditionalcostSchema = new mongoose.Schema({
  width: { type: Number, required: true },
  drop: { type: Number },
  addingType: { type: String, required: true },
  blindType: { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("Additionalcost", AdditionalcostSchema);
