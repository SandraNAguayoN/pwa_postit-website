
const vapid = require('./vapid.json');
const webpush = require('web-push');

const urlsafeBase64 = require('urlsafe-base64');
const fs = require('fs');
let suscripciones = require('./subs-db.json');


webpush.setVapidDetails(
    'mailto:sandraguay31@gmail.com',
    vapid.publicKey,
    vapid.privateKey
  );

module.exports.getKey = () => {
    //return vapid.publicKey;
    // Regresar de manera segura nuestra vapidkey para utilizar se instala el modulo: npm i url-safe-base64 --save
    return urlsafeBase64.decode( vapid.publicKey );
};

module.exports.addSubscription = ( subscripcion ) => {

    console.log(subscripcion);

    suscripciones.push( subscripcion );

    // escribimos las subscripciones en un archivo para hacerlos persistentes
    fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones) );
};

// configurando nuestro push server
module.exports.sendPush = ( mensaje ) => {

    const notificacionesEnviadas = [];

    suscripciones.forEach( (suscripcion, i) => {

        const pushProm = webpush.sendNotification( suscripcion , JSON.stringify( mensaje ) )
            .then( console.log( 'Notificacion enviada ') )
            .catch( err => {
                console.log('Notificación falló');

                if ( err.statusCode === 410 ) { 
                    suscripciones[i].borrar = true;
                }
            });
        notificacionesEnviadas.push( pushProm );
    });
    Promise.all( notificacionesEnviadas ).then( () => {
        suscripciones = suscripciones.filter( subs => !subs.borrar );
        fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones) );
    });
}

