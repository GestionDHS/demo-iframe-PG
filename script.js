//archivo pgEvent.js ------
const ID = "id"

class PgEvent {
  constructor() {
    this.data = {
      type: "blockly-type",
      event: 0,
      message: "",
      id: "",
      state: "",
    };
  }

  getValues() {
    const url = document.location.href;
    const paths = url.split("?");
    //console.log(paths)
    if (paths.length < 2) {
      return;
    }

    const queryStrings = paths[1].split("&")
    for (const qs of queryStrings) {
      if (qs.length < 2) {
        continue;
      }

      const values = qs.split("=");
      if (values.length < 2) {
        continue;
      }
      switch (values[0]) {
        case ID:
          this.data[ID] = values[1];
          break;
      }
    }
  }

  onSuccessEvent(message) {
    this.data["event"] = "SUCCESS";
    this.data["message"] = message;
    window.top.postMessage(this.data, "*");
  }

  onFailEvent(message,rasones) {
    this.data["event"] = "FAILURE";
    this.data["message"] = message;
    this.data["reasons"] = rasones;
    window.top.postMessage(this.data, "*");
  }

  sendState(state) {
    console.log(state)
    this.data["event"] = "STATE"
    this.data["state"] = state
    window.top.postMessage(this.data, "*");
  }
}
const pgEvent = new PgEvent()
window.onload = pgEvent.getValues();
// Fin de archivo pgEvent.js -----------


//Comienzo de la instanciacion de la actividad --------------------------

function comprobarRespuesta() {

  let listaErrores = [];
  let reaseons = [];
  // OBTENER RESPUESTAS ESTUDIANTE (FRONT)
  const respuestas = [];
  respuestas[0] = document.getElementById("pregunta-1").value;
  respuestas[1] = document.getElementById("pregunta-2").value;
  respuestas[2] = document.getElementById("pregunta-3").value;

  //Enviamos a PG las respuestas
  pgEvent.sendState(JSON.stringify({"respuestas": respuestas}))
  console.log("respuestas: " + respuestas.join('-'))

  // VALIDAR RESPUESTAS ESTUDIANTE (FRONT)

  if (respuestas[0].toUpperCase() != "BUENOS AIRES") {
    listaErrores.push("¡Cuidado! La capital de Argentina no es " + respuestas[0]);
  }

  if (respuestas[1] != 4) {
    listaErrores.push("¡Cuidado! 2+2 no es " + respuestas[1]);
  }

  if (respuestas[2].toUpperCase() != "BLANCO") {
    listaErrores.push("¡Cuidado! El caballo de San Martín no era de color " + respuestas[2])
  }

  // Enviamos el STATUS y MENSAJE a exponer al back de PG

  if (listaErrores.length === 0) {
    // envio en el onSuccessEvent el texto que quiero que aparezca en PG arriba
    pgEvent.onSuccessEvent("¡Has completado correctamente el cuestionario!")
    console.log(listaErrores)
  } else {
    // envio en el onFailEvent el texto que quiero que aparezca en PG arriba
    pgEvent.onFailEvent(listaErrores.join(),rasones)
    console.log(listaErrores.join())
  }  
}

// RECUPERARMOS RESPUESTA ANTERIOR, previamente enviada al back de PG

let respuestasPrecargadas = "";

window.addEventListener('message', function (event) {
  if (isValidInitialEvent(event)) {
    respuestasPrecargadas = validateJson(event.data.data) ? event.data.data : false;
    console.log("recibiendo: "+ respuestasPrecargadas)
    //Cargamos los inputs con las respuestas que fueron previamente guardadas
    if(respuestasPrecargadas){
      cargarRespuestasAnteriores(JSON.parse(respuestasPrecargadas))
    }
    
  } else {
    console.log("no escucha message desde PG")
  }

});

const isValidInitialEvent = (event) => {
  return event?.data?.data && event?.data?.type === 'init'
    && typeof event.data.data == "string"
}

const validateJson = (json) => {
  try {
    return !!JSON.parse(json)
  } catch (error) {
    console.error("Invalid provided json:", error.message)
    return null
  }
}


// SETEAR EVENTO LOAD PÁGINA - REESTABLECER RESPUESTA ANTERIOR PG
// Setear evento de reestablecimiento respuesta anterior en el load.


//Fin de la instanciacion de la actividad --------------------------

function cargarRespuestasAnteriores(respuestas){
  document.getElementById("pregunta-1").value = respuestas.respuestas[0]
  document.getElementById("pregunta-2").value = respuestas.respuestas[1]
  document.getElementById("pregunta-3").value = respuestas.respuestas[2]
}