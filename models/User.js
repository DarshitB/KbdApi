const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    profileImage: { type: String },
    saveAddresses: [
      {
        FirstName: { type: String },
        LastName: { type: String },
        Address: { type: String },
        Country: { type: String },
        City: { type: String },
        Postcode: { type: String },
        PhoneNo: { type: String },
      },
    ],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UsersSchema);
