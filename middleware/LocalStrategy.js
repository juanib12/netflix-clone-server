const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/users");

//llamada durante el inicio de sesion o registro
passport.use(new LocalStrategy(User.authenticate()));

//llamada despues de iniciar sesion o registrarse para configurar los detalles del usuario en req.user
passport.serializeUser(User.serializeUser());