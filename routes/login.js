var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');


//verificacion de email y contraseña (logueo)
app.post('/', (req, res) => {

    //extraemos el body
    var body = req.body;

    //verificar si existe usuario
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }

        //si no retorna un usuario es porque se equivoco digitando el email
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorretas - email',
                errors: err
            });
        }

        //si no retorna un usuario es porque se equivoco de paswoord
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorretas - password',
                errors: err
            });
        }
        //ocultamos la contraseña
        usuarioDB.password = ':)';


        //si no hay errores ni en el email ni en la contraseña
        //creamos un TOKEN!!!!!
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        //mostramos el token y le usuario
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });


})

module.exports = app;