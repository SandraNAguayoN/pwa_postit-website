const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const rutaPublica = path.resolve(__dirname, "../public");
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(rutaPublica));

const rutas = require("./rutas");
app.use("/api", rutas);

app.listen(port, error => {
    if(error) throw new Error(error);
    console.log(`Servidor corriendo en el puerto ${port}`)
})