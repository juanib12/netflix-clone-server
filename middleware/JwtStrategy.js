const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy, //nos permite autenticar endpoints mediante un token web json.
  ExtractJwt = require("passport-jwt").ExtractJwt; //extraer el json web token
const User = require("../models/users"); //llamar a users.

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // extraer el jwt del encabezado del portador de autenticacion.
                                                                //busca el token dentro de headers authorization: bearer token.
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {

      //buscamos el id del usuario que coincida con el id del usuario que contiene el token.
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);