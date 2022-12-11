importScripts("js/pouchdb-7.3.1.min.js");
importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");

const CACHE_STATIC_NAME = "postit-static-v1";
const CACHE_DYNAMIC_NAME = "postit-dynamic-v1";
const CACHE_INMUTABLE_NAME = "postit-inmutable-v1";

const APP_SHELL = [
    //Rutas
    "/",
    "index.html",
    "pages/mensajes.html",
    "pages/fotos.html",
    "pages/geolocalizacion.html",

    //Css
    "css/style.css",
    //"css/tree.css",
    "css/christmas-icons.css",

    //Json
    "manifest.json",

    //Imagenes
    "img/favicon.ico",
    "img/christmas-icons/armchair.png",
    "img/christmas-icons/bauble.png",
    "img/christmas-icons/boy.png",
    "img/christmas-icons/candle.png",
    "img/christmas-icons/candy-1.png",
    "img/christmas-icons/candy-2.png",
    "img/christmas-icons/candy-3.png",
    "img/christmas-icons/candy-cane-1.png",
    "img/christmas-icons/candy-cane-2.png",
    "img/christmas-icons/chimney.png",
    "img/christmas-icons/christmas-bell.png",
    "img/christmas-icons/christmas-day.png",
    "img/christmas-icons/christmas-log.png",
    "img/christmas-icons/christmas-sock.png",
    "img/christmas-icons/christmas-socks.png",
    "img/christmas-icons/christmas-sweater.png",
    "img/christmas-icons/christmas-tree.png",
    "img/christmas-icons/christmas-wreath.png",
    "img/christmas-icons/coffee.png",
    "img/christmas-icons/cookie.png",
    "img/christmas-icons/cupcakes.png",
    "img/christmas-icons/elf.png",
    "img/christmas-icons/fireplace.png",
    "img/christmas-icons/gift.png",
    "img/christmas-icons/gifts.png",
    "img/christmas-icons/gingerbread-house.png",
    "img/christmas-icons/gingerbread-man.png",
    "img/christmas-icons/girl.png",
    "img/christmas-icons/gloves.png",
    "img/christmas-icons/hot-drink.png",
    "img/christmas-icons/lamp.png",
    "img/christmas-icons/mistletoe.png",
    "img/christmas-icons/pine-tree.png",
    "img/christmas-icons/reindeer.png",
    "img/christmas-icons/santa-claus.png",
    "img/christmas-icons/santa-hat.png",
    "img/christmas-icons/sleigh.png",
    "img/christmas-icons/snowball.png",
    "img/christmas-icons/snowflake.png",
    "img/christmas-icons/star.png",
    "img/christmas-icons/toy.png",
    "img/christmas-icons/notifications/notifications-1.png",
    "img/christmas-icons/notifications/notifications-2.png",

    //Scripts
    "js/app.js",
    "js/sw-utils.js",
    "js/sw-db.js",
    "js/snow.js",
    "js/camara-class.js",
    "js/pouchdb-7.3.1.min.js",
];

const APP_SHELL_INMUTABLE = [
    //Css
    //"https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "https://fonts.googleapis.com/css?family=Lobster:400,300",
    "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css",
    //Scripts
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
];

self.addEventListener("install", (evento) => {
    const cacheEstatico = caches.open(CACHE_STATIC_NAME).then((cache) => {
        return cache.addAll(APP_SHELL);
    });

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then((cache) => {
        return cache.addAll(APP_SHELL_INMUTABLE);
    });

    evento.waitUntil(Promise.all([cacheEstatico, cacheInmutable]));
});

self.addEventListener("activate", (evento) => {
    const respuesta = caches.keys().then((llaves) => {
        llaves.forEach((llave) => {
        if (llave !== CACHE_STATIC_NAME && llave.includes("static")) {
            return caches.delete(llave);
        }

        if (llave !== CACHE_DYNAMIC_NAME && llave.includes("dynamic")) {
            return caches.delete(llave);
        }
        });
    });

    evento.waitUntil(respuesta);
});

self.addEventListener("fetch", (evento) => {

    let respuesta;
    if( evento.request.url.includes("/api") ){

        respuesta = manejarPeticionesApi(CACHE_DYNAMIC_NAME, evento.request);

    }else{

        //Estrategia cache first
        respuesta = caches.match(evento.request).then((res) => {
            if (res) {
                verificarCache(CACHE_STATIC_NAME, evento.request, APP_SHELL_INMUTABLE);
                return res;

            } else {
                return fetch(evento.request).then((newRes) => { //Ese elemento no existe en caché y debemos traerlo de la red
                    return actualizaCache(CACHE_DYNAMIC_NAME, evento.request, newRes);
                });
            }
        });
    }

    evento.respondWith(respuesta);
});


self.addEventListener("sync", evento => {
    //console.log("SW: Sync");

    if( evento.tag === "nuevo-mensaje"){
        const respuesta = enviarMensajes();
        evento.waitUntil( respuesta );
    }
} );


// NOTIFICACIONES
self.addEventListener('push', e => {

    const data = JSON.parse( e.data.text() );

    const title = data.titulo;
    const options = {
        body: data.cuerpo,       
        icon: `img/christmas-icons/${ data.usuario }.png`,
        badge: 'img/favicon.ico',
        image: 'img/christmas-icons/notifications/notifications-1.png',
        vibrate: [125,75,125,275,200,275,125,75,125,275,200,600,200,600],
        openUrl: 'https://pwa-postit-website.vercel.app/',
        data: {            
            url: 'https://pwa-postit-website.vercel.app/',
            id: data.usuario
        },
        // accciones personalizadas: editar, eliminar o lo que se requiera
        actions: [
            {
                action: 'star-action',
                title: 'Star',
                icon: 'img/christmas-icons/star.png'
            },
            {
                action: 'candy-1-action',
                title: 'Candy 1',
                icon: 'img/christmas-icons/candy-1.png'
            }
        ]
    };

    e.waitUntil( self.registration.showNotification( title, options) );
});


// Evento para cerrar la notificacion
self.addEventListener('notificationclose', e => {
    console.log('Notificación cerrada', e);
});

// Evento cuando se da clic sobre la notificacion
self.addEventListener('notificationclick', e => {
    // Para tener una mejor refrencia a las opcion de las notificaciones
    const notificacion = e.notification;
    const accion = e.action;

    console.log({ notificacion, accion });

    // obtiene todas las pestañas abiertas en el navegador
    const respuesta = clients.matchAll()
        .then( clientes => {

            let cliente = clientes.find( c => {
                return c.visibilityState === 'visible';
            });

            if ( cliente !== undefined ) {
                cliente.navigate( notificacion.data.url );
                cliente.focus();
            } else {
                clients.openWindow( notificacion.data.url );
            }

            return notificacion.close();
        });

    e.waitUntil( respuesta );
});
