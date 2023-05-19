const mongoose = require("mongoose");

const RemotesSchema = new mongoose.Schema({
  RemotesName: { type: String, required: true },
  RemotesCode: { type: String, required: true },
  AdditionPrice: { type: Number, required: true },
  BlindType: { type: String, required: true },
});

module.exports = mongoose.model("Remotes", RemotesSchema);
