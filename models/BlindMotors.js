const mongoose = require("mongoose");

const MotorsSchema = new mongoose.Schema({
  MotorName: { type: String, required: true },
  MotorCode: { type: String, required: true },
  AdditionPrice: { type: Number, required: true },
  BlindType: { type: String, required: true },
});

module.exports = mongoose.model("Motors", MotorsSchema);
