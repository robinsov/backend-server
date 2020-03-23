var express = require('express');

//importar libreria para que subir archivos a la base de datos 
var fileUpload = require('express-fileupload');

var app = express();
var fs = require('fs');

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
//opciones por defecto
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;


    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }

    // ===============================
    //       validacion de archivo
    // ===============================
    //si no viene ningun archivo en la peticion 'req' mandamos los errores 
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //obtener nombre del archivo por medio de la peticion 'req' llamada = (imagen)
    var archivo = req.files.imagen
        //cortamos el nombre del archivo
    var nombreCortado = archivo.name.split('.');
    //obtenemos la extension del archivo
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //solo estas extensiones son permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //verificamos que el archivo tenga una extension valida
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(',') }
        });
    }


    // ======================================
    //       fin validacion de archivo
    // ======================================

    // personalizar nombre del archivo subido para evitar conflictos
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    //mover el archivo del termporal a un path es decir a una ruta donde van a quedar las imagenes
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    //movemos el archivo a la ruta 'path' y verificamos si hay errores 
    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al mover el archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);

        //si no hay error presetamos los datos que se movieron
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    })



});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        //buscar si exite alguien con ese id
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'usuario no existe',
                    errors: { message: 'usuario no exixte' }
                });
            }

            //verificamos si en la ruta ya existe alguna imagen para borrarla que y quedarnos con la nueva
            var pathViejo = './uploads/usuarios/' + usuario.img;
            //si existe elimina la anterior y se queda la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            //guardamos en la base de datos es decir en usuario.img el nombre del archivo nuevo
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                // si no hay error presetamos los datos que se movieron
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualziada',
                    usuario: usuarioActualizado
                });
            })

        });
    }


    if (tipo === 'medicos') {
        //buscar si exite alguien con ese id
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no exixte' }
                });
            }

            //verificamos si en la ruta ya existe alguna imagen para borrarla que y quedarnos con la nueva
            var pathViejo = './uploads/medicos/' + medico.img;
            //si existe elimina la anterior y se queda la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            //guardamos en la base de datos es decir en medico.img el nombre del archivo nuevo
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                // si no hay error presetamos los datos que se movieron
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualziada',
                    medico: medicoActualizado
                });
            })

        });

    }



    if (tipo === 'hospitales') {
        //buscar si exite alguien con ese id
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no exixte' }
                });
            }

            //verificamos si en la ruta ya existe alguna imagen para borrarla que y quedarnos con la nueva
            var pathViejo = './uploads/hospitales/' + hospital.img;
            //si existe elimina la anterior y se queda la nueva
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            //guardamos en la base de datos es decir en hospital.img el nombre del archivo nuevo
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                // si no hay error presetamos los datos que se movieron
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualziada',
                    hospital: hospitalActualizado
                });
            })

        });

    }
}


module.exports = app;