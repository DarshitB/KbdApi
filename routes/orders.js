const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

const nodemailer = require("nodemailer");

//CREATE

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  const userEmail = newOrder.ShippingAddress[0].Email;
  let config = {
    service: "gmail",
    auth: {
      user: process.env.sendmileuser,
      pass: process.env.sendmilepass,
    },
  };
  let transporter = nodemailer.createTransport(config);

  let productsHtml = "";
  for (let i = 0; i < newOrder.produts.length; i++) {
    const product = newOrder.produts[i];
    const getProduct = await Product.findById(product.productId);
    if (product.type === "Roller") {
      productsHtml += `
        <tr>
          <td><img src="https://kbdapi.onrender.com/api/images/febrickBlind/${getProduct.img[0]}" style="width:60px;drop:60px;padding: 0 10px" /></td>
          <td style="padding:0 10px">Title: ${getProduct.title}</td>
          <td>Width: ${product.Width}, Drop: ${product.Drop}, type: ${product.type}, ControlOption: ${product.ControlOption}, FabricOption: ${product.FabricOption}, SizeOption: ${product.SizeOption}, WrappedOption: ${product.WrappedOption}, TopFixing: ${product.TopFixing},  MotoreHead ${product.OperatingSystem[0].Motorised}, RemoteHead - ${product.OperatingSystem[0].Remote}, Accessories - ${product.OperatingSystem[0].Accessories}</td>
        </tr>
      `;
    } else if (product.type === "Vertical") {
      productsHtml += `
        <tr>
          <td><img src="https://kbdapi.onrender.com/api/images/febrickBlind/${getProduct.img[0]}" style="width:60px;drop:60px;padding: 0 10px" /></td>
          <td style="padding:0 10px">Title: ${getProduct.title}</td>
          <td>Width: ${product.Width}, Drop: ${product.Drop}, type: ${product.type}, ControlOption: ${product.ControlOption}, FabricOption: ${product.FabricOption}, ChainControl: ${product.ChainControl}, OpeningDirection: ${product.OpeningDirection}, MountingBracket: ${product.MountingBracket}, BallChainHook: ${product.BallChainHook}, MetelBallChain: ${product.MetelBallChain}, MotoreHead ${product.OperatingSystem[0].Motorised}, RemoteHead - ${product.OperatingSystem[0].Remote}, Accessories - ${product.OperatingSystem[0].Accessories}</td>
        </tr>
      `;
    }
  }

  let sendHtmlFormofotp = `<div style='width:100%;'><div style='border-radius: 8px;border: 1px solid rgb(220, 220, 220);background-color: rgb(250, 250, 250);padding:20px;'><h5 style="text-align:center;background-color: #d4edda;font-size:30px;border-radius: 8px;padding:10px 0;margin-top:0;margin-bottom:20px">Order placed Successfully</h5><h6 style="font-size:25px;margin-bottom:0.7rem;margin-top:1.5rem;"><b>Order Id: ${newOrder._id}</b></h6><p style="margin-top:0;margin-bottom:1rem;color:#28a745">Estimated Delivary : ${newOrder.deliveryDate}</p><table>${productsHtml}</table><p style="text-align: right;font-size:25px;margin:1.5rem 0">Order Value: € ${newOrder.amount}</p></div></div>`;

  let message = {
    from: `Kbd Blinds <${process.env.sendmileuser}>`,
    to: userEmail,
    subject: "your order is success full placed",
    html: sendHtmlFormofotp,
  };

  transporter
    .sendMail(message)
    .then(() => {
      const savedOrder = newOrder.save();
      res.status(200).json(savedOrder);
      return;
    })
    .catch((error) => {
      return res.status(501).json({ error });
    });
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL which is not COMPLETED and CANCELED

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $nin: ["COMPLETED", "CANCELED"] },
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
//GET ALL which is COMPLETED

router.get("/Completed", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "COMPLETED",
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
//GET ALL which is COMPLETED

router.get("/Canceled", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "CANCELED",
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET single order

router.get("/findSingle/:id", async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
// CHANGE ORDER STATUS
router.patch("/UpdateStatus", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Orderid = req.query.Orderid;
    const UdateStatus = req.query.UdateStatus;
    const selectedOrder = await Order.findById(Orderid);

    if (!selectedOrder) {
      return res.status(404).json({ error: "Product not found" });
    }
    selectedOrder.orderStatus = UdateStatus;
    await selectedOrder.save();

    return res.status(200).json("Order Status Changed Successfully");
  } catch (err) {
    return res.status(500).json(`Internal server error ${err}`);
  }
});

// Add/Change Track ID/Link
router.patch("/UpdateTrack", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Orderid = req.query.Orderid;
    const trackLink = req.query.trackLink;
    const trackId = req.query.trackId;
    const selectedOrder = await Order.findById(Orderid);

    if (!selectedOrder) {
      return res.status(404).json({ error: "Product not found" });
    }
    selectedOrder.orderTrackLink = trackLink;
    selectedOrder.orderTrackId = trackId;
    await selectedOrder.save();

    return res.status(200).json("Track Detailes added sucessfully");
  } catch (err) {
    return res.status(500).json(`Internal server error ${err}`);
  }
});
// GET MONTHLY revanue

router.get("/revanue", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const twoMonthsAgo = new Date(date.getFullYear(), date.getMonth() - 2, 1);

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: twoMonthsAgo } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET appointments
router.get("/appointments", async (req, res) => {
  try {
    const orders = await Order.find({}, "installationServices.Appointment");
    const appointments = orders
      .map((order) => order.installationServices[0].Appointment)
      .filter((appointment) => appointment !== null);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
