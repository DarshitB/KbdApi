const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const UserRoute = require("./routes/users");
const AuthRoute = require("./routes/auth");
const ProductRoute = require("./routes/products");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const PriceOfProduct = require("./routes/PriceOfProduct");
const PostalDelivaryCost = require("./routes/PostalDelivaryCost");
const Fabrics = require("./routes/AllFabrics");
var cors = require("cors");
app.use(cors());
dotenv.config();
mongoose
  .connect(process.env.MONGO_UR)
  .then(() => console.log("db connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/product", ProductRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/Fabrics", Fabrics);
app.use("/api/PriceOfProduct", PriceOfProduct);
app.use("/api/PostalDelivaryCost", PostalDelivaryCost);
app.listen(process.env.PORT || 5000, () => {
  console.log("server is establiesd");
});
