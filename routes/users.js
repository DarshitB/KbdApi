const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router = require("express").Router();

const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `images/profiles/`); // specify the desired destination path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); // use the original filename for the uploaded file
  },
});
const upload = multer({ storage: storage });

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});
//GET USER by email id
router.get("/findOnRegister/:Email", async (req, res) => {
  const checkUser = await User.find({ email: req.params.Email });
  if (checkUser.length !== 0) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          total: 1,
          date: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $toString: "$_id.year" },
                  "-",
                  { $toString: "$_id.month" },
                  "-01",
                ],
              },
            },
          },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update password from forgotpassword
router.put("/forgotPass/:emailid", async (req, res) => {
  try {
    const updatePassword = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECTER
    ).toString();

    const user = await User.findOne({
      email: req.params.emailid,
    });
    if (!user) {
      res.status(404).json("wrong cradantial");
      return;
    }

    user.password = updatePassword;

    await user.save();

    res.status(200).json("sucess fully update.");
  } catch (err) {
    res.status(501).json(err);
  }
});

// update password from Changepassword
router.put("/changePass/:id", async (req, res) => {
  try {
    const updatePassword = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECTER
    ).toString();

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("user is not found");
      return;
    }

    user.password = updatePassword;

    await user.save();

    res.status(200).json("sucess fully update.");
  } catch (err) {
    res.status(501).json(err);
  }
});

// update user profile and usrname
router.put("/profile/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const { username } = req.body;
    const profileImage = req.file || null;
    const user = await User.findById(req.params.id);
    if (!profileImage) {
      user.username = username;
      await user.save();
    } else {
      if (user.profileImage) {
        const path = "images/profiles/" + user.profileImage;
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      }
      /* const imagePath = profileImage.destination + profileImage.filename;
      const updatedImagePath = imagePath.replace(/\//g, "\\"); */
      const compressedFabricImage = await sharp(profileImage.path)
        .resize(200)
        .toBuffer();
      fs.writeFileSync(profileImage.path, compressedFabricImage);
      const Profimage = profileImage.filename;
      user.username = username;
      user.profileImage = Profimage;
      await user.save();
    }

    res.status(200).json("success fully update.");
  } catch (err) {
    res.status(501).json(err);
  }
});

//add the address to the user addreses
router.post("/addAddress/:id", async (req, res) => {
  try {
    const address = {
      FirstName: req.body.fname,
      LastName: req.body.lname,
      Address: req.body.adress,
      Country: req.body.Country,
      City: req.body.city,
      Postcode: req.body.zipcode,
      PhoneNo: req.body.pnumber,
    };
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("user is not found");
      return;
    }

    user.saveAddresses.push(address);

    await user.save();

    res.status(200).json("sucess fully update.");
  } catch (err) {
    res.status(501).json(err);
  }
});

//Update the address to the user addreses
router.put("/UpdateAddress/:id/:addressId", async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const address = {
      FirstName: req.body.fname,
      LastName: req.body.lname,
      Address: req.body.adress,
      Country: req.body.Country,
      City: req.body.city,
      Postcode: req.body.zipcode,
      PhoneNo: req.body.pnumber,
    };
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("user is not found");
      return;
    }

    const addressToUpdateIndex = user.saveAddresses.findIndex(
      (address) => address._id.toString() === addressId.toString()
    );

    if (addressToUpdateIndex === -1) {
      return res.status(404).json({ error: "Address not found" });
    }

    user.saveAddresses[addressToUpdateIndex] = address;

    await User.findByIdAndUpdate(req.params.id, {
      saveAddresses: user.saveAddresses,
    });

    res.status(200).json("sucess fully update.");
  } catch (err) {
    res.status(501).json(err);
  }
});
//remove Exsting adrees on addreses page
router.patch("/removeExstingAddress", async (req, res) => {
  try {
    const userId = req.query.userId;
    const addressId = req.query.addressId;

    const removeaddresofuser = await User.findById(userId);
    if (!removeaddresofuser) {
      return res.status(404).json({ error: "Product not found" });
    }

    removeaddresofuser.saveAddresses = removeaddresofuser.saveAddresses.filter(
      (address) => address._id.toString() !== addressId.toString()
    );
    await removeaddresofuser.save();

    return res.status(200).json("address successfully removed from user");
  } catch (err) {
    return res.status(500).json(`Internal server error ${err}`);
  }
});

module.exports = router;
