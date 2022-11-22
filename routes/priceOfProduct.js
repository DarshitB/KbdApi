const ProductPrice = require("../models/Product_price");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  const addProductPrice = new ProductPrice(req.body);
  try {
    const savedProductPrice = await addProductPrice.save();
    res.status(200).json(savedProductPrice);
    return;
  } catch (err) {
    res.json(err);
    return;
  }
});
