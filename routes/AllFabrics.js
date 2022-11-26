const Fabrics = require("../models/Fabrics");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newFabrics = new Fabrics(req.body);
  let checkdata;
  try {
    checkdata = await Fabrics.find({
      uniquId: newFabrics.uniquId,
      fabric: newFabrics.fabric,
      band: newFabrics.band,
    });
    if (checkdata.length === 0) {
      const savedFabrics = await newFabrics.save();
      res.status(200).json(savedFabrics);
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

//GET FABRIC PRICE
router.get("/", async (req, res) => {
  const FabricId = req.query.FabricId;
  try {
    let fabric;
    if (FabricId) {
      fabric = await Fabrics.find({
        uniquId: FabricId,
      });
    }
    res.status(200).json(fabric);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
