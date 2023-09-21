var map = L.map('map').setView([0, 0], 13); // Inicializa el mapa centrado en coordenadas [0, 0] y con zoom 13
var polyline = L.polyline([]).addTo(map); // Inicializa la polilínea vacía
var coordinates = []; // Matriz para almacenar las coordenadas del recorrido

// Agrega una capa de mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Función para cargar y mostrar los últimos datos desde el servidor
function cargarUltimosDatos() {
    $.ajax({
        url: '/extract.php', // Reemplaza con la URL correcta
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (typeof data == 'object' && data !== null) {
                // Mostrar los últimos datos
                $('#latitude').text(data.latitude);
                $('#longitude').text(data.longitude);

                // Convertir la cadena de timestamp a un número (entero)
                var timestamp = parseInt(data.time_stamp);

                // Verificar si la conversión fue exitosa
                if (!isNaN(timestamp)) {
                    // Crear un objeto Date a partir del timestamp
                    var fecha = new Date(timestamp);
                    var formattedTime = fecha.toLocaleString(); // Formatear la fecha y hora

                    $('#time_stamp').text(formattedTime);
                } else {
                    $('#time_stamp').text('Timestamp inválido'); // Manejar el caso de conversión fallida
                }

                $('#error_message').text('');

                // Actualizar la posición del marcador en el mapa
                var latlng = L.latLng(data.latitude, data.longitude);
                marker.setLatLng(latlng).update();

                // Agregar las coordenadas a la matriz
                coordinates.push(latlng);
                polyline.setLatLngs(coordinates); // Actualizar la polilínea

                map.setView(latlng); // Centrar el mapa en las nuevas coordenadas
            } else {
                $('#error_message').text('Error: Datos en formato incorrecto.');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar los últimos datos:');
            console.error('Estado (status): ' + status);
            console.error('Error (error): ' + error);
            $('#error_message').text('Error al cargar los datos. Verifique la direccion o que hayan datos en la DB')
        }
    });
}

// Crear un marcador en el mapa (inicialmente en [0, 0])
var marker = L.marker([0, 0]).addTo(map);

// Cargar los últimos datos al cargar la página
cargarUltimosDatos();

// Actualizar los últimos datos cada 2 segundos
setInterval(cargarUltimosDatos, 2000); // 5000 ms = 5 segundos

// Función para reiniciar la polilínea
function reiniciarYCrearPolilinea() {
    coordinates = []; // Vaciar la matriz de coordenadas
    polyline.setLatLngs(coordinates); // Limpiar la polilínea en el mapa
}


// Función para alternar la visibilidad de la sección RTL
function toggleVisibility(sectionId) {
    var section = document.getElementById(sectionId);
    var otherSectionId = sectionId === 'RTL' ? 'History' : 'RTL';
    var otherSection = document.getElementById(otherSectionId);

    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'flex'; // Mostrar la sección seleccionada
        otherSection.style.display = 'none'; // Ocultar la otra sección
    } else {
        section.style.display = 'none'; // Ocultar la sección seleccionada
    }
}

// Agregar eventos de clic a los botones para alternar la visibilidad
document.getElementById('toggleRTL').addEventListener('click', function () {
    toggleVisibility('RTL');
});

document.getElementById('HIST').addEventListener('click', function () {
    toggleVisibility('History');
});

