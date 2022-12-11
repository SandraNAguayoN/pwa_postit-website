var url = window.location.href;
var swLocation = '/proyecto-pwa-entrega/sw.js';

if (navigator.serviceWorker) {
    if (url.includes('localhost')) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', () => {

        navigator.serviceWorker.register( swLocation ).then( reg => {
            swReg = reg;
            swReg.pushManager.getSubscription().then( verificaSuscripcion );

        });

    });
}

// Referencias de jQuery
var titulo = $('#titulo');
var tituloModalIcono = $('#titulo-modal-icono');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $("#salir-btn");
var cancelarBtn = $('#cancel-btn');
var postMensajeBtn = $('#post-mensaje-btn');
var postFotoBtn = $('#post-foto-btn');
var postGeoBtn = $('#post-geo-btn');
var avatarSel = $('#seleccion');

var timelineMensajes = $('#timeline-mensajes');
var timelineFotos = $('#timeline-fotos');
var timelineGeos = $('#timeline-geos');

var modal = $('#modal');
var modalAvatar = $('#modal-icono');
var avatarBtns = $('.seleccion-icono');
var txtMensaje = $('#txtMensaje');

var contenidoIconos = $("#contenido-iconos");
// El usuario, contiene el ID del icono seleccionado
var usuario;

//==================FUNCIONES=======================

// Boton de enviar sólo foto
function  mostrarNotificacionMensaje(mensaje, usuario) {
    var dataNot = {
        titulo: "Nuevo mensaje de usuario: "+ usuario,
        cuerpo: mensaje,
        usuario: usuario
    }

    fetch("/api/push", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataNot)
    })
        .then(res => res.json())
        .then(res => console.log("Funciona notificación: ", res))
        .catch(error => console.log("Falla notificación: ", error));

}


function crearMensajeHTML(mensaje, personaje) {

    if(mensaje != undefined && personaje != undefined){
    var content = `
    <li class="animated fadeIn fast"
        data-user="${personaje}"
        data-mensaje="${mensaje}"
        data-tipo="mensaje">


        <div class="icono-mensaje">
            <img src="../img/christmas-icons/${personaje}.png">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3 class="texto-rojo">@${personaje}</h3>
                <br/>
                <p class="texto-verde">${mensaje}</p>
            </div>        
            <div class="arrow"></div>
        </div>
    </li>
    `;
    

    timelineMensajes.prepend(content);
    cancelarBtn.click();
    }

}

function crearMensajeFotoHTML(mensaje, personaje, foto) {

    if(mensaje != undefined && personaje != undefined){
    var content = `
    <li class="animated fadeIn fast"
        data-user="${personaje}"
        data-mensaje="${mensaje}"
        data-tipo="mensaje">


        <div class="icono-mensaje">
            <img src="../img/christmas-icons/${personaje}.png">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3 class="texto-rojo">@${personaje}</h3>
                <br/>
                <p class="texto-verde">${mensaje}</p>
                `;
    

    if (foto) {
        content += `
                <br>
                <img class="foto-mensaje" src="${foto}" style="width: 300; height:300px;">
        `;

    }

    content += `</div>        
                <div class="arrow"></div>
            </div>
        </li>
    `;

    timelineFotos.prepend(content);
    cancelarBtn.click();
    }

}

function crearMensajeGeoHTML(mensaje, personaje, lat, lng) {

    if(mensaje != undefined && personaje != undefined){
        var content = `
        <li class="animated fadeIn fast"
            data-user="${personaje}"
            data-mensaje="${mensaje}"
            data-tipo="mensaje">
    
    
            <div class="icono-mensaje">
                <img src="../img/christmas-icons/${personaje}.png">
            </div>
            <div class="bubble-container">
                <div class="bubble">
                    <h3 class="texto-rojo">@${personaje}</h3>
                    <br/>
                    <p class="texto-verde">${mensaje}</p>
                    </div>        
                    <div class="arrow"></div>
                </div>
            </li>
        `;

    // si existe la latitud y longitud, 
    // llamamos la funcion para crear el mapa
    if (lat) {
        crearMensajeMapa(lat, lng, personaje);
    }

    // Borramos la latitud y longitud 
    lat = null;
    lng = null;

    $('.modal-mapa').remove();

    timelineGeos.prepend(content);
    cancelarBtn.click();
    }
}

// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto'); //Muestra botón de nuevo mensaje
        salirBtn.removeClass('oculto'); //Muestra botón de salir
        timelineMensajes.removeClass('oculto'); //Muestra los mensajes
        timelineFotos.removeClass('oculto'); //Muestra los mensajes
        timelineGeos.removeClass('oculto'); //Muestra los mensajes
        contenidoIconos.addClass('oculto'); //Oculta los iconos 
        modalAvatar.attr('src', '../img/christmas-icons/' + usuario + '.png'); //Agrega icono al modal

    } else {
        nuevoBtn.addClass('oculto'); //Oculta botón de nuevo mensaje
        salirBtn.addClass('oculto'); //Oculta botón de salir
        timelineMensajes.addClass('oculto'); //Oculta los mensajes
        timelineFotos.addClass('oculto'); //Oculta los mensajes
        timelineGeos.addClass('oculto'); //Oculta los mensajes
        contenidoIconos.removeClass('oculto'); //Muestra los iconos 

        titulo.text('');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {
    tituloModalIcono.text('@' + usuario);
    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);
});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    if (!modal.hasClass('oculto')) {
        modal.animate({
            marginTop: '+=1000px',
            opacity: 0
        }, 200, function () {
            modal.addClass('oculto');
            txtMensaje.val('');
        });
    }
});


// Boton de enviar sólo mensaje
postMensajeBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    var dataMensaje = {
        user: usuario,
        mensaje: mensaje
    }

    fetch("/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataMensaje)
    })
        .then(res => res.json())
        .then(res => console.log("Funciona: ", res))
        .catch(error => console.log("Falla: ", error));

    crearMensajeHTML(mensaje, usuario);
    mostrarNotificacionMensaje(mensaje, usuario);

});

// Boton de enviar sólo foto
postFotoBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    var dataFoto = {
        user: usuario,
        mensaje: mensaje,
    }

    fetch("/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFoto)
    })
        .then(res => res.json())
        .then(res => console.log("Funciona: ", res))
        .catch(error => console.log("Falla: ", error));

    crearMensajeFotoHTML(mensaje, usuario, foto);
    mostrarNotificacionMensaje(mensaje, usuario);

});

// Boton de enviar sólo foto
postGeoBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    var dataGeo = {
        user: usuario,
        mensaje: mensaje,
    }

    fetch("/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataGeo)
    })
        .then(res => res.json())
        .then(res => console.log("Funciona: ", res))
        .catch(error => console.log("Falla: ", error));

    crearMensajeGeoHTML(mensaje, usuario, lat, lng);
    mostrarNotificacionMensaje(mensaje, usuario);
});

function listarMensajes() {
    fetch("/api")
        .then(res => res.json())
        .then(datos => {
            console.log(datos);
            datos.forEach(mensaje => {
                if (mensaje.foto == undefined && mensaje.lat == undefined && mensaje.lng == undefined) {
                    crearMensajeHTML(mensaje.mensaje, mensaje.user); //Propiedades que tiene el objeto mensajes al ser convertido a json
                } else if (mensaje.foto != undefined) {
                    crearMensajeFotoHTML(mensaje.mensaje, mensaje.user, mensaje.foto); //Propiedades que tiene el objeto mensajes al ser convertido a json
                } else if (mensaje.lat != undefined && mensaje.lng != undefined) {
                    crearMensajeGeoHTML(mensaje.mensaje, mensaje.user, mensaje.lat, mensaje.lng); //Propiedades que tiene el objeto mensajes al ser convertido a json
                }
            });
        });
}

listarMensajes();

//GEOLOCALIZACIÓN
var googleMapKey = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';
var btnLocation = $("#location-btn");
var modalMapa = $(".modal-mapa");
var lat = null;
var lng = null;
var foto = null;

btnLocation.on("click", () => {
    console.log("geolocalización");

    navigator.geolocation.getCurrentPosition(posicion => {

        console.log(posicion);
        mostrarMapaModal(posicion.coords.latitude, posicion.coords.longitude);

        lat = posicion.coords.latitude;
        lng = posicion.coords.longitude;
    });
});


