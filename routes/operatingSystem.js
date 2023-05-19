const Motors = require("../models/BlindMotors");
const Remotes = require("../models/BlindRemotes");
const Accessories = require("../models/BlindAccessories");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE MOTORE

router.post("/Motore", verifyTokenAndAdmin, async (req, res) => {
  const newMotore = new Motors(req.body);

  try {
    const savedMotore = await newMotore.save();
    res.status(200).json(savedMotore);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET MOTORE

router.get("/Motore", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Motorsset = await Motors.find();
    res.status(200).json(Motorsset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET MOTORE BY TYPE

router.get("/Motore/find/:blindtype", async (req, res) => {
  try {
    const Motorsset = await Motors.find({
      BlindType: req.params.blindtype,
    });
    res.status(200).json(Motorsset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete MOTORE

router.delete("/Motore/:id", async (req, res) => {
  try {
    await Motors.findByIdAndDelete(req.params.id);
    res.status(200).json("Motore Delete successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//CREATE Remotes

router.post("/Remote", verifyTokenAndAdmin, async (req, res) => {
  const newRemotes = new Remotes(req.body);

  try {
    const savedRemotes = await newRemotes.save();
    res.status(200).json(savedRemotes);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Remotes

router.get("/Remote", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Remotesset = await Remotes.find();
    res.status(200).json(Remotesset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET REMOTE BY TYPE

router.get("/Remote/find/:blindtype", async (req, res) => {
  try {
    const Remotesset = await Remotes.find({
      BlindType: req.params.blindtype,
    });
    res.status(200).json(Remotesset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Remotes

router.delete("/Remote/:id", async (req, res) => {
  try {
    await Remotes.findByIdAndDelete(req.params.id);
    res.status(200).json("Remote Delete successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//CREATE Accessories

router.post("/Accessories", verifyTokenAndAdmin, async (req, res) => {
  const newAccessories = new Accessories(req.body);

  try {
    const savedAccessories = await newAccessories.save();
    res.status(200).json(savedAccessories);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Accessories

router.get("/Accessories", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Accessoriesset = await Accessories.find();
    res.status(200).json(Accessoriesset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Accessories BY TYPE

router.get("/Accessories/find/:blindtype", async (req, res) => {
  try {
    const Accessoriesset = await Accessories.find({
      BlindType: req.params.blindtype,
    });
    res.status(200).json(Accessoriesset);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Accessories

router.delete("/Accessories/:id", async (req, res) => {
  try {
    await Accessories.findByIdAndDelete(req.params.id);
    res.status(200).json("Remote Delete successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
