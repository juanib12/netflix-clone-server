const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose"); //plugin de mongoose el cual nos permite la creacion de un username y password con passport.

//declaramos 2 esquemas, uno para almacenar los refresh Token y otro para almacenar los detalles del usuario.

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const User = new Schema({
  name: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  addres: {
    type: String,
    default: "",
  },
  perfilname: {
    type: Array,
    default: [],
  },
  perfilavatar: {
    type: Array,
    default: [],
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  refreshToken: {
    type: [Session],
  },
});

//se elimina el refreshToken de la funcion toJson, para que no expongamos los refreshTokens del usuario cada vez que serializamos el modelo
//y enviamos los datos en la respuesta de la api.
User.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

//proporciona funciones como autenticar y serializar usuario.
User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