function mostrarMapaModal(lat, lng) {

    $('.modal-mapa').remove();

    var content = `
            <div class="modal-mapa">
                <iframe
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                    </iframe>
            </div>
    `;

    modal.append(content);
}

function crearMensajeMapa(lat, lng, personaje) {


    let content = `
    <li class="animated fadeIn fast"
        data-tipo="mapa"
        data-user="${personaje}"
        data-lat="${lat}"
        data-lng="${lng}">
                <div class="icono-mensaje">
                    <img src="../img/christmas-icons/${personaje}.png">
                </div>
                <div class="bubble-container">
                    <div class="bubble">
                        <iframe
                            width="100%"
                            height="250"
                            frameborder="0" style="border:0"
                            src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                            </iframe>
                    </div>
                    
                    <div class="arrow"></div>
                </div>
            </li> 
    `;

    timelineGeos.prepend(content);
}

//CAMARA
var btnPhoto = $("#photo-btn");
var btnTomarFoto = $("#tomar-foto-btn");
var contenedorCamara = $(".camara-contenedor");
const camara = new Camara($("#player")[0]);

btnPhoto.on("click", () => {
    console.log("boton camara");
    contenedorCamara.removeClass("oculto");

    camara.encender();

});

btnTomarFoto.on("click", () => {
    foto = camara.tomarFoto();
    console.log(foto);
    camara.apagar();
});


//NOTIFICACIONES
var btnActivadas    = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

function notificarme() {

    // Verificar si el navegador soporta notificaciones
    if ( !window.Notification ) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }

    // Se verifica si ya se tiene permiso para enviar notificaciones
    // existen 3 opciones: granted : se autorizo el permiso para enviar notificaciones, 
    // denied: se denego el permiso aoara enviar notificaciones, default : valor por default
    if ( Notification.permission === 'granted' ) {
        
        enviarNotificacion();

    } else if ( Notification.permission !== 'denied' || Notification.permission === 'default' )  {

        // Se le pide autorizacion al usuario para enviar notificaciones
        Notification.requestPermission( function( permission ) {

            console.log( "Permiso otorgado:", permission );

            // El usuario si acepto el envio de notifcaciones
            if ( permission === 'granted' ) {
                console.log("Si hay permiso");
                enviarNotificacion();
            }

        });

    }
}

if (!url.includes('pages')) {
    notificarme(); //Notificacion de prueba al iniciar la app
}


function enviarNotificacion() {

    const notificationOpts = {
        body: 'Este es el inicio de la aplicación.',
        icon: 'img/icons/72x72.png'
    };

    const n = new Notification('Bienvenido', notificationOpts);

    // Por si se requiere realizar una acción cuando se de clic sobre la notificación
    n.onclick = () => {
        console.log('Le diste clic a la notificación');
    };

}

function verificaSuscripcion( activadas ) {

    // Verificar el estatus para ver que boton se tiene que activar
    if ( activadas ) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');

    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }

}

//verificaSuscripcion();

function getPublicKey() {

    return fetch('api/key')
        .then( res => res.arrayBuffer())
        // returnar arreglo, pero como un Uint8array
        .then( key => new Uint8Array(key) );


}


btnDesactivadas.on( 'click', () => {

    // verificar si ya se registro el service worker
    if ( !swReg ) return console.log('No hay registro de SW');

    getPublicKey().then( key => {

        // Realizar la subscripcion del service worker
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        })
        .then( res => res.toJSON() )
        .then( suscripcion => {

            // Enviar la subscripion al servidor 
            fetch('api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( suscripcion )
            })
            .then( verificaSuscripcion )
            .catch( cancelarSuscripcion );

        });
    });
});

btnActivadas.on( 'click', function() {
    cancelarSuscripcion();
});

function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then( subs => {
        subs.unsubscribe().then( () => verificaSuscripcion(false) );
    });
}



function verificarConexion() {
    if (navigator.onLine) {
        console.log("Si hay conexión :)");
    } else {
        console.log("No hay conexión :(");
    }
}

window.addEventListener("online", verificarConexion);
window.addEventListener("offline", verificarConexion);