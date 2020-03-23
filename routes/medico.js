var express = require('express');
var app = express();
var Medico = require('../models/medico');
var mdAutentificacion = require('../middlewares/autenticacion');




//========================================
//obtener todos los medicos
//=======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })
            })
});



//========================================
//actualizar  un  medico
//========================================
app.put('/:id', mdAutentificacion.verificarToken, (req, res) => {

    //obtener el id de los parametros que envia la ruta
    var id = req.params.id;

    //creamos una instacia del body para obtener los valores del medico
    var body = req.body;

    //buscamos el medico y retornamos un error en caso de que el servidor no funcione
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar medico',
                errors: err
            });
        }

        //verificamos si en realidad existe un medico con ese id
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id ' + id + 'no existe',
                errors: { message: 'no existe el medico con ese id' }
            });
        }

        //si el medico existe asiganmos al medico los valores que obtuvimos por el body
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        //guardamos el medico actualizado pero verificamos que el servidor funcione
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar medico',
                    errors: err
                });
            }
            //si no hay errores

            //hacemos el posteo del medico
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


//========================================
//crear medico
//========================================
app.post('/', mdAutentificacion.verificarToken, (req, res) => {

    //extraemos el body
    var body = req.body;

    //creamos un nuevo objeto del tipo Medico del esquema del mongoose
    var medico = new Medico({
        //inicializamos cada uno de los valores 
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });


    //guardammos el medico
    medico.save((err, medicoGuardado) => {
        //capturamos el error si algo sucede
        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'error al crear medico',
                errors: err
            });
        }

        //si no sucede nada hacemos el posteo del medico y adicionamente tenemos el medico que creo un nuevo hospital
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: req.medico
        });
    });
});


//========================================
//borrar un medico por id
//========================================
app.delete('/:id', mdAutentificacion.verificarToken, (req, res) => {
    var id = req.params.id;

    //buscamos el id que vamos a borrar
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'error al borrar medico',
                errors: err
            });
        }

        //mejorar el mensaje de error en caso de que no encuentre el id 
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'no existe un medico con ese id',
                errors: { message: 'no existe el medico con ese id' }
            });
        }

        //si no sucede nada mostramos el medico borrado
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;