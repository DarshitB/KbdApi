const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
//register

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECTER
    ).toString(),
  });
  try {
    const saeUser = await newUser.save();
    res.status(201).json(saeUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.username,
    });
    if (!user) {
      res.status(404).json("wrong cradantial");
      return;
    }
    const hashpasswords = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECTER
    );
    const Origipassword = hashpasswords.toString(CryptoJS.enc.Utf8);

    if (Origipassword !== req.body.password) {
      res.status(401).json("Wronf Password");
      return;
    }

    const aceesTocken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC_KEY,
      { expiresIn: "3d" }
    );
    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, aceesTocken });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
