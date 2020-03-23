var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var mdAutentificacion = require('../middlewares/autenticacion');




//========================================
//obtener todos los hospitales
//=======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'error cargando hospitales',
                        errors: err
                    });
                }


                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                })

            })
});



//========================================
//actualizar  un  hospital
//========================================
app.put('/:id', mdAutentificacion.verificarToken, (req, res) => {

    //obtener el id de los parametros que envia la ruta
    var id = req.params.id;

    //creamos una instacia del body para obtener los valores del hospital
    var body = req.body;

    //buscamos el hospital y retornamos un error en caso de que el servidor no funcione
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar hospital',
                errors: err
            });
        }

        //verificamos si en realidad existe un hospital con ese id
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id ' + id + 'no existe',
                errors: { message: 'no existe el hospital con ese id' }
            });
        }

        //si el hospital existe asiganmos al hospital los valores que obtuvimos por el body
        hospital.nombre = body.nombre;
        hospital.email = body.img;
        hospital.usuario = req.usuario._id;

        //guardamos el hospital actualizado pero verificamos que el servidor funcione
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar hospital',
                    errors: err
                });
            }
            //si no hay errores

            //hacemos el posteo del hospital
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


//========================================
//crear hospital
//========================================
app.post('/', mdAutentificacion.verificarToken, (req, res) => {

    //extraemos el body
    var body = req.body;

    //creamos un nuevo objeto del tipo Hospital del esquema del mongoose
    var hospital = new Hospital({
        //inicializamos cada uno de los valores 
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id

    });


    //guardammos el hospital
    hospital.save((err, hospitalGuardado) => {
        //capturamos el error si algo sucede
        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'error al crear hospital',
                errors: err
            });
        }

        //si no sucede nada hacemos el posteo del hospital y adicionamente tenemos el hospital que creo un nuevo hospital
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitaltoken: req.hospital
        });
    });
});


//========================================
//borrar un hospital por id
//========================================
app.delete('/:id', mdAutentificacion.verificarToken, (req, res) => {
    var id = req.params.id;

    //buscamos el id que vamos a borrar
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'error al borrar hospital',
                errors: err
            });
        }

        //mejorar el mensaje de error en caso de que no encuentre el id 
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'no existe un hospital con ese id',
                errors: { message: 'no existe el hospital con ese id' }
            });
        }

        //si no sucede nada mostramos el hospital borrado
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;