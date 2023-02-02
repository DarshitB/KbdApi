const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderDate: { type: String, required: true },
    userId: { type: String, required: true },
    produts: [
      {
        productId: { type: String },
        Width: { type: String },
        Drop: { type: String },
        type: { type: String },
        SizeOption: { type: String },
        ControlOption: { type: String },
        FabricOption: { type: String },
        WrappedOption: { type: String },
        TopFixing: { type: String },
        OperatingSystem: [
          {
            Motorised: { type: String },
            Remote: { type: String },
            Accessories: { type: String },
          },
        ],
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: { type: Number, required: true },
    userAddress: [
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
    shipingMathod: { type: String, required: true },
    installationServices: [
      {
        installationArea: { type: String },
        Appointment: { type: String },
      },
    ],
    paymentMethod: { type: String, required: true },
    Status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
