const Additionalcost = require("../models/Additionalcost");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newAdditionalcost = req.body;
  let checkdata;
  try {
    const savedAdditionalcosts = await Promise.all(
      newAdditionalcost.map(async (newProductPrice) => {
        if (newProductPrice.drop) {
          checkdata = await Additionalcost.find({
            width: newProductPrice.width,
            drop: newProductPrice.drop,
            addingType: newProductPrice.addingType,
            blindType: newProductPrice.blindType,
          });
        } else {
          checkdata = await Additionalcost.find({
            width: newProductPrice.width,
            addingType: newProductPrice.addingType,
            blindType: newProductPrice.blindType,
          });
        }
        if (checkdata.length === 0) {
          const savedAdditionalcost = await new Additionalcost(
            newProductPrice
          ).save();
          return savedAdditionalcost;
        } else {
          console.log("this data is exist in the database");
          return;
        }
      })
    );
    const filteredAdditionalcost = savedAdditionalcosts.filter(Boolean);
    res.status(200).json(filteredAdditionalcost);
  } catch (err) {
    res.json(err);
    return;
  }
});

//GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Additionalcosts = await Additionalcost.find();
    res.status(200).json(Additionalcosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET BY TYPE

router.get("/findbyType", async (req, res) => {
  const pblindType = req.query.blindType;
  try {
    let Additionalcosts;
    if (pblindType) {
      Additionalcosts = await Additionalcost.find({
        blindType: pblindType,
      });
    }
    res.status(200).json(Additionalcosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedAdditionalcost = await Additionalcost.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedAdditionalcost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCTS PRICE
router.get("/singlecost", async (req, res) => {
  const pWidth = req.query.width;
  const pdrop = req.query.drop;
  const paddingType = req.query.addingType;
  const pblindType = req.query.blindType;
  try {
    let Additionalcosts, getallcost, forshow;
    var maxnumbervaluewidth = [];
    var maxnumbervaluedrop = [];
    if (pdrop && pWidth && paddingType && pblindType) {
      getallcost = await Additionalcost.find({
        addingType: paddingType,
        blindType: pblindType,
      });
      getallcost.forEach(function (element) {
        if (element.width >= pWidth) {
          maxnumbervaluewidth.push(element.width);
        }
        if (element.drop >= pdrop) {
          maxnumbervaluedrop.push(element.drop);
        }
      });

      const productsWidth = Math.min(...maxnumbervaluewidth);
      const productsDrop = Math.min(...maxnumbervaluedrop);
      Additionalcosts = await Additionalcost.findOne({
        width: productsWidth,
        drop: productsDrop,
        addingType: paddingType,
        blindType: pblindType,
      });
    } else if (pWidth && paddingType && pblindType) {
      getallcost = await Additionalcost.find({
        addingType: paddingType,
        blindType: pblindType,
      });
      getallcost.forEach(function (element) {
        if (element.width >= pWidth) {
          maxnumbervaluewidth.push(element.width);
        }
      });
      const productsWidth = Math.min(...maxnumbervaluewidth);
      Additionalcosts = await Additionalcost.findOne({
        width: productsWidth,
        addingType: paddingType,
        blindType: pblindType,
      });
    }
    res.status(200).json(Additionalcosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//addSomeFiled or update some fild
router.post("/addSomeFiled", async (req, res) => {
  try {
    Additionalcost.updateMany(
      { addingType: "DecoraruveCassette" },
      { $set: { addingType: "Decoraruve" } },
      (err, result) => {
        if (err) {
          res.status(500).json(err);
          return;
        }
        res.status(200).json(result);
      }
    );
  } catch (err) {
    res.json(err);
    return;
  }
});

module.exports = router;
