const Fabrics = require("../models/Fabrics");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
var path = require("path");
const zlib = require("zlib");
const router = require("express").Router();

//CREATE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "img") {
      cb(null, `images/febrickBlind/`);
    } else if (file.fieldname === "fabImg") {
      cb(null, `images/fabrics/`);
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.fields([{ name: "img" }, { name: "fabImg" }]),
  async (req, res) => {
    const { uniquId, fabric, fabricName, band, type } = req.body;
    const blindImages = req.files["img"];
    const fabricImage = req.files["fabImg"][0];
    let checkdata;
    try {
      checkdata = await Fabrics.find({
        uniquId: uniquId,
        fabric: fabric,
        band: band,
      });
      if (checkdata.length === 0) {
        var Bliendimages = [];
        var fabimages = "";
        if (blindImages) {
          blindImages.forEach(async (image) => {
            Bliendimages.push(image.filename);
            const compressedImage = await sharp(image.path)
              .resize(800)
              .toBuffer();
            fs.writeFileSync(image.path, compressedImage);
          });
        }
        if (fabricImage) {
          const compressedFabricImage = await sharp(fabricImage.path)
            .resize(140)
            .toBuffer();
          fs.writeFileSync(fabricImage.path, compressedFabricImage);
          fabimages = fabricImage.filename;
        }
        const fabricData = new Fabrics({
          uniquId,
          fabric,
          fabricName,
          fabImg: fabimages,
          img: Bliendimages,
          band,
          type,
        });
        /* if (blindImages) {
          blindImages.forEach((image) => {
            fs.unlinkSync(image.path);
          });
        } */
        /* if (fabricImage) {
          fs.unlinkSync(fabricImage.path);
        } */
        const savedFabrics = await fabricData.save();
        res.status(200).json(savedFabrics);
        return;
      } else {
        console.log("this data is exist in the database");
        return;
      }
    } catch (err) {
      res.status(500).json(err);
      return;
    }
  }
);

//CREATE postmen

