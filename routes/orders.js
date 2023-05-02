const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  console.log(newOrder);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
    return;
  } catch (err) {
    res.json(err);
    return;
  }
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
