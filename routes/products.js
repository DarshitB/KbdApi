const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
var path = require("path");

const router = require("express").Router();

//CREATE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `images/febrickBlind/`); // specify the desired destination path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); // use the original filename for the uploaded file
  },
});
const upload = multer({ storage: storage });

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("img", 10),
  async (req, res) => {
    try {
      const {
        title,
        desc,
        type,
        color,
        fabrics,
        price,
        inStock,
        stock,
        isActive,
      } = req.body;
      var imageo = [];
      const blindImages = req.files;
      /* for (var i = 0; i < req.files.length; i++) {
        img.push(req.files[i].filename);
      } */
      if (blindImages) {
        blindImages.forEach(async (image) => {
          imageo.push(image.filename);
          const imagePath = image.destination + image.filename;
          const updatedImagePath = imagePath.replace(/\//g, "\\");
          const compressedImage = await sharp(updatedImagePath)
            .resize(800)
            .toBuffer();
          fs.writeFileSync(updatedImagePath, compressedImage);
        });
      }
      const fabricsArray = fabrics.split(",").map((fabric) => fabric.trim());
      const newProduct = new Product({
        title,
        desc,
        img: imageo,
        type,
        color,
        fabrics: fabricsArray,
        price,
        inStock,
        stock,
        isActive,
      });
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(501).json(err);
    }
  }
);

//CREATE from postman

router.post("/postman", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("img", 10),
  async (req, res) => {
    try {
      const { title, desc, color, fabrics, price, inStock, stock, isActive } =
        req.body;
      const blindImages = req.files;

      const updatedProduct = await Product.findById(req.params.id);
      const outputFabricArray = fabrics.split(",");

      if (blindImages.length == 0) {
        updatedProduct.title = title;
        updatedProduct.desc = desc;
        updatedProduct.color = color;
        updatedProduct.price = parseFloat(price);
        updatedProduct.inStock = inStock;
        updatedProduct.stock = parseInt(stock);
        updatedProduct.isActive = isActive;
        if (fabrics) {
          if (outputFabricArray.length >= 1) {
            updatedProduct.fabrics.push(...outputFabricArray);
          }
        }
        await updatedProduct.save();
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
        updatedProduct.title = title;
        updatedProduct.desc = desc;
        updatedProduct.color = color;
        updatedProduct.price = parseFloat(price);
        updatedProduct.inStock = inStock;
        updatedProduct.stock = parseInt(stock);
        updatedProduct.isActive = isActive;
        if (fabrics) {
          if (outputFabricArray.length >= 1) {
            updatedProduct.fabrics.push(...outputFabricArray);
          }
        }
        updatedProduct.img.push(...imageo);
        await updatedProduct.save();
      }
      res.status(200).json("Product updatetd sucessfully");
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const findProduct = await Product.findById(req.params.id);
    if (findProduct) {
      findProduct.img.forEach((image) => {
        fs.unlinkSync("images/febrickBlind/" + image);
      });
      await findProduct.remove();
      res.status(200).json("Product has been deleted...");
    } else {
      res.status(404).json("Product not found");
    }
  } catch (err) {
    res.status(501).json(err);
  }
});

//DELETE All
router.delete("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        type: {
          $in: [qCategory],
        },
        isActive: true,
      });
    } else {
      products = await Product.find({ isActive: true });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

//remove Exsting Febric on edit product
router.patch("/removeExstingFebric", verifyTokenAndAdmin, async (req, res) => {
  try {
    const productId = req.query.productid;
    const fabricId = req.query.fabricId;
    // Find the product by ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Remove the fabric ID from the fabrics array
    product.fabrics = product.fabrics.filter(
      (fabric) => String(fabric) !== fabricId
    );
    // Save the updated product
    await product.save();

    return res.json("Fabric ID removed from product");
  } catch (err) {
    return res.status(500).json(`Internal server error ${err}`);
  }
});
//remove Exsting Blind image on edit product
router.patch(
  "/removeExstingblideImage",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const productId = req.query.productid;
      const ImgFilename = req.query.Imagename;
      // Find the product by ID
      const selectedproduct = await Product.findById(productId);

      // Check if the product exists
      if (!selectedproduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      fs.unlinkSync("images/febrickBlind/" + ImgFilename);
      // Remove the fabric ID from the fabrics array
      selectedproduct.img = selectedproduct.img.filter(
        (img) => String(img) !== ImgFilename
      );

      // Save the updated product
      await selectedproduct.save();

      return res.status(200).json("blide image removed from Product");
    } catch (err) {
      return res.status(500).json(`Internal server error ${err}`);
    }
  }
);
module.exports = router;