router.post("/postmen", verifyTokenAndAdmin, async (req, res) => {
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
    } else {
      fabric = await Fabrics.find();
    }
    res.status(200).json(fabric);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET FABRIC PRICE
router.get("/:fabricid", async (req, res) => {
  const FabricId = req.params.fabricid;
  try {
    let fabric;
    if (FabricId) {
      fabric = await Fabrics.findById(FabricId);
    } else {
      fabric = await Fabrics.find();
    }
    res.status(200).json(fabric);
  } catch (err) {
    res.status(500).json(err);
  }
});
//ADD SOME FILEDS
router.post("/addSomeFiled", async (req, res) => {
  try {
    Fabrics.updateMany(
      { band: "V_A" },
      { $set: { type: "Vertical" } },
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

//GET FABRIC BY BLIND TYPE
router.get("/type/:Fabrictype", async (req, res) => {
  const Fabrictype = req.params.Fabrictype;
  try {
    let fabric;
    if (Fabrictype) {
      fabric = await Fabrics.find({
        type: Fabrictype,
      });
    }
    res.status(200).json(fabric);
  } catch (err) {
    res.status(501).json(err);
  }
});

//UPDATE
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.fields([{ name: "img" }, { name: "fabImg" }]),
  async (req, res) => {
    try {
      const { fabric, fabricName } = req.body;
      const blindImages = req.files["img"] || [];
      const faricImage = req.files["fabImg"] && req.files["fabImg"][0];
      /*       const faricImage = req.file;
       */
      const getFebricData = await Fabrics.findById(req.params.id);

      if (blindImages.length == 0 && !faricImage) {
        getFebricData.fabric = fabric;
        getFebricData.fabricName = fabricName;
        await getFebricData.save();
      } else {
        if (!faricImage) {
          var imageo = [];
          blindImages.forEach(async (image) => {
            imageo.push(image.filename);
            const imagePath = image.destination + image.filename;
            const updatedImagePath = imagePath.replace(/\//g, "\\");
            const compressedImage = await sharp(updatedImagePath)
              .resize(800)
              .toBuffer();
            fs.writeFileSync(updatedImagePath, compressedImage);
          });
          getFebricData.fabric = fabric;
          getFebricData.fabricName = fabricName;
          getFebricData.img.push(...imageo);
          await getFebricData.save();
        } else if (blindImages.length == 0) {
          fs.unlinkSync("images/fabrics/" + getFebricData.fabImg);
          const compressedFabricImage = await sharp(faricImage.path)
            .resize(140)
            .toBuffer();
          fs.writeFileSync(faricImage.path, compressedFabricImage);
          const fabimage = faricImage.filename;
          getFebricData.fabric = fabric;
          getFebricData.fabricName = fabricName;
          getFebricData.fabImg = fabimage;
          await getFebricData.save();
        } else {
          var imageo = [];
          blindImages.forEach(async (image) => {
            imageo.push(image.filename);
            const imagePath = image.destination + image.filename;
            const updatedImagePath = imagePath.replace(/\//g, "\\");
            const compressedImage = await sharp(updatedImagePath)
              .resize(800)
              .toBuffer();
            fs.writeFileSync(updatedImagePath, compressedImage);
          });
          fs.unlinkSync("images/fabrics/" + getFebricData.fabImg);
          const compressedFabricImage = await sharp(faricImage.path)
            .resize(140)
            .toBuffer();
          fs.writeFileSync(faricImage.path, compressedFabricImage);
          const fabimage = faricImage.filename;
          getFebricData.fabric = fabric;
          getFebricData.fabricName = fabricName;
          getFebricData.fabImg = fabimage;
          getFebricData.img.push(...imageo);
          await getFebricData.save();
        }
      }
      /*  const updateData = await Fabrics.findByIdAndUpdate(
        req.params.id,
        { $set: { fabric: fabric, fabricName: fabricName } },
        { new: true }
      ); */
      /*       console.log("files", req.file);
       */
      res.status(200).json("Data updated successfully");
    } catch (err) {
      res.status(501).json(err);
    }
  }
);

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const slectedFabric = await Fabrics.findById(req.params.id);
    if (slectedFabric) {
      slectedFabric.img.forEach((image) => {
        const pathblind = "images/febrickBlind/" + image;
        if (fs.existsSync(pathblind)) {
          fs.unlinkSync(pathblind);
        }
      });
      const path = "images/fabrics/" + slectedFabric.fabImg;
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }

      const fabricuniquId = slectedFabric.uniquId;

      // Find the products that contain the fabric ID in the fabrics array
      const productshavefabric = await Product.find({ fabrics: fabricuniquId });

      // Remove fabric from associated products

      for (let i = 0; i < productshavefabric.length; i++) {
        const product = productshavefabric[i];
        product.fabrics = product.fabrics.filter(
          (fabric) => String(fabric) !== fabricuniquId
        );
        await product.save();
      }
      // Save the updated product
      // Delete the fabric
      await slectedFabric.remove();
      res.status(200).json("Fabrics has been deleted...");
    } else {
      res.status(404).json("Fabrics not found");
    }
  } catch (err) {
    console.error(err);
    res.status(501).json(err);
  }
});
//DELETE All
router.delete("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Fabrics.deleteMany({});
    res.status(200).json("Fabrics has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//remove Exsting Blind image on edit fabric
router.patch(
  "/removeExstingblideImage",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const fabricId = req.query.fabricId;
      const ImgFilename = req.query.Imagename;
      // Find the product by ID
      const selectedFabric = await Fabrics.findById(fabricId);

      // Check if the product exists
      if (!selectedFabric) {
        return res.status(404).json({ error: "Product not found" });
      }
      fs.unlinkSync("images/febrickBlind/" + ImgFilename);
      // Remove the fabric ID from the fabrics array
      selectedFabric.img = selectedFabric.img.filter(
        (img) => String(img) !== ImgFilename
      );

      // Save the updated product
      await selectedFabric.save();

      return res.json("blide image removed from fabric");
    } catch (err) {
      return res.status(500).json(`Internal server error ${err}`);
    }
  }
);
module.exports = router;
