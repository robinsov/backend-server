var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// ============================================
// busqueda por coleccion
// ============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;

    var promesa;

    switch (tabla) {
        case 'medico':
            promesa = buscarMedicos(busqueda, regex)


            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex)


            break;

        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex)


            break;

        default:
            res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busqueda solo son usuarios medicos y hospitales',
                error: { message: 'tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(400).json({
            ok: true,
            [tabla]: data
        });
    })

});



// ============================================
// Busqueda general
// ============================================
app.get('/todo/:busqueda', (req, res, next) => {

    //obtener la palabra que viene en la peticion es decir lo que viene en lugar de /busqueda 
    var busqueda = req.params.busqueda;

    //crear expresion regular para que deje de ser key sentive con 'i'
    var regex = new RegExp(busqueda, 'i');

    //crear una promesa para poder buscar en todas las tablas al mismo tiempo
    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

//creamos funcion para los hospitales y enviamos el parametro que va a buscar y la expresion regular
function buscarHospitales(busqueda, regex) {

    //retorno de la promesa: hospitales que coinciden con el termino de busqueda
    return new Promise((resolve, reject) => {
        //la funcion .find busca en la columna nombre de los hospitales y regex es para que permita mayusculas o minusculas
        Hospital.find({ nombre: regex })
            //la funcion populate lista los datos que desee entre parentesis.. este en especial muestra el usuario que creo el hospital
            .populate(' usuario', 'nombre')
            //la funcion exec ejecuta la promesa y devuelve lo que encontro
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });

}

//creamos funcion para los medicos y enviamos el parametro que va a buscar y la expresion regular
function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

//creamos funcion para los usuarios y enviamos el parametro que va a buscar y la expresion regular
function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {


        Usuario.find({}, 'nombre email role')
            //con la funcion 'or' puedo buscar en varias columnas la mismo tiempo 
            //en este caso busca por nombre o por email
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })
    });
}



module.exports = app;

//127 video