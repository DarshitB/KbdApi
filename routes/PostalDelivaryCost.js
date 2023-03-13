const PostalcodePrice = require("../models/postalcodePeice");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newPostalcodePrice = new PostalcodePrice(req.body);
  let checkdata;
  try {
    checkdata = await PostalcodePrice.find({
      city: newPostalcodePrice.city,
      postcode: newPostalcodePrice.postcode,
    });

    if (checkdata.length === 0) {
      const savedPostalcodePrice = await newPostalcodePrice.save();
      res.status(200).json(savedPostalcodePrice);
      return;
    } else {
      res.status(400).json("this data is exist in the database");
      return;
    }
  } catch (err) {
    res.json(err);
    return;
  }
});

//GET PRODUCTS PRICE
router.get("/", async (req, res) => {
  const postcode = req.query.postcode;
  try {
    if (postcode) {
      const productsPrice = await PostalcodePrice.findOne({
        postcode: postcode.toUpperCase(),
      });
      res.status(200).json(productsPrice);
    } else {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET DISTINT CITY
router.get("/city", async (req, res) => {
  try {
    const cities = await PostalcodePrice.distinct("city");
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET postalcode according to city
router.get("/postcode", async (req, res) => {
  const city = req.query.city;
  const query = { city: city };
  try {
    if (city) {
      const postcodes = await PostalcodePrice.distinct("postcode", query);
      res.status(200).json(postcodes);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;