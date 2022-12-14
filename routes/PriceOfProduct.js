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
  let checkdata;
  try {
    checkdata = await ProductPrice.find({
      width: newProductPrice.width,
      drop: newProductPrice.drop,
      band: newProductPrice.band,
    });
    if (checkdata.length === 0) {
      const savedProductprice = await newProductPrice.save();
      res.status(200).json(savedProductprice);
      return;
    } else {
      console.log("this data is exist in the database");
      return;
    }
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
    let productsPrice, getallprice, forshow;
    var maxnumbervaluewidth = [];
    var maxnumbervaluedrop = [];
    if (pWidth && pDrop && pBand) {
      getallprice = await ProductPrice.find({
        band: pBand.toUpperCase(),
      });
      getallprice.forEach(function (element) {
        if (element.width >= pWidth) {
          maxnumbervaluewidth.push(element.width);
        }
        if (element.drop >= pDrop) {
          maxnumbervaluedrop.push(element.drop);
        }
      });
      const productsWidth = Math.min(...maxnumbervaluewidth);
      const productsDrop = Math.min(...maxnumbervaluedrop);
      productsPrice = await ProductPrice.findOne({
        width: productsWidth,
        drop: productsDrop,
        band: pBand.toUpperCase(),
      });
    }
    res.status(200).json(productsPrice);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
