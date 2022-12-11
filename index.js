const app = require("./src/server/server");

const port = process.env.PORT || 4000;
app.set('port', port);

//Asignación de puerto
app.listen(app.get('port'), () => {
    //console.log("Corriendo en puerto" + app.get('port'));
    console.log("Corriendo en puerto: "+app.get('port'));
});