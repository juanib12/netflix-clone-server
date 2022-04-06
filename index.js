const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }, (err) => {
  if (err) return err;
  console.log("conectado a netflix-clone database de mongoDB");
});

require("./middleware/authenticate")
require("./middleware/LocalStrategy")
require("./middleware/JwtStrategy")
const userRouter = require("./routes/userRoutes")

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
};

app.use(cors(corsOptions))
app.use(passport.initialize())

app.use("/user", userRouter)

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`servidor en el puerto ${port}`)
})