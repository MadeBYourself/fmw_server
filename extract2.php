<?php
// Leer datos de configuración desde config.ini
$config = parse_ini_file('config.ini');

$servername = $config['host'];
$username = $config['username'];
$password = $config['password'];
$dbname = $config['dbname'];

// Establecer la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Fallo la conexión: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET['start-datetime']) && isset($_GET['end-datetime'])) {
     $startTimestamp = (strtotime($_GET['start-datetime']) + 18000 )* 1000;
    $endTimestamp = (strtotime($_GET['end-datetime']) + 18000) * 1000;

    // Consulta SQL para buscar en el rango de tiempo
    $sql = "SELECT latitude, longitude FROM ubication WHERE time_stamp >= $startTimestamp AND time_stamp <= $endTimestamp";
    $result = $conn->query($sql);

    $response = array();  // Array para almacenar los resultados

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $entry = array(
                'latitude' => $row["latitude"],
                'longitude' => $row["longitude"], 
            );
            $response[] = $entry;
        }
    } else {
        $response['error'] = "No se encontraron datos en el rango de fechas seleccionado.";
    }
    // Establecer las cabeceras para indicar que se envía JSON
    header('Content-Type: application/json');

    // Convertir el array a JSON y mostrarlo
    echo json_encode($response);
}

$conn->close();
?>
