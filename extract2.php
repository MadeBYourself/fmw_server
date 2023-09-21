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
    $startTimestamp = strtotime($_GET['start-datetime']) * 1000;
    $response[] = $startTimestamp
    $endTimestamp = (strtotime($_GET['end-datetime']) + 86400) * 1000;
    $response[] = $endTimestamp

    // Consulta SQL para buscar en el rango de tiempo
    $sql = "SELECT latitude, longitude, time_stamp FROM ubication WHERE time_stamp >= $startTimestamp AND time_stamp <= $endTimestamp";
    $result = $conn->query($sql);

    $response = array();  // Array para almacenar los resultados

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $time_stamp = date("Y-m-d H:i:s", $row["time_stamp"] / 1000);  // Convertir el timestamp a formato de fecha y hora
            $entry = array(
                'latitude' => $row["latitude"],
                'longitude' => $row["longitude"],
                //'time_stamp' => $time_stamp
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
