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

//GET PRODUCTS PRICE
router.get("/", async (req, res) => {
  const pWidth = req.query.width;
  const pDrop = req.query.drop;
  const pBand = req.query.band;
  try {
    let productsPrice;

    if (pWidth && pDrop && pBand) {
      productsPrice = await ProductPrice.findOne({
        width: pWidth,
        drop: pDrop,
        band: pBand.toUpperCase(),
      });
    }
    res.status(200).json(productsPrice);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
