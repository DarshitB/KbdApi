const ProductPrice = require("../models/productPrice");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProductPrice = new ProductPrice(req.body);
  try {
    const savedProductprice = await newProductPrice.save();
    res.status(200).json(savedProductprice);
    return;
  } catch (err) {
    res.json(err);
    return;
  }
});

module.exports = router;
