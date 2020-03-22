// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


//inicializar variables
var app = express();



//body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRouts = require('./routes/login');


//rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRouts);
app.use('/', appRoutes);

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('base de datos: \x1b[32m%s\x1b[0m', ' online');
})


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});