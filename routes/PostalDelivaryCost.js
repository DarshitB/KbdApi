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
      res.status(400).json("This data already exists, try another one.");
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

// //GET ALL

router.get("/getAll", verifyTokenAndAdmin, async (req, res) => {
  try {
    const PostalcodeDelivary = await PostalcodePrice.find();
    res.status(200).json(PostalcodeDelivary);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await PostalcodePrice.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET SINGLE
router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const PostalcodeDelivary = await PostalcodePrice.findById(req.params.id);
    res.status(200).json(PostalcodeDelivary);
  } catch (err) {
    res.status(500).json(err);
  }
});
//Update PostalDelivarycost
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedpostcot = await PostalcodePrice.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          city: req.body.city,
          postcode: req.body.postcode,
          delivaryCost: req.body.delivaryCost,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedpostcot);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
