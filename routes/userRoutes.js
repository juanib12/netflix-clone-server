const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser,
} = require("../middleware/authenticate");

//creamos la ruta registracion.
router.post("/signup", (req, res, next) => {
  //verifica que se ingrese un nombre
  if (!req.body.name) {
    res.statusCode = 500;
    res.send({
      name: "name error",
      message: "El nombre es requerido!",
    });
  } else {
    //se llama a la funcion register desde el plugin passportLocalMongoose con nombre de usuario y contraseña.
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.send(err);
        } else {
          user.name = req.body.name;
          user.lastname = req.body.lastname || "";
          user.addres = req.body.addres;
          user.perfilname = req.body.perfilname;
          user.perfilavatar = req.body.perfilavatar;

          //cuando el usuario se registra correctamente generamos el token de autenticacion y el de refresh token.
          const token = getToken({ _id: user._id });
          const refreshToken = getRefreshToken({ _id: user._id });
          //guardamos los datos y el token en la base de datos.
          user.refreshToken.push({ refreshToken });
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.send(err);
            } else {
              //al guardar con existo los datos, se crea la cookie refreshToken y se envia el token de autenticacion en el body de la respuesta.
              res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
              res.send({ success: true, token });
            }
          });
        }
      }
    );
  }
});

//conectamos la strategy autenthicate local. verifica que las credenciales sean validas.
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  //si se inicio sesion correctamente, se genera el token y el refresh token.
  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });
  User.findById(req.user._id).then(
    (user) => {
      //Guardamos el token de actualización en la base de datos y lo configuramos en la cookie de respuesta.
      user.refreshToken.push({ refreshToken });
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.send(err);
        } else {
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
          res.send({ succes: true, token });
        }
      });
    },
    (err) => next(err)
  );
});

router.post("/refreshToken", (req, res, next) => {
  const { signedCookies = {} } = req; //recuperamos el refresh token de las cookies firmadas.
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      //verificamos el refresh token con el token secret de la variable de entorno.
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = payload._id; //extraemos el payload que contiene el id del user.
      User.findOne({ _id: userId }).then(
        (user) => {
          if (user) {
            //buscamos si el refresh token todavia existe en la base de datos
            const tokenIndex = user.refreshToken.findIndex(
              (item) => item.refreshToken === refreshToken
            );
            //en caso de que no haya, error.
            if (tokenIndex === -1) {
              res.statusCode = 401;
              res.send("No autorizado");
            } else {
              const token = getToken({ _id: userId });
              //si existe en la db, lo reemplazamos con el refresh token recien creado.
              const newRefreshToken = getRefreshToken({ _id: userId });
              user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
              user.save((err, user) => {
                if (err) {
                  res.statusCode = 500;
                  res.send(err);
                } else {
                  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                  res.send({ success: true, token });
                }
              });
            }
          } else {
            res.statusCode = 401;
            res.send("No autorizado");
          }
        },
        (err) => next(err)
      );
    } catch (err) {
      res.statusCode = 401;
      res.send("No autorizado");
    }
  } else {
    res.statusCode = 401;
    res.send("No autorizado");
  }
});

//llamamos al middleware verifyuser, que a su vez llamara a jwtstrategy para verificar el jwt y obtener los detalles del usuario.
router.get("/me", verifyUser, (req, res, next) => {
  res.send(req.user);
});


router.get("/logout", verifyUser, (req, res, next) => {
  //extraemos la cookie del refreshToken y la eliminamos de la base de datos.
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  User.findById(req.user._id).then(
    (user) => {
      const tokenIndex = user.refreshToken.findIndex(
        (item) => item.refreshToken === refreshToken
      );

      if (tokenIndex !== -1) {
        user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
      }

      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.send(err);
        } else {
          res.clearCookie("refreshToken", COOKIE_OPTIONS);
          res.send({ success: true });
        }
      });
    },
    (err) => next(err)
  );
});

module.exports = router;
