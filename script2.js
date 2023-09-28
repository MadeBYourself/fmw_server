// Cargar config.json de forma síncrona (bloqueante)
var xhr = new XMLHttpRequest();
xhr.open("GET", "config.json", false); // El tercer parámetro en false indica carga síncrona
xhr.send();

if (xhr.status === 200) {
  var data = JSON.parse(xhr.responseText);
  var name = data.name;
  document.title = name;
  var page_url = 'url2'; // Utiliza la clave "url2" para el URL
  var url = data[page_url]; // Asigna el valor de la URL aquí

  // Obtén el botón por su ID
  var botonRecords = document.getElementById("page_HIST");

  // Agrega un evento clic al botón
  botonRecords.addEventListener("click", function() {
    // Redirecciona a la página de "url2"
    window.location.href = url; // Utiliza el URL almacenado en "url2"
  });
}

// Función para inicializar el mapa
function initMap() {
    var map = L.map('map').setView([10.9639, -74.7964],12);
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    const polyline = L.polyline([], { color: "red" }).addTo(map);
  
    // Escucha los eventos de entrada en los campos de fecha y hora
    document
      .getElementById("start-datetime")
      .addEventListener("input", function (event) {
        const startDateTime = event.target.value;
        document.getElementById("end-datetime").min = startDateTime;
      });
  
    document
      .getElementById("end-datetime")
      .addEventListener("input", function (event) {
        const endDateTime = event.target.value;
        document.getElementById("start-datetime").max = endDateTime;
      });
  
    // Escucha el evento de envío del formulario
    document
      .getElementById("search-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        handleFormSubmit(map, polyline);
      });
  }
  
  // Función para manejar el envío del formulario
  function handleFormSubmit(map, polyline) {
    const startDateTime = document.getElementById("start-datetime").value;
    const endDateTime = document.getElementById("end-datetime").value;
  
    // Hacer una solicitud al servidor para obtener las coordenadas
    const url = `extract2.php?start-datetime=${startDateTime}&end-datetime=${endDateTime}`;
  
    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        if (Array.isArray(response) && response.length > 0) {
          const latlngs = response.map((coord) => [
            parseFloat(coord.latitude),
            parseFloat(coord.longitude),
          ]);
          polyline.setLatLngs(latlngs);
  
          // Centrar el mapa en las coordenadas de la polilínea
          const bounds = polyline.getBounds();
          map.fitBounds(bounds);
        } else {
          console.error("No se encontraron datos en esa fecha");
        }
      })
      .catch((error) =>
        console.error("Error al obtener coordenadas:", error)
      );
  }
  initMap();
  