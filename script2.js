// Cargar config.json de forma síncrona (bloqueante)
var xhr = new XMLHttpRequest();
xhr.open("GET", "config.json", false); // El tercer parámetro en false indica carga síncrona
xhr.send();
var map = L.map('map').setView([10.9639, -74.7964],12);
var bigCircle;
var smallCircles = [];
var selectedMarker = L.marker([0, 0], { opacity: 0 }).addTo(map);


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
    var b_toggle = document.getElementById("b_toggle")
    document
      .getElementById("search-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        handleFormSubmit(map, polyline);
        if (b_toggle.style.display === "none" || b_toggle.style.display === "") {
          b_toggle.style.display = "block";
        }
      });

  }

  // Función para manejar el envío del formulario
  function handleFormSubmit(map, polyline) {
    const startDateTime = document.getElementById("start-datetime").value;
    const endDateTime = document.getElementById("end-datetime").value;

    // Hacer una solicitud al servidor para obtener las coordenadas
    const url = `extract2.php?start-datetime=${startDateTime}&end-datetime=${endDateTime}`;
    selectedMarker.setOpacity(0)
    slider.value = 0;
    slider2.value = 0;  // Restablecer el valor del slider
    timestampDisplay.innerText = '';
    radiusDisplay.innerText = "";  // Borrar el texto de timestamp
    // Remover los círculos existentes
    bigCircle && map.removeLayer(bigCircle);
    smallCircles.forEach(function(circle) {
        map.removeLayer(circle);
    });
    smallCircles = [];

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
          var container = document.getElementById("container")
          var buttonToggle = document.getElementById("toggleButton")
          if (container.style.display === "none" || container.style.display === "") {
            container.style.display = "flex";
            buttonToggle.style.display = "flex"
          }

        } else {
          alert("No se encontraron datos en esa fecha");
        }
      })
      .catch((error) =>
        console.error("Error al obtener coordenadas:", error)
      );
  }
  // Obtener el contenedor
  var contenedor = document.getElementById('container');

  // Crear el slider
  var slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.value = 0;

  var slider2 = document.createElement("input");
  slider2.type = 'range';
  slider2.min = 0;
  slider2.max = 500;
  slider2.value = 0;


  // Agregar una clase para estilizar el slider con CSS
  slider.classList.add('slider');
  slider2.classList.add("slider");

  // Agregar el slider al contenedor
  contenedor.appendChild(slider);
  contenedor.appendChild(slider2);

  // Crear un elemento para mostrar el timestamp
  var timestampDisplay = document.createElement('div');
  var radiusDisplay = document.createElement ("div");

  // Agregar una clase para estilizar el elemento con CSS
  timestampDisplay.classList.add('time_display');
  radiusDisplay.classList.add("time_display");
  // Agregar el elemento al contenedor
  contenedor.appendChild(timestampDisplay);
  contenedor.appendChild(radiusDisplay);

  // Obtener una referencia al botón
  var toggleButton = document.getElementById('toggleButton');

  // Agregar un evento de escucha al botón
  toggleButton.addEventListener("click", function(){
    var button = document.getElementById('toggleButton');
    if (button.innerText ==='Start Location Search') {
        button.innerText = 'Stop Location Search';
        map.on("click", mapClickHandler);
    } else {
        button.innerText = 'Start Location Search';
        map.off("click", mapClickHandler);
    }
  });
  function mapClickHandler(e) {
    const startDateTime = document.getElementById("start-datetime").value;
    const endDateTime = document.getElementById("end-datetime").value;
    selectedMarker.setOpacity(0)
    slider.value = 0;
      // Restablecer el valor del slider
    timestampDisplay.innerText = '';
      slider2.addEventListener('input', function() {
        radiusDisplay.innerText = "The radius in meters of your next area to pick is: " +slider2.value;
           });
    // Remover los círculos existentes
    bigCircle && map.removeLayer(bigCircle);
    smallCircles.forEach(function(circle) {
        map.removeLayer(circle);
    });
    smallCircles = [];

    bigCircle = L.circle(e.latlng, {
        radius: slider2.value,
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.5
    }).addTo(map);

    // Realizar una solicitud AJAX al archivo PHP
    var requestData = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radius: bigCircle.getRadius(),
        startDateTime,
        endDateTime
    };

    $.ajax({
        url: 'extract3.php',
        type: 'GET',
        data: requestData,
        dataType: 'json',
        success: function(data) {
         if(Array.isArray(data)&& data.length > 0){
          console.log('Time_stamps dentro del círculo y lapso de tiempo:', data);

          // Mostrar los puntos en el mapa
          for (var i = 0; i < data.length; i++) {
              var point = data[i];
              var latLng = L.latLng(point.latitude, point.longitude);
              var circle = L.circle(latLng, {
                radius: 1, // Radio del círculo (ajusta según tu preferencia)
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.5
              }).addTo(map);
            circle.timestamp = point.time_stamp;
            smallCircles.push(circle);
          }

        // Actualizar el valor máximo del slider según la cantidad de timestamps
        slider.max = data.length - 1;

        // Asociar evento al slider para actualizar el timestamp y resaltar el círculo
        slider.addEventListener('input', function() {
            var selectedTimestamp = data[this.value].time_stamp;
            timestampDisplay.innerHTML = 'Date: ' + selectedTimestamp;

            // Remover el resaltado de los círculos
            smallCircles.forEach(function(circle) {
                circle.setStyle({ color: 'red' });
            });

            // Resaltar el círculo correspondiente al timestamp seleccionado
            var selectedCircle = smallCircles.find(function(circle) {
                return circle.timestamp === selectedTimestamp;
            });
            if (selectedCircle) {
                selectedCircle.setStyle({ color: 'black' });
                selectedMarker.setLatLng(selectedCircle.getLatLng()).setOpacity(1);
            }
        });
      }else{
        alert("there is no data on this area");
      };
    },
    error: function(xhr, status, error) {
        console.error('Error al obtener los datos:', error);
    }
});
}

initMap();
