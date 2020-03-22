var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

//========================================
//verificar token
//========================================
exports.verificarToken = function(req, res, next) {

    //leer el token
    var token = req.query.token;

    //verificar si es valido en caso de no serlo los demas metodos dejan de funcionar (put, post, delete)
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        //tener el usuario que hizo la peticion de verificacion de token
        req.usuario = decoded.usuario;

        //con la funcion next() le decimos que puede continuar si no hay un error verificando el token
        next();
    });
}