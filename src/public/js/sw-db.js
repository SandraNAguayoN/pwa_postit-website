let db = new PouchDB("bd-mensajes");

function guardarMensaje(mensaje){
    mensaje._id = new Date().toISOString();
    
    return db.put(mensaje)
    .then(res => {
        console.log("Se guardó en IndexDB");

        self.registration.sync.register("nuevo-mensaje");

        const respuesta = { ok: true, offline: true };

        return new Response(JSON.stringify(respuesta));
    })
    .catch(error => {
        console.log("Falló al guardar", error);
    });
}

function enviarMensajes(){
    let mensajes = [];

    return db.allDocs({include_docs : true }).then(docs => {
        docs.rows.forEach(row => {
            const doc = row.doc;
            const prom = fetch("/api", {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(doc)
            })
            .then(res => {
                db.remove(doc);
            });

            mensajes.push(prom);
        });
        return Promise.all(mensajes);
    });
}