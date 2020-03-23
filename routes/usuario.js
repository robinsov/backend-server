var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var mdAutentificacion = require('../middlewares/autenticacion');
var bcrypt = require('bcryptjs');



//========================================
//obtener todos los usuarios
//=======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                })


            })

});




//========================================
//actualizar  un  usuario
//========================================
app.put('/:id', mdAutentificacion.verificarToken, (req, res) => {

    //obtener el id de los parametros que envia la ruta
    var id = req.params.id;

    //creamos una instacia del body para obtener los valores del usuario
    var body = req.body;

    //buscamos el usuario y retornamos un error en caso de que el servidor no funcione
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }

        //verificamos si en realidad existe un usuario con ese id
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id ' + id + 'no existe',
                errors: { message: 'no existe el uusario con ese id' }
            });
        }

        //si el usuario existe asiganmos al usuario los valores que obtuvimos por el body
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //guardamos el usuario actualizado pero verificamos que el servidor funcione
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar usuario',
                    errors: err
                });
            }
            //si no hay errores
            //cambiamos la contraseña para que nadie la vea
            usuarioGuardado.password = ':)';

            //hacemos el posteo del usuario
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});


//========================================
//crear usuario
//========================================
app.post('/', mdAutentificacion.verificarToken, (req, res) => {

    //extraemos el body
    var body = req.body;

    //creamos un nuevo objeto del tipo Usuario del esquema del mongoose
    var usuario = new Usuario({
        //inicializamos cada uno de los valores 
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });



    //guardammos el usuario
    usuario.save((err, usuarioGuardado) => {
        //capturamos el error si algo sucede
        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'error al crear usuario',
                errors: err
            });
        }

        //si no sucede nada hacemos el posteo del usuario y adicionamente tenemos el usuario que creo un nuevo usuario
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});


//========================================
//borrar un usuario por id
//========================================
app.delete('/:id', mdAutentificacion.verificarToken, (req, res) => {
    var id = req.params.id;

    //buscamos el id que vamos a borrar
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'error al borrar usuario',
                errors: err
            });
        }

        //mejorar el mensaje de error en caso de que no encuentre el id 
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'no existe un usuario con ese id',
                errors: { message: 'no existe el uusario con ese id' }
            });
        }

        //si no sucede nada mostramos el usuario borrado
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;