const passport = require("passport");
const jwt = require("jsonwebtoken");

//se usa para crear la cookie del refresh token
exports.COOKIE_OPTIONS = {
  httpOnly: true, //Ya que localhost no contiene httpS
  secure: true, //segura para que el javascript del cliente no pueda leerla.
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000, //calcula el tiempo de expiracion de la cookie.
  sameSite: "None", //ya que el servidor y el backend estan en diferentes dominios.
};

//se utiliza para crear el jwt.
exports.getToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  });
};

//se utiliza para crear el refresh token, que tambien es un jwt.
exports.getRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });
  return refreshToken;
};

//middleware que debe llamarse para cada solicitud que requiera autenticacion.
exports.verifyUser = passport.authenticate("jwt", { session: false });
