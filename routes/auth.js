const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

//send mail fro OTP

router.post("/sendVerifcationCode/:email", async (req, res) => {
  const userEmail = req.params.email;
  //in the case of gmail account
  /*   sendmileuser = darshitb22@gmail.com
sendmilepass = ytykuzzgcpmpburc */
  let config = {
    service: "gmail",
    auth: {
      user: process.env.sendmileuser,
      pass: process.env.sendmilepass, // Jeet@0459
    },
  };

  //in the case of smtp server
  //Kbd@2316@Blind
  /*  let config = {
    host: "mail.pranamindustries.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.sendmileuser,
      pass: process.env.sendmilepass,
    },
  }; */
  let transporter = nodemailer.createTransport(config);

  const setedOTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  let sendHtmlFormofotp = `<div style='width:100%;'><div style='border-radius: 8px;border: 1px solid rgb(220, 220, 220);background-color: rgb(250, 250, 250);padding:20px;'><h5 style="text-align:center;background-color: #ADD8E6;font-size:30px;border-radius: 8px;padding:10px 0;margin-top:0;margin-bottom:20px">Verification Code</h5><p style="text-align:center;font-size:20px;">Here is your verification code <span style="font-weight:700">${setedOTP}</span></p><p style="font-size:12px;color:#aaa;text-align:center;">Note: Make sure not to share this OTP with anyone else as it can be dangerous for your account.</p></div></div>`;

  let message = {
    from: `Kbd Blinds <${process.env.sendmileuser}>`,
    to: userEmail,
    subject: "Verification code for registration account",
    html: sendHtmlFormofotp,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json(setedOTP);
    })
    .catch((error) => {
      return res.status(501).json({ error });
    });
});

// check old password on chnage password
router.put("/CheckOldPass/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("user is not found");
      return;
    }
    const hashpassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECTER
    );
    const Origipassword = hashpassword.toString(CryptoJS.enc.Utf8);

    if (Origipassword === req.body.password) {
      res.status(200).json(true);
    } else {
      res.status(200).json(false);
    }
  } catch (err) {
    res.status(501).json(err);
  }
});

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
      process.env.JWT_SEC_KEY
      /*       { expiresIn: "3d" }
       */
    );
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, aceesTocken });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
