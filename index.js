const express = require("express"); //framework que nos permite crear web apps, apis.
const cookieParser = require("cookie-parser");//nos permite crear y leer las cookies.
const mongoose = require("mongoose"); //ODM modelado de datos de objeto, nos permite manejar datos, schemas para mongodb.
const cors = require("cors"); //nos permite habilitar la url del frontend para poder realizar las solicitudes.
const passport = require("passport"); //nos permite crear la autenticacion web. En este caso con username y password.
const bodyParser = require("body-parser"); //extrae toda la parte del body de una solicitud entrante y la expone en req.body
require("dotenv").config();

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }, (err) => {
  if (err) return err;
  console.log("conectado a netflix-clone database de mongoDB");
});

require("./middleware/authenticate");
require("./middleware/LocalStrategy");
require("./middleware/JwtStrategy");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(express.json()); //solo devolvera las solicitudes en las que el content-type es tipo json.
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(passport.initialize());

app.use("/user", userRouter);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`servidor en el puerto ${port}`);
});
