const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

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

User.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
