const ProductPrice = require("../models/productPrice");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProductPrice = req.body;
  let checkdata;
  try {
    const savedProductPrices = await Promise.all(
      newProductPrice.map(async (newProductPrice) => {
        checkdata = await ProductPrice.find({
          width: newProductPrice.width,
          drop: newProductPrice.drop,
          band: newProductPrice.band,
          type: newProductPrice.type,
        });
        if (checkdata.length === 0) {
          const savedProductprice = await new ProductPrice(
            newProductPrice
          ).save();
          return savedProductprice;
        } else {
          console.log("this data is exist in the database");
          return;
        }
      })
    );
    const filteredProductPrices = savedProductPrices.filter(Boolean);
    res.status(200).json(filteredProductPrices);
  } catch (err) {
    res.json(err);
    return;
  }
});

//CREATE postmen

router.post("/postmen", verifyTokenAndAdmin, async (req, res) => {
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

// //GET ALL

router.get("/find", async (req, res) => {
  try {
    const ProductPrices = await ProductPrice.find();
    res.status(200).json(ProductPrices);
  } catch (err) {
    res.status(500).json(err);
  }
});
// //GET BY TYPE

router.get("/findbyType", async (req, res) => {
  const pType = req.query.type;
  try {
    let ProductPrices;
    if (pType) {
      ProductPrices = await ProductPrice.find({
        type: pType,
      });
    }
    res.status(200).json(ProductPrices);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET DISTINT type
router.get("/TypeSelect", async (req, res) => {
  try {
    const TypeSelect = await ProductPrice.distinct("type");
    res.status(200).json(TypeSelect);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET DISTINT BAND
router.get("/BandSelect/:type", async (req, res) => {
  try {
    const BandSelect = await ProductPrice.distinct("band", {
      type: req.params.type,
    });
    res.status(200).json(BandSelect);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Verifi backexixst in db
router.get("/band", async (req, res) => {
  const bandname = req.query.band;
  const typename = req.query.type;
  checkdata = await ProductPrice.find({
    band: bandname,
    type: typename,
  });
  if (checkdata.length !== 0) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedProductPrice = await ProductPrice.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedProductPrice);
  } catch (err) {
    res.status(500).json(err);
  }
});
//DELETE
router.delete(
  "/deleteAllWithBandType",
  verifyTokenAndAdmin,
  async (req, res) => {
    const Bandname = req.query.band;
    const typename = req.query.type;
    try {
      await ProductPrice.deleteMany({ band: Bandname, type: typename });
      res.status(200).json("Product Price set has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  }
);
//addSomeFiled or update some fild
router.post("/addSomeFiled", async (req, res) => {
  try {
    ProductPrice.updateMany(
      { band: "V_A" },
      { $set: { band: "A" } },
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
