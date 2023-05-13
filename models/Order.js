const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderDate: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    userId: { type: String, required: true },
    produts: [
      {
        productId: { type: String },
        productcost: { type: String },
        Width: { type: String },
        Drop: { type: String },
        type: { type: String },
        ControlOption: { type: String },
        FabricOption: { type: String },
        /* Roller */
        SizeOption: { type: String },
        WrappedOption: { type: String },
        TopFixing: { type: String },
        /* Verticale */
        ChainControl: { type: String },
        OpeningDirection: { type: String },
        MountingBracket: { type: String },
        BallChainHook: { type: String },
        MetelBallChain: { type: String },
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
    ShippingAddress: [
      {
        FirstName: { type: String },
        LastName: { type: String },
        Address: { type: String },
        Country: { type: String },
        City: { type: String },
        Postcode: { type: String },
        PhoneNo: { type: String },
        Email: { type: String },
      },
    ],
    BillingAddress: [
      {
        FirstName: { type: String },
        LastName: { type: String },
        Address: { type: String },
        Country: { type: String },
        City: { type: String },
        Postcode: { type: String },
        PhoneNo: { type: String },
        Email: { type: String },
      },
    ],
    shipingMathod: { type: String, required: true },
    shipingCost: { type: String },
    installationServices: [
      {
        installationArea: { type: String },
        Appointment: { type: String },
        cost: { type: String },
      },
    ],
    subTotalIncVAt: { type: String },
    Discount: { type: String },
    paymentMethod: { type: String, required: true },
    Status: { type: String, default: "pending" },
    orderStatus: { type: String, default: "PENDING" },
    orderTrackLink: { type: String },
    orderTrackId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
